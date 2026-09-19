# Horizontal scaling & Kubernetes — notes

Reference for interview prep — how this project scales beyond a single server.

**Read order:** Topic 1 (basics) → Topic 2 (this project) → Topic 3 (platforms) → Topic 4 (Kubernetes) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [Scaling fundamentals](#topic-1--scaling-fundamentals) | 71 |
| **2** | [This project — ready vs blockers](#topic-2--this-project--ready-vs-blockers) | 110 |
| **3** | [Platforms & replicas](#topic-3--platforms--replicas) | 170 |
| **4** | [Kubernetes](#topic-4--kubernetes) | 227 |
| — | [Appendix](#appendix) | 300 |

### Topic 1

| Section | Line |
|---------|------|
| [What is horizontal scaling?](#what-is-horizontal-scaling) | 79 |
| [Vertical vs horizontal](#vertical-vs-horizontal) | 97 |

### Topic 2

| Section | Line |
|---------|------|
| [What's already scaling-friendly](#whats-already-scaling-friendly) | 118 |
| [What blocks scaling today](#what-blocks-scaling-today) | 133 |
| [Layer-by-layer plan](#layer-by-layer-plan) | 145 |
| [Target architecture](#target-architecture) | 157 |

### Topic 3

| Section | Line |
|---------|------|
| [Stage 1–3 growth](#stage-13-growth) | 178 |
| [How platforms add servers](#how-platforms-add-servers) | 190 |
| [Fixed vs autoscale](#fixed-vs-autoscale) | 204 |
| [Manual VPS path](#manual-vps-path) | 215 |

### Topic 4

| Section | Line |
|---------|------|
| [What K8s is](#what-k8s-is) | 235 |
| [Concepts mapped to project](#concepts-mapped-to-project) | 243 |
| [What K8s does / doesn't do](#what-k8s-does--doesnt-do) | 265 |
| [When teams adopt K8s](#when-teams-adopt-k8s) | 273 |
| [This app on K8s](#this-app-on-k8s) | 285 |

### Appendix

| Section | Line |
|---------|------|
| [Scaling checklist](#scaling-checklist) | 306 |
| [Realistic path for repo](#realistic-path-for-repo) | 321 |
| [Interview cheat sheet](#interview-cheat-sheet) | 332 |
| [Related files](#related-files) | 348 |

[↑ Back to top](#horizontal-scaling--kubernetes--notes)

---

# Topic 1 — Scaling fundamentals

> **Read first** — horizontal vs vertical.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--this-project--ready-vs-blockers)

---

## What is horizontal scaling?

**Horizontal** = more copies (API #2, #3…). **Vertical** = bigger CPU/RAM on one box.

```text
         Users ──► Load balancer
              ┌──────┼──────┐
              ▼      ▼      ▼
           API #1  API #2  API #3
              └──────┼──────┘
                     ▼
            Postgres (Neon) + Redis
```

**Interview line:** *"Scale stateless API horizontally; Postgres and Redis are shared."*

---

## Vertical vs horizontal

| | Vertical | Horizontal |
|---|----------|------------|
| Action | Bigger machine | More instances |
| Limit | Hardware ceiling | Until DB/Redis bottleneck |
| Failure | Single point | LB routes around failed box |
| First step | Often easier | After stateless + shared stores |

**Topic 1 complete.** → [Topic 2](#topic-2--this-project--ready-vs-blockers)

---

# Topic 2 — This project — ready vs blockers

> **Read second** — what you have and what to fix.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--scaling-fundamentals) · **Next:** [Topic 3](#topic-3--platforms--replicas)

---

## What's already scaling-friendly

| Piece | Why |
|-------|-----|
| **Stateless JWT API** | No session stuck on one server |
| **Postgres (Neon)** | Shared DB |
| **Redis enrollments cache** | Shared across replicas |
| **Redis rate limits** | Same IP limit on all boxes |
| **BullMQ + worker** | Scale workers independently |
| **Docker** | Same image → N containers |
| **Separate worker** | Email/cron not in HTTP process |
| **Health check** | `/api/health` for LB |

---

## What blocks scaling today

| Issue | Fix |
|-------|-----|
| **In-memory `logStore`** | Centralize logs or accept per-instance |
| **In-memory course cache** (`cache.js`) | Redis or shorter TTL |
| **In-memory LRU students** | Redis or drop at scale |
| **WebSockets (if added)** | Redis pub/sub between instances |
| **Connection pool** | Lower `max` per instance; PgBouncer |

---

## Layer-by-layer plan

| Layer | Scale how |
|-------|-----------|
| **API** | N identical containers behind LB; same env vars |
| **Worker** | More workers pull same BullMQ queues |
| **Redis** | One shared instance (Upstash) |
| **Postgres** | One cluster; watch `instances × pool.max` |
| **Client** | CDN / Vercel; `VITE_API_BASE` → LB URL |

---

## Target architecture

```text
[ CDN — React ] → [ LB ] → API ×3 → Redis → Postgres
                              Worker ×2 ↗
```

**docker-compose today:** `redis + api + worker + client` — good local model.

**Topic 2 complete.** → [Topic 3](#topic-3--platforms--replicas)

---

# Topic 3 — Platforms & replicas

> **Read third** — how teams actually get 3+ servers.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--this-project--ready-vs-blockers) · **Next:** [Topic 4](#topic-4--kubernetes)

---

## Stage 1–3 growth

| Stage | Setup |
|-------|-------|
| **1 — Start** | 1× API + 1× worker + managed DB/Redis |
| **2 — Split** | 1 API + 1 worker, or 2 API + LB |
| **3 — Scale** | 3+ API replicas when CPU/latency/traffic justify |

Signals: CPU pegged, p95 up, traffic spikes, uptime needs.

---

## How platforms add servers

| Platform | How |
|----------|-----|
| **Render** | Instance count / autoscaling |
| **Railway** | Replicas in dashboard |
| **Fly.io** | `fly scale count 3` |
| **AWS ECS** | Task count = N |
| **Kubernetes** | `replicas: 3` |

Cost ≈ linear — 3 boxes ≈ 3× compute.

---

## Fixed vs autoscale

| Mode | Behavior |
|------|----------|
| **Fixed** | Always 3 pods — predictable cost, HA |
| **Autoscale (HPA)** | Min 2, max 10 — CPU > 70% |

Startups often: **fixed 2** first, then autoscale when spiky.

---

## Manual VPS path

```text
3 droplets → same Docker image → nginx/ALB in front → same DATABASE_URL, REDIS_URL
```

More control, more ops than PaaS.

**Topic 3 complete.** → [Topic 4](#topic-4--kubernetes)

---

# Topic 4 — Kubernetes

> **Read fourth** — when K8s helps and how it maps to this project.

[↑ Index](#index) · **Previous:** [Topic 3](#topic-3--platforms--replicas) · **Next:** [Appendix](#appendix)

---

## What K8s is

**Container orchestrator** — runs Docker across machines: scale, health, deploy, route traffic.

Automates: "run 3 copies, restart crashes, deploy v2, roll back."

---

## Concepts mapped to project

| K8s | This project |
|-----|--------------|
| Container image | `server/Dockerfile` |
| Pod | One API or worker process |
| Deployment | "Keep 3 API pods" |
| Service | Internal LB → pods |
| Ingress | Public HTTPS |
| Secret | `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` |
| HPA | Auto-scale on CPU |

```text
Ingress → Service:api → [pod][pod][pod]
                         ↓
                    Redis + Postgres (usually outside cluster)
```

Separate **Deployment** for worker — scale independently.

---

## What K8s does / doesn't do

**Does:** replicas, HPA, self-healing, rolling deploy, multi-node scheduling.

**Doesn't:** scale Postgres/Redis for you; fix in-memory `logStore`; stay simple — **overkill** for portfolio apps.

---

## When teams adopt K8s

| Stage | Choice |
|-------|--------|
| Solo / early startup | PaaS — **no K8s** |
| Growing | Managed K8s or stay PaaS |
| Large org | K8s for microservices |

**Interview line:** *"Render/Fly abstract orchestration; K8s when you want full control at scale."*

---

## This app on K8s

```text
api-deployment      replicas: 3
worker-deployment   replicas: 2
External: Neon + Redis
Ingress: api.yourapp.com
```

Fix before many replicas: in-memory `logStore`, per-process caches.

**Topic 4 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Scaling checklist

**Already OK:** JWT, Redis rate limits, Redis cache, BullMQ worker separate, health endpoint.

**Before multi-instance prod:**
- [ ] Move/drop in-memory `logStore`
- [ ] Align course/student caches
- [ ] Tune DB pool per instance
- [ ] LB with identical env vars
- [ ] WebSockets → Redis pub/sub

**Platform path (no K8s):** Render/Fly replicas + managed Redis + Neon + Vercel client.

---

## Realistic path for repo

```text
Today:     docker compose — 1 api, 1 worker, 1 redis
First deploy: Render — 1 API, 1 worker, Neon, Upstash (~$20–40/mo)
Traffic grows: API → 2–3 instances
Async grows:   worker → 2
```

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| Horizontal scaling? | More instances, not bigger machine |
| How does your app support it? | Stateless JWT + shared Postgres + Redis |
| Why Redis for rate limits? | Same counter per IP across boxes |
| How get 3+ servers? | PaaS replica count or K8s `replicas` |
| What does K8s do? | Orchestrate containers: scale, health, deploy |
| Need K8s for this project? | **No** — Docker Compose + Render enough |
| K8s vs Render? | Render hides orchestration; K8s at larger scale |

**One-liner:** *"Stateless API containers behind LB with shared Postgres and Redis; scale replicas when metrics justify — not on day one."*

---

## Related files

- `docker-compose.yml`
- `server/middleware/rateLimit.js`
- `server/redis-cache.js`
- `server/worker.js`
- `server/lib/logStore.js` — **not** multi-instance safe
- `server/notes/forward-vs-reverse.md`
- `server/notes/bullmq-redis-workers.md`
