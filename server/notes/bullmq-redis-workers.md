# BullMQ, Redis & workers — notes

Reference for interview prep. This project uses **one Redis instance** (`REDIS_URL`) for **three separate concerns** — read them **in order**.

**Read order:** Topic 1 (queues) → Topic 2 (cache) → Topic 3 (rate limits) → Appendix (cheat sheet)

---

## Index

Line numbers match this file. **Read top to bottom** — finish Topic 1 before Topic 2, Topic 2 before Topic 3.

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| — | [Overview](#overview) | 76 |
| **1** | [Redis as message broker (BullMQ)](#topic-1--redis-as-message-broker-bullmq) | 118 |
| **2** | [Redis as application cache](#topic-2--redis-as-application-cache) | 449 |
| **3** | [Redis as rate limit store](#topic-3--redis-as-rate-limit-store) | 541 |
| — | [Appendix](#appendix) | 616 |

### Topic 1 — Message broker (read first)

| Section | Line |
|---------|------|
| [Why not do everything in the HTTP request?](#why-not-do-everything-in-the-http-request) | 128 |
| [Producer vs consumer](#producer-vs-consumer) | 146 |
| [Connection & enablement](#connection--enablement) | 158 |
| [Queue 1 — Email](#queue-1--email) | 192 |
| [Queue 2 — Maintenance (cron)](#queue-2--maintenance-cron) | 269 |
| [Fallback when Redis is missing](#fallback-when-redis-is-missing) | 330 |
| [Why API and worker are separate](#why-api-and-worker-are-separate) | 350 |
| [What Redis stores (`bull:*` keys)](#what-redis-stores-bull-keys) | 362 |
| [Job lifecycle](#job-lifecycle) | 376 |
| [Cron: BullMQ vs alternatives](#cron-bullmq-vs-alternatives) | 393 |
| [End-to-end diagrams](#end-to-end-diagrams-topic-1) | 404 |
| [Topic 1 — scaling](#topic-1--scaling) | 429 |
| [Topic 1 — testing](#topic-1--testing) | 437 |

### Topic 2 — Application cache (read second)

| Section | Line |
|---------|------|
| [What it does](#what-it-does-topic-2) | 459 |
| [How it works — enrollments example](#how-it-works--enrollments-example) | 472 |
| [Cache invalidation](#cache-invalidation) | 498 |
| [vs in-memory cache](#vs-in-memory-cache) | 512 |
| [vs HTTP cache](#vs-http-cache) | 524 |
| [Topic 2 — scaling](#topic-2--scaling) | 530 |

### Topic 3 — Rate limit store (read third)

| Section | Line |
|---------|------|
| [What it does](#what-it-does-topic-3) | 551 |
| [Login vs global limiters](#login-vs-global-limiters) | 569 |
| [Health check exception](#health-check-exception) | 589 |
| [Topic 3 — scaling](#topic-3--scaling) | 595 |
| [Topic 3 — testing](#topic-3--testing) | 602 |

### Appendix

| Section | Line |
|---------|------|
| [File map](#file-map) | 622 |
| [Common misconceptions](#common-misconceptions) | 661 |
| [Interview cheat sheet](#interview-cheat-sheet) | 674 |
| [Related notes](#related-notes) | 693 |
| [Further reading](#further-reading) | 702 |

[↑ Back to top](#bullmq-redis--workers--notes)

---

## Overview

One Redis server, three client libraries, three key namespaces:

| # | Role | Library | Keys / prefix | Entry file | Used by |
|---|------|---------|---------------|------------|---------|
| **1** | Message broker | BullMQ | `bull:email:*`, `bull:maintenance:*` | `queueConnection.js` | API (producer) + Worker (consumer) |
| **2** | Application cache | `redis` package | `enrollments:list`, etc. | `redis-cache.js` | API routes only |
| **3** | Rate limit store | `rate-limit-redis` | `rl:login:*`, `rl:global:*` | `rateLimit.js` | API middleware only |

```text
Same Redis instance (REDIS_URL)
    ├── Topic 1  BullMQ        (queueConnection.js)  — jobs, cron, retries
    ├── Topic 2  redis-cache   (redis-cache.js)      — GET/SET cached query results
    └── Topic 3  rate-limit    (rateLimit.js)        — sliding window counters
```

```text
┌─────────────────────────────────────────────────────────────────┐
│  docker-compose                                                 │
│                                                                 │
│  ┌──────────┐    Topic 1        ┌──────────┐    Topic 1       │
│  │   api    │ ──enqueue job───► │  Redis   │ ◄──Worker polls── │
│  │ index.js │                   │  :6379   │                   │
│  │ Express  │ ──Topic 2 cache──►│          │   ┌──────────┐   │
│  └──────────┘ ──Topic 3 limits─►│ bull:*   │   │  worker  │   │
│                                  │ enroll:* │   │ worker.js│   │
│                                  │ rl:*     │   └──────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

| Process | Topic 1 (broker) | Topic 2 (cache) | Topic 3 (rate limits) |
|---------|------------------|-----------------|----------------------|
| **API** (`index.js`) | Producer — `q.add()` | `get` / `set` / `del` | Enforces limits |
| **Worker** (`worker.js`) | Consumer — polls queue | — | — |

**Why three client files?** BullMQ manages its own connection lifecycle. Same **server**, different **libraries** and **key namespaces**.

**Start reading:** [Topic 1 — Message broker](#topic-1--redis-as-message-broker-bullmq)

---

# Topic 1 — Redis as message broker (BullMQ)

> **Redis use #1** · Library: `bullmq` · Keys: `bull:*` · Files: `queueConnection.js`, `emailQueue.js`, `maintenanceQueue.js`, `worker.js`
>
> **One-liner:** Producer enqueues work → Redis stores the job → Worker picks it up. BullMQ wraps Redis — no `redis.get()` in handlers, but every job, retry, and cron schedule lives in Redis.

[↑ Index](#index) · **Next topic:** [Topic 2 — Application cache](#topic-2--redis-as-application-cache)

---

## Why not do everything in the HTTP request?

Without a queue, register would look like:

```text
POST /register → INSERT user → send email (wait 2–5 sec) → respond 201
```

| Problem | With queue (Topic 1) |
|---------|----------------------|
| User waits for SMTP | API responds immediately after enqueue |
| Email API slow/down | Request doesn't hang or fail registration |
| Spike of signups | Jobs buffer in Redis; worker processes at its pace |
| Retries | BullMQ retries failed sends (`attempts: 3`) |
| Separation | API handles HTTP; worker handles slow I/O |

---

## Producer vs consumer

| Role | What it is | In this project | Runs in |
|------|------------|-----------------|---------|
| **Producer** | Adds jobs to a queue | `Queue` + `q.add(...)` | API (`index.js`) |
| **Consumer** | Pulls jobs and runs handlers | `Worker` + async handler | Worker (`worker.js`) |
| **Broker** | Stores and delivers jobs | **Redis** via BullMQ | `redis` container |

**Producer** only `await`s `q.add()` (~milliseconds — writing to Redis). **Consumer** runs independently — different machine, scaled to N replicas, restarted without touching the API.

---

## Connection & enablement

**`server/lib/queueConnection.js`:**

```js
export function getQueueConnection() {
    return { url: process.env.REDIS_URL };
}

export function isQueueEnabled() {
    if (process.env.NODE_ENV === "test") return false;
    return Boolean(process.env.REDIS_URL);
}
```

| Condition | Behavior |
|-----------|----------|
| `REDIS_URL` set | Queues + workers active |
| `NODE_ENV=test` | Queues disabled — tests don't need Redis/worker |
| No `REDIS_URL` | Worker exits; email falls back to inline send |

**Worker hard requirement:**

```js
if (!isQueueEnabled()) {
    console.error("REDIS_URL required to run email Worker. Exiting.");
    process.exit(1);
}
```

No Redis = no worker. **Interview trap:** *"Workers don't use Redis"* → wrong. BullMQ **is** Redis.

---

## Queue 1 — Email

### Flow: user registers

```text
1. POST /api/auth/register
2. auth.js → INSERT user → JWT verify token
3. enqueueVerificationEmail(email, token)
4. emailQueue.js → q.add("send-verification", { email, token })
5. Job stored in Redis (queue: "email")
6. API returns 201 immediately

   ... later, in worker process ...

7. emailWorker blocking-reads Redis
8. Handler: sendEmailForVerification(email, token)
9. Job marked completed (or failed → retry)
```

### Producer code path

**Route** (`server/routes/auth.js`):

```js
await enqueueVerificationEmail(email, token);
res.status(201).json({ info: "Email send. Please verify." });
```

Also called from `POST /resend-email`.

**Queue module** (`server/queues/emailQueue.js`):

```js
queue = new Queue("email", {
    connection: getQueueConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false
    }
});

await q.add("send-verification", { email, token });
```

| Option | Meaning |
|--------|---------|
| `attempts: 3` | Retry up to 3 times on failure |
| `backoff: exponential, 2000ms` | Wait 2s, 4s, 8s between retries |
| `removeOnComplete: true` | Don't keep finished jobs in Redis |
| `removeOnFail: false` | Keep failed jobs for debugging |

### Consumer code path

**Worker** (`server/worker.js`):

```js
const emailWorker = new Worker("email", async (job) => {
    if (job.name === "send-verification") {
        const { email, token } = job.data;
        await sendEmailForVerification(email, token);
    }
}, { connection: getQueueConnection() });
```

**Job name matching:** Producer adds `"send-verification"`; handler checks `job.name`.

### Event listeners

```js
emailWorker.on("failed", (job, err) => { /* log */ });
emailWorker.on("completed", (job) => { /* log */ });
```

---

## Queue 2 — Maintenance (cron)

### Flow: daily token cleanup

```text
1. worker.js starts
2. scheduleMaintenanceJobs() runs once
3. queue.add("cleanup-expired-tokens", {}, { repeat: { pattern: "0 3 * * *" }, jobId: "..." })
4. BullMQ stores cron schedule in Redis

   ... every day at 3:00 AM UTC ...

5. BullMQ enqueues job into "maintenance" queue
6. maintenanceWorker picks it up
7. cleanupExpiredTokensJob() → deleteExpiredRefreshTokens() → DELETE FROM refresh_tokens ...
```

### Schedule registration

**`server/jobs/scheduleMaintenanceJobs.js`:**

```js
await queue.add("cleanup-expired-tokens", {}, {
    repeat: { pattern: "0 3 * * *" },  // cron: daily 3 AM UTC
    jobId: "cleanup-expired-tokens-daily",
});
```

| Piece | Why it matters |
|-------|----------------|
| `repeat.pattern` | Standard cron syntax; BullMQ uses `cron-parser` |
| `jobId` | **Idempotent** — worker restart won't duplicate the schedule |
| Called on worker startup | Same `jobId` = update, not duplicate |

### Consumer

```js
const maintenanceWorker = new Worker("maintenance", async (job) => {
    if (job.name === "cleanup-expired-tokens") {
        return cleanupExpiredTokensJob();
    }
}, { connection: getQueueConnection() });
```

### Job → service → DB

```text
jobs/cleanupExpiredTokens.js     ← thin wrapper
    └── services/refreshTokenService.js  ← DELETE FROM refresh_tokens WHERE expires_at < NOW()
```

Workers call **services**, not route handlers.

### Manual run

```bash
node server/scripts/expired-token.js
```

---

## Fallback when Redis is missing

**`emailQueue.js`:**

```js
if (!q) {
    await sendEmailForVerification(email, token);  // synchronous in request
    return;
}
```

| Mode | Email behavior | Worker needed? |
|------|----------------|----------------|
| Redis + worker running | Async via queue | Yes |
| No Redis (tests/local) | Inline in API request | No |

Maintenance cron has **no fallback** — if Redis is off, cleanup doesn't run on a schedule.

---

## Why API and worker are separate

| | API (`index.js`) | Worker (`worker.js`) |
|---|------------------|----------------------|
| Entry | `npm run dev` / `npm start` | `npm run worker` |
| Listens on | HTTP port 5001 | Nothing (polls Redis) |
| Scales for | Request throughput | Job throughput |

Scaling API to 3 replicas **does not** run cron 3× — only the worker handles maintenance. Scaling workers to 2 **does** share the same queue.

---

## What Redis stores (`bull:*` keys)

```text
bull:email:id              — job ID counter
bull:email:wait            — pending jobs
bull:email:active          — jobs being processed
bull:email:failed          — failed jobs
bull:maintenance:repeat    — repeatable job definitions (cron)
```

You don't manage these — BullMQ does. Under the hood: blocking pops, hashes, sorted sets.

---

## Job lifecycle

```text
          q.add()
             │
             ▼
         [ waiting ]  ──► Worker picks up ──► [ active ]
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              [ completed ]    [ failed ]      [ stalled ]
                              removeOnComplete  retry if       worker died
                              = true → gone     attempts left   mid-job
```

---

## Cron: BullMQ vs alternatives

| Approach | This project | Pros | Cons |
|----------|--------------|------|------|
| **BullMQ repeatable** | **Yes** | Same infra as email; Redis-backed | Worker must be running |
| **OS crontab** | No | Simple | Tied to one machine |
| **node-cron** | No | In-process | Dies with process; duplicates across API instances |
| **Scheduled Lambda** | Notes only | Serverless | Different infra |

---

## End-to-end diagrams (Topic 1)

### Email job

```text
Client                API (producer)           Redis              Worker (consumer)
  │                        │                     │                      │
  │ POST /register         │                     │                      │
  │───────────────────────►│                     │                      │
  │                        │ q.add(...)          │                      │
  │                        │────────────────────►│ store job            │
  │◄───────────────────────│ 201 (immediate)     │                      │
  │                        │                     │◄─────────────────────│ poll
  │                        │                     │─────────────────────►│ sendEmail()
```

### Cron job

```text
Worker startup → scheduleMaintenanceJobs() → Redis (repeat schedule)
   ... 3 AM UTC ... → enqueue job → maintenanceWorker → cleanupExpiredTokensJob()
```

---

## Topic 1 — scaling

- More **worker** replicas → more email/cron throughput; same `REDIS_URL`
- More **API** replicas → does **not** duplicate cron
- BullMQ uses Redis locks so repeatable jobs aren't double-executed across workers

---

## Topic 1 — testing

- `isQueueEnabled()` returns `false` when `NODE_ENV === "test"`
- Email sends **inline** (fallback path) — no worker needed
- No maintenance cron in test env

---

**Topic 1 complete.** → [Topic 2 — Application cache](#topic-2--redis-as-application-cache)

---

# Topic 2 — Redis as application cache

> **Redis use #2** · Library: `redis` package · Keys: `enrollments:list`, etc. · Files: `redis-cache.js`, `routes/enrollments.js`
>
> **One-liner:** Cache expensive DB reads server-side. Shared across all API replicas. API only — the worker does not use this.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--redis-as-message-broker-bullmq) · **Next:** [Topic 3](#topic-3--redis-as-rate-limit-store)

---

## What it does (Topic 2)

Caches query results in Redis so repeated `GET` requests skip Postgres. Unlike Topic 1 (async jobs), this is **synchronous read-through cache** inside the HTTP request.

| | |
|---|---|
| **Who uses it** | API only — **not** the worker |
| **Client** | `redis-cache.js` — `get`, `set`, `del` |
| **Init** | `index.js` calls `initRedis()` on API startup |
| **Example key** | `enrollments:list` (TTL 60 seconds) |

---

## How it works — enrollments example

**`server/routes/enrollments.js`:**

```text
GET /api/enrollments
  → get("enrollments:list")
  → HIT:  return cached rows  (X-Cache: HIT, X-Cache-Backend: redis)
  → MISS: SELECT * FROM enrollments
          → set("enrollments:list", rows, TTL 60)
          → return rows       (X-Cache: MISS)
```

```js
const cached = await get(ENROLLMENTS_LIST_KEY);
if (cached) {
    res.set("X-Cache", "HIT");
    return res.status(200).json(cached);
}
const result = await pool.query("SELECT * FROM enrollments ORDER BY id");
await set(ENROLLMENTS_LIST_KEY, result.rows, ENROLLMENTS_LIST_TTL_SECONDS);
res.status(200).json(result.rows);
```

---

## Cache invalidation

On `POST` or `DELETE` enrollment, the route calls:

```js
await del(ENROLLMENTS_LIST_KEY);
```

Next `GET` is a cache MISS → fresh data from Postgres → re-cached.

**Rule:** every write path that changes cached data must invalidate the key.

---

## vs in-memory cache

This project also has `lru-cache.js` and `cache.js` (in-memory `Map`) for some routes (e.g. students).

| | In-memory (`lru-cache.js`) | Redis (`redis-cache.js`) |
|---|---------------------------|--------------------------|
| Shared across API replicas | **No** — per-process | **Yes** |
| Survives API restart | No | Yes (until TTL) |
| Use when | Single instance / dev | Multi-instance production |

---

## vs HTTP cache

Topic 2 is **server-side** cache behind `requireAuth` — not browser `Cache-Control`. Browsers should not cache private JSON. Redis protects **Postgres**, not bandwidth. See notes on HTTP cache vs Redis for the full comparison.

---

## Topic 2 — scaling

- `enrollments:list` in Redis → warm cache shared by API #1, #2, #3
- In-memory cache on each box → each replica has its own cold cache

---

**Topic 2 complete.** → [Topic 3 — Rate limit store](#topic-3--redis-as-rate-limit-store)

---

# Topic 3 — Redis as rate limit store

> **Redis use #3** · Library: `rate-limit-redis` · Keys: `rl:*` · File: `middleware/rateLimit.js`
>
> **One-liner:** Track request counts per IP in a sliding window. Shared across API replicas so one IP can't bypass limits by hitting different boxes.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--redis-as-application-cache) · **Next:** [Appendix](#appendix)

---

## What it does (Topic 3)

| | |
|---|---|
| **Who uses it** | API middleware only — **not** the worker |
| **Client** | `rate-limit-redis` `RedisStore` via `getClient()` from `redis-cache.js` |
| **Key prefix** | `rl:` (e.g. `rl:login:127.0.0.1`) |
| **Algorithm** | Sliding window counter (via `express-rate-limit` v8) |

```js
return new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
    prefix: 'rl:',
});
```

---

## Login vs global limiters

**`server/middleware/rateLimit.js`:**

| Limiter | Routes | Limit |
|---------|--------|-------|
| **Login** | `/api/auth/login`, `/api/auth/refresh` | 5 requests / 6 sec per IP |
| **Global** | `/api/*` | 100 requests / 6 sec per IP |

Mounted in `app.js`:

```js
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/refresh", loginLimiter);
app.use("/api/health", ...);          // before global limiter
app.use("/api/", globalLimiter);
```

---

## Health check exception

`/api/health` is mounted **before** the global limiter so load balancers and Docker healthchecks are not throttled.

---

## Topic 3 — scaling

- `rl:*` keys in Redis → same counter for an IP across all API boxes
- Without Redis, in-memory rate limits are per-process → attacker rotates across replicas to bypass

---

## Topic 3 — testing

```js
skip: () => process.env.NODE_ENV === "test"
```

Rate limits skipped in tests so CI doesn't flake.

---

**Topic 3 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## File map

### Topic 1 — Message broker

| File | Role |
|------|------|
| `server/lib/queueConnection.js` | Redis URL for BullMQ; `isQueueEnabled()` |
| `server/queues/emailQueue.js` | Producer — `enqueueVerificationEmail()` |
| `server/queues/maintenanceQueue.js` | Producer — maintenance `Queue` |
| `server/jobs/scheduleMaintenanceJobs.js` | Register cron repeatable job |
| `server/jobs/cleanupExpiredTokens.js` | Job handler wrapper |
| `server/worker.js` | Consumer — both workers |
| `server/routes/auth.js` | Calls email producer |
| `server/services/email.js` | SMTP send (worker) |
| `server/scripts/expired-token.js` | Manual cron trigger |

### Topic 2 — Application cache

| File | Role |
|------|------|
| `server/redis-cache.js` | `get` / `set` / `del` |
| `server/routes/enrollments.js` | `enrollments:list` HIT/MISS |
| `server/index.js` | `initRedis()` on API startup |

### Topic 3 — Rate limits

| File | Role |
|------|------|
| `server/middleware/rateLimit.js` | `RedisStore` with `rl:` prefix |
| `server/app.js` | Mount order (health before global limiter) |

### Shared

| File | Role |
|------|------|
| `docker-compose.yml` | `api`, `worker`, `redis` services |

---

## Common misconceptions

| Wrong | Right |
|-------|-------|
| "Workers don't use Redis" | Topic 1: BullMQ **is** Redis |
| "Cron runs in Express" | Topic 1: cron in **worker.js** only |
| "Redis is only for caching" | Three uses: broker + cache + rate limits |
| "`redis-cache.js` is what workers use" | Workers use `queueConnection.js` (Topic 1) |
| "Producer waits for email to send" | Producer only `await`s `q.add()` (~ms) |
| "Scaling API runs cron 3×" | Only worker handles maintenance queue |

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| How many Redis uses in this project? | **Three** — message broker, app cache, rate limits |
| Topic 1 — producer-consumer? | API enqueues; worker consumes; Redis stores queue |
| Topic 1 — why BullMQ? | Retries, cron, scales workers, Redis-backed |
| Topic 1 — cron? | Repeatable job `0 3 * * *`, stable `jobId` |
| Topic 1 — worker + Redis? | BullMQ wraps Redis (`bull:*` keys) |
| Topic 2 — what cached? | `enrollments:list`, TTL 60s, invalidate on write |
| Topic 2 — why Redis not in-memory? | Shared across API replicas |
| Topic 3 — why Redis for rate limits? | Shared counter per IP across replicas |
| Topic 3 — health check? | Mounted before global limiter |
| Same Redis server? | Yes — different libraries and key prefixes |

**One-liner:** *"One Redis, three roles: BullMQ for async jobs and cron, redis-cache for shared query cache, rate-limit-redis for distributed throttling — each with its own client and key namespace."*

---

## Related notes

- `server/notes/serverless-architecture.md` — SQS + Lambda alternative to Topic 1
- `server/notes/horizontal-scaling-and-kubernetes.md` — scaling API vs worker tiers
- `server/services/services.md` — why workers call services, not routes
- `to-do/health-check-to-do.md` — worker heartbeat, stalled jobs

---

## Further reading

- [BullMQ — Queues](https://docs.bullmq.io/guide/queues)
- [BullMQ — Workers](https://docs.bullmq.io/guide/workers)
- [BullMQ — Repeatable jobs](https://docs.bullmq.io/guide/jobs/repeatable)
- [BullMQ — Retrying failing jobs](https://docs.bullmq.io/guide/retrying-failing-jobs)
