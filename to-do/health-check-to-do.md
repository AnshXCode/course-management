Reviewing your setup so I can recommend heartbeat options that fit this project.

Heartbeat mechanisms you can add to this project
A heartbeat is a periodic “I’m still alive” signal. If it stops or goes stale, something is wrong and another system should act (restart, alert, stop routing traffic).

You already have the probe (/api/health). What’s missing is who polls it, how often, and heartbeats for the worker — not just the API.

Three layers (pick what fits each service)
Layer 1 — Process alive?        → liveness heartbeat
Layer 2 — Can it do real work?   → readiness / deep health
Layer 3 — Is background work OK? → worker heartbeat in Redis
Layer	Question	Your gap
Liveness
Is Node still running?
No Docker/K8s probe wired
Readiness
Can it talk to DB/Redis?
/api/health exists, nothing polls it
Worker
Is BullMQ consumer alive?
Worker has no heartbeat
1. Docker Compose healthchecks (high ROI, local + prod pattern)
What: Compose pings your API every N seconds; marks container unhealthy if it fails.

Detects: API crashed, hung, DB/Redis down (via your deep health).

Add to docker-compose.yml:

api:
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:5001/api/health"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 10s
redis:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
Also: depends_on: api: condition: service_healthy for client so the UI doesn’t start before API is ready.

Interview line: “Docker healthchecks are the heartbeat at the container level.”

2. Split liveness vs readiness (medium ROI)
What: Two endpoints instead of one.

Endpoint	Checks	Fails when
GET /api/health/live
Process responds
Never, unless process dead
GET /api/health/ready
DB + Redis (your current runHealthCheck)
Dependencies down
Why: If Postgres blips, K8s should stop traffic (readiness) but maybe not kill the pod (liveness). One combined endpoint can’t distinguish that.

Detects: Dependency failures vs process death.

3. Worker heartbeat in Redis (high ROI for your architecture)
What: Worker writes a timestamp to Redis every 30s; monitor checks it’s fresh.

worker.js  ──every 30s──► SET worker:heartbeat:email <timestamp> EX 90
monitor    ──every 60s──► if key missing/stale → alert or restart worker
Detects:

Worker process died
Worker stuck (event loop blocked — timestamp stops updating)
Redis connection lost from worker side
Why it matters: /api/health can return 200 while no emails send and cron never runs. API health doesn’t prove the worker is alive.

Optional: Extend /api/health with:

"checks": {
  "worker": { "status": "down", "lastSeen": "2026-05-28T10:00:00Z" }
}
API reads worker:heartbeat:* from Redis — one place for ops to look.

4. BullMQ stalled-job detection (low effort, built-in)
What: BullMQ already detects jobs that started but never finished.

emailWorker.on("stalled", (jobId) => {
  logger.error({ jobId }, "Job stalled — worker may be stuck");
});
Detects: Worker crashed mid-job, long blocking sync code, Redis disconnect during processing.

Pair with: lockDuration, stalledInterval in Worker options.

Interview line: “Queue heartbeats are implicit — if a worker doesn’t renew a job lock, BullMQ marks it stalled.”

5. Queue depth / age alerts (operational heartbeat)
What: Periodic check — not “is process up?” but “is the system healthy?”

Signal	Bad sign
email queue waiting count
Growing forever → worker dead or email API down
Oldest waiting job age
> 5 min → delivery broken
maintenance repeatable job
Last run > 25h → cron didn’t fire
Where: Small cron in worker, or admin endpoint GET /api/v2/ops/queues (admin-only).

Detects: Silent failures where process is alive but work piles up.

6. External uptime monitor (prod, zero code)
What: Better Stack, UptimeRobot, Render health checks ping GET /api/health every 1–5 min.

Detects: Full outage, deploy gone wrong, DNS/SSL issues, region down.

You already have the endpoint — this is wiring + alerts.

7. Client-side heartbeat (only if you add real-time)
Relevant when: WebSocket admin chat or live enrollment updates.

Server ──ping every 30s──► Client
Client ──pong──► Server
No pong in 60s → close connection, show “disconnected”, reconnect
Not needed today — you have no long-lived connections. SSE has similar keep-alive comments.

8. Auth session heartbeat (optional, different problem)
What: Client calls POST /api/auth/refresh on a timer before access token expires.

Detects: Not server failure — detects expired session and keeps UX smooth.

You already refresh on 401; a timer is UX polish, not ops heartbeat.

9. Graceful shutdown + missed heartbeat on deploy
What: On SIGTERM, stop accepting new HTTP work, drain in-flight requests, close DB pool, exit.

Detects indirectly: During deploy, LB might still send traffic to a dying instance without graceful shutdown.

Pair with: LB healthcheck that fails quickly when shutting down.

What to include — practical priority for your project
Priority	Mechanism	Effort	What failure it catches
1
Docker healthcheck on api + redis
Low
Dead API, dead Redis, bad startup order
2
Worker Redis heartbeat + check in /api/health
Medium
Worker died while API looks fine
3
BullMQ stalled + failed logging
Low
Stuck/crashed mid-job
4
Split live / ready health
Medium
Kill vs drain during DB outage
5
External monitor on /api/health
Low (config)
Prod outage you don’t see locally
6
Queue depth on admin ops page
Medium
Email backlog, silent queue failure
7
WebSocket ping/pong
Later
Only when you build real-time
8
Periodic JWT refresh timer
Low
UX only, not failure detection
Suggested shape for this repo
                    ┌─────────────────────────────────┐
                    │  External monitor (prod)        │
                    │  GET /api/health every 1–5 min  │
                    └───────────────┬─────────────────┘
                                    │
┌─────────────── Docker healthcheck ─┼─── K8s readiness (later) ───┐
│                                   ▼                              │
│  api:5001  GET /api/health/ready                                 │
│            ├─ db: SELECT 1                                       │
│            ├─ redis: PING                                        │
│            └─ worker: Redis key fresh?  ◄── NEW                  │
│                                                                   │
│  worker.js                                                        │
│    ├─ every 30s SET heartbeat in Redis         ◄── NEW           │
│    ├─ BullMQ stalled / failed handlers         ◄── NEW           │
│    └─ process email + maintenance jobs                           │
│                                                                   │
│  redis healthcheck: redis-cli ping             ◄── NEW (compose) │
└──────────────────────────────────────────────────────────────────┘
Interview framing
Heartbeat vs health check:

Health check = “Are you OK right now?” (on-demand probe)
Heartbeat = “Tell me you’re OK repeatedly; if you stop, I know you failed” (time-based)
Your /api/health is a health check endpoint. It becomes a heartbeat system when something polls it on an interval or when the worker pushes timestamps to Redis.

One-liner: “We use deep health for readiness, Docker or the load balancer polls it as a heartbeat, and the BullMQ worker writes a Redis heartbeat so we can detect API-up-but-worker-dead — a failure mode health checks alone miss.”

What I’d build first (coach order)
Docker healthchecks — teaches ops heartbeat with almost no app code.
Worker Redis heartbeat — teaches distributed failure detection; fits your BullMQ split.
Expose worker status in /api/health — single pane for debugging and interviews.
BullMQ stalled handler — one afternoon, real queue semantics.