# Rate limiting algorithms — notes

Reference for interview prep and for how this project limits traffic (`server/middleware/rateLimit.js`).

**Read order:** Topic 1 (why + overview) → Topic 2 (algorithms 1–3) → Topic 3 (algorithms 4–5) → Topic 4 (this project) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [Why rate limit + overview](#topic-1--why-rate-limit--overview) | 67 |
| **2** | [Algorithms 1–3](#topic-2--algorithms-13) | 106 |
| **3** | [Algorithms 4–5](#topic-3--algorithms-45) | 150 |
| **4** | [This project's implementation](#topic-4--this-projects-implementation) | 188 |
| — | [Appendix](#appendix) | 252 |

### Topic 1

| Section | Line |
|---------|------|
| [Why rate limit?](#why-rate-limit) | 75 |
| [Five algorithms overview](#five-algorithms-overview) | 92 |

### Topic 2

| Section | Line |
|---------|------|
| [1. Token bucket](#1-token-bucket) | 114 |
| [2. Leaky bucket](#2-leaky-bucket) | 127 |
| [3. Fixed window counter](#3-fixed-window-counter) | 135 |

### Topic 3

| Section | Line |
|---------|------|
| [4. Sliding window log](#4-sliding-window-log) | 158 |
| [5. Sliding window counter](#5-sliding-window-counter) | 168 |

### Topic 4

| Section | Line |
|---------|------|
| [Our config](#our-config) | 196 |
| [Why Redis store](#why-redis-store) | 216 |
| [Health check exception](#health-check-exception) | 230 |
| [HTTP 429 response](#http-429-response) | 236 |

### Appendix

| Section | Line |
|---------|------|
| [Comparison diagram](#comparison-diagram) | 258 |
| [Possible improvements](#possible-improvements) | 270 |
| [Interview cheat sheet](#interview-cheat-sheet) | 281 |
| [Related files](#related-files) | 296 |

[↑ Back to top](#rate-limiting-algorithms--notes)

---

# Topic 1 — Why rate limit + overview

> **Read first** — goal and algorithm map.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--algorithms-13)

---

## Why rate limit?

Public APIs get abused: brute force login, scraping, tight loops, DDoS-ish traffic.

**Goal:** Allow normal use, block excessive requests — by **client identity** (IP, user id, API key).

**In this project:**

| Limiter | Route | Limit |
|---------|-------|-------|
| Login | `/api/auth/login`, `/api/auth/refresh` | 5 / 6 sec per IP |
| Global | `/api/*` | 100 / 6 sec per IP |

Storage: **Redis** (`rate-limit-redis`) — shared across API instances.

---

## Five algorithms overview

| # | Algorithm | Idea | Bursts? | Used here? |
|---|-----------|------|---------|------------|
| 1 | Token bucket | Tokens refill; request spends one | Yes | No |
| 2 | Leaky bucket | Constant leak rate; overflow drops | No | No |
| 3 | Fixed window | Count per fixed time block | Edge burst | No |
| 4 | Sliding window log | Store every timestamp | Controlled | No |
| 5 | Sliding window counter | Blend current + previous window | Moderate | **Yes** |

**Topic 1 complete.** → [Topic 2](#topic-2--algorithms-13)

---

# Topic 2 — Algorithms 1–3

> **Read second** — token bucket, leaky bucket, fixed window.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--why-rate-limit--overview) · **Next:** [Topic 3](#topic-3--algorithms-45)

---

## 1. Token bucket

Tokens refill at steady rate. Each request consumes one. Empty bucket → 429.

```text
Refill: +10/sec (max 100)
Request: -1 token
```

**Pros:** Allows bursts up to bucket size. **Cons:** Full bucket can spike server. **Use:** API gateways, when bursts OK.

---

## 2. Leaky bucket

Requests enter bucket; leak out at **constant rate**. Overflow → drop.

**Pros:** Smooths traffic. **Cons:** Can add latency. **Use:** Traffic shaping, fragile backends.

---

## 3. Fixed window counter

Count requests per client per fixed window (e.g. each minute). Reset at boundary.

```text
Limit 100/min:
  100 requests at 0:59 + 100 at 1:00 = 200 in 2 seconds
```

**Pros:** Simple, low memory (`INCR` + TTL). **Cons:** **Boundary burst** problem.

**Topic 2 complete.** → [Topic 3](#topic-3--algorithms-45)

---

# Topic 3 — Algorithms 4–5

> **Read third** — sliding window log and counter (what we use).

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--algorithms-13) · **Next:** [Topic 4](#topic-4--this-projects-implementation)

---

## 4. Sliding window log

Store **timestamp of every request**. Drop timestamps older than window; count remainder.

**Pros:** Accurate rolling window. **Cons:** Memory heavy — one timestamp per request.

**Use:** Strict fairness, moderate traffic.

---

## 5. Sliding window counter

Blend **current window** + **previous window** counts — approximate rolling window without storing every timestamp.

```text
estimated = count_previous × weight + count_current
weight = (windowMs - now) / windowMs
```

**Pros:** Good accuracy/memory balance; `express-rate-limit` default. **Cons:** Approximation.

```text
Fixed window:  |---- 100 ----|---- 100 ----|  spike at boundary
Sliding counter: smoother blend across boundary
```

**Topic 3 complete.** → [Topic 4](#topic-4--this-projects-implementation)

---

# Topic 4 — This project's implementation

> **Read fourth** — how `rateLimit.js` applies Topic 3 algorithm #5.

[↑ Index](#index) · **Previous:** [Topic 3](#topic-3--algorithms-45) · **Next:** [Appendix](#appendix)

---

## Our config

```js
// server/middleware/rateLimit.js
rateLimit({
  windowMs: 6 * 1000,
  max: 5,              // login: 5 per 6 sec
  store: RedisStore,   // shared across instances
});
```

| Piece | Value |
|-------|-------|
| Algorithm | Sliding window counter (`express-rate-limit` v8) |
| Key | Client IP (default) |
| Store | Redis — prefix `rl:` |
| Response | 429 + `RateLimit-*` headers |

---

## Why Redis store

```text
Without Redis:
  API A: 3 hits for IP    API B: 3 hits  → attacker gets 2× limit

With Redis:
  Both share same counter for IP
```

See `server/notes/bullmq-redis-workers.md` — Topic 3 (rate limits).

---

## Health check exception

`/api/health` mounted **before** global limiter — LB probes not throttled.

---

## HTTP 429 response

```http
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 6
```

```json
{ "error": "Too many login attempts. Try again later." }
```

**Topic 4 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Comparison diagram

```text
Token bucket:     ▁▁▁▁████████▁▁▁▁     (burst if tokens saved)
Leaky bucket:     ▁▂▂▃▃▄▄▄▄▄▄▃▃▂▂▁     (smooth output)
Fixed window:     ████████|████████     (spike at |)
Sliding log:      ████▁▁▁▁████▁▁▁▁     (accurate)
Sliding counter:  ████▁▁▁▁███▁▁▁▁     (approx — we use this)
```

---

## Possible improvements

| Improvement | Why |
|-------------|-----|
| Separate prefixes `rl:login:` vs `rl:global:` | Avoid key collision |
| Rate limit by `userId` after auth | Fairer than IP for NAT |
| Rate limit `/api/auth/register` | Prevent signup spam |
| Prod login: 15 min / 5 attempts | Stricter than dev 6 sec window |

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| Which algorithm? | Sliding window counter via `express-rate-limit` |
| Why not token bucket? | Didn't need configurable bursts; middleware default fits |
| Why Redis? | Shared counters across API processes |
| Fixed vs sliding? | Fixed has boundary burst; sliding smooths it |
| Log vs counter? | Log exact but heavy; counter approximate but cheap |
| What limited? | IP per route group (login stricter than global) |

**One-liner:** *"Login and global limits use express-rate-limit's sliding window counter in Redis — consistent across instances, stricter on auth."*

---

## Related files

- `server/middleware/rateLimit.js`
- `server/app.js` — mount order
- `server/redis-cache.js` — Redis client for store
- `server/scripts/rate-limit-test.mjs`
- `server/notes/horizontal-scaling-and-kubernetes.md` — why shared Redis matters
