# Serverless architecture — notes

Reference for interview prep — when a SPA + Node stack should (or should not) use serverless compute.

**This project today:** React SPA (static Vercel) + always-on Express API + BullMQ worker. **Serverful** backend, not FaaS.

**Read order:** Topic 1 (what it is) → Topic 2 (when to use) → Topic 3 (when not to) → Topic 4 (how to decide) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [What is serverless?](#topic-1--what-is-serverless) | 71 |
| **2** | [When to use serverless](#topic-2--when-to-use-serverless) | 121 |
| **3** | [When NOT to use serverless](#topic-3--when-not-to-use-serverless) | 168 |
| **4** | [How to decide + hybrid](#topic-4--how-to-decide--hybrid) | 204 |
| — | [Appendix](#appendix) | 286 |

### Topic 1

| Section | Line |
|---------|------|
| [Definition](#definition) | 79 |
| [Provider vs you](#provider-vs-you) | 94 |
| [Static vs PaaS vs serverless](#static-vs-paas-vs-serverless) | 106 |

### Topic 2

| Section | Line |
|---------|------|
| [Trigger patterns](#trigger-patterns) | 129 |
| [This project examples](#this-project-examples) | 142 |
| [Good choice checklist](#good-choice-checklist) | 155 |

### Topic 3

| Section | Line |
|---------|------|
| [Why serverless struggles](#why-serverless-struggles) | 176 |
| [Stay serverful when](#stay-serverful-when) | 190 |

### Topic 4

| Section | Line |
|---------|------|
| [Key properties](#key-properties) | 212 |
| [Hybrid patterns](#hybrid-patterns) | 224 |
| [Decision checklist](#decision-checklist) | 240 |
| [Cost & performance](#cost--performance) | 258 |
| [Mapping to this repo](#mapping-to-this-repo) | 270 |

### Appendix

| Section | Line |
|---------|------|
| [Serverless vs PaaS vs K8s](#serverless-vs-paas-vs-k8s) | 292 |
| [Interview cheat sheet](#interview-cheat-sheet) | 304 |
| [Related files](#related-files) | 319 |
| [Further reading](#further-reading) | 328 |

[↑ Back to top](#serverless-architecture--notes)

---

# Topic 1 — What is serverless?

> **Read first** — definitions and what it is NOT.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--when-to-use-serverless)

---

## Definition

**Serverless ≠ no servers.** You don't manage servers — the provider runs code on demand, bills per use (invocations, GB-seconds).

**FaaS:** AWS Lambda, Google Cloud Functions, Vercel Functions, Cloudflare Workers.

```text
Traditional:  Server 24/7 → pay at 3am with zero traffic
Serverless:   Request → spin up function → scale to zero
```

**Interview line:** *"Serverless is an ops and billing model — managed, ephemeral, event-driven compute."*

---

## Provider vs you

| Piece | Traditional | Serverless |
|-------|-------------|------------|
| OS patching | You / PaaS | Provider |
| Scaling | You configure | Auto per event |
| Idle cost | Always-on | Often ~$0 |
| Process lifetime | Days/months | ms–minutes |
| Deploy unit | App/container | Function |

---

## Static vs PaaS vs serverless

| Deploy | Example | Serverless compute? |
|--------|---------|---------------------|
| Vite React on Vercel | Your `client/` | **No** — static CDN |
| Express on Render | Your `server/` | **No** — long-lived process |
| Vercel `/api` route | `api/webhook.js` | **Yes** |
| Scheduled Lambda | Cron cleanup | **Yes** |

SPA on Vercel is **not** serverless for the React bundle — only for code that runs per request/event.

**Topic 1 complete.** → [Topic 2](#topic-2--when-to-use-serverless)

---

# Topic 2 — When to use serverless

> **Read second** — good fits and triggers.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--what-is-serverless) · **Next:** [Topic 3](#topic-3--when-not-to-use-serverless)

---

## Trigger patterns

| Trigger | Fit | How |
|---------|-----|-----|
| **S3 upload** | Excellent | Lambda on `ObjectCreated` |
| **Cron daily** | Excellent | Scheduled Lambda / EventBridge |
| **Queue message** | Excellent | SQS → Lambda |
| **Email on form submit** | Good | Function + SES |
| **Webhook** | Good | Short POST handler |
| **Bursty HTTP API** | Good | API Gateway → Lambda |

---

## This project examples

| Job | Serverless? | Why |
|-----|-------------|-----|
| `cleanupExpiredTokensJob` | **Yes** | Short scheduled DB delete |
| BullMQ email worker | **No** | Needs 24/7 poll loop |
| Express `/api/*` | Possible | Cold starts; connection pooling |
| React on Vercel | **Already optimal** | Static CDN |

**Serverless alternatives:** EventBridge cron for cleanup; SQS + Lambda for email instead of BullMQ worker.

---

## Good choice checklist

- [ ] Work is **short** (seconds)
- [ ] Handlers are **stateless**
- [ ] Traffic **spiky or low**
- [ ] Work is **event-driven**
- [ ] **DB connection pooling** solved (Neon driver, RDS Proxy)
- [ ] **Cold start** acceptable

**Topic 2 complete.** → [Topic 3](#topic-3--when-not-to-use-serverless)

---

# Topic 3 — When NOT to use serverless

> **Read third** — bad fits for your project shape.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--when-to-use-serverless) · **Next:** [Topic 4](#topic-4--how-to-decide--hybrid)

---

## Why serverless struggles

| Need | Why |
|------|-----|
| **WebSockets / SSE** | Functions time out; no long connections |
| **BullMQ polling** | Needs 24/7 worker process |
| **Long requests (>15 min)** | Lambda limits |
| **Heavy CPU in request** | Expensive per GB-second |
| **Large Express monolith** | Cold starts, bundle size |
| **High steady traffic 24/7** | Containers often cheaper |
| **Many DB connections** | Concurrency × connections = pool exhaustion |

---

## Stay serverful when

```text
✗ Real-time admin chat (WebSocket)
✗ BullMQ worker without redesign
✗ Predictable sub-100ms p99 on auth
✗ 30+ Express routes with shared middleware
→ Keep Express + Docker/Render (what you have)
```

**Topic 3 complete.** → [Topic 4](#topic-4--how-to-decide--hybrid)

---

# Topic 4 — How to decide + hybrid

> **Read fourth** — properties, hybrids, decision flow, this repo.

[↑ Index](#index) · **Previous:** [Topic 3](#topic-3--when-not-to-use-serverless) · **Next:** [Appendix](#appendix)

---

## Key properties

| Property | Meaning |
|----------|---------|
| **Scale to zero** | No traffic → little compute cost |
| **Ephemeral** | Nothing survives invocation — use shared Redis/Postgres |
| **Cold starts** | First request after idle is slower |
| **Time limits** | Lambda ~15 min max |
| **Connection trap** | 100 Lambdas × 1 DB conn each → pool exhaustion |

---

## Hybrid patterns

| Pattern | Description |
|---------|-------------|
| **Static SPA + serverful API** | This project — learning default |
| **Serverful API + serverless cron** | Express + scheduled Lambda for token cleanup |
| **Serverful API + serverless workers** | Express → SQS → Lambda for email |
| **Serverless BFF** | Vercel `/api/*` for webhooks only |

```text
Vercel (React) → Render Express /api/*
              └→ Lambda (optional: cron, webhooks)
```

---

## Decision checklist

```text
Short + stateless + event-driven?
  No  → serverful
  Yes ↓
Bursty/low traffic?
  No  → containers may be cheaper
  Yes ↓
No WebSockets / BullMQ poll loops?
  No  → hybrid (cron/webhooks only)
  Yes ↓
DB pooling solved?
  Yes → serverless API reasonable
```

---

## Cost & performance

| Scenario | Likely winner |
|----------|---------------|
| Portfolio, low traffic | Serverless or small PaaS |
| 1M+ req/day steady | Containers |
| Webhook-only backend | Serverless |
| Real-time features | Serverful + WebSocket |
| User-facing login (strict p99) | Warm container |

---

## Mapping to this repo

| Component | Current | Serverless option |
|-----------|---------|-------------------|
| `client/` | Static Vercel | No change |
| Express API | Render/Docker | Lambda + adapter |
| `worker.js` BullMQ | Long-lived | SQS + Lambda |
| `cleanupExpiredTokens` | BullMQ cron | **Scheduled Lambda** (easy win) |
| Rate limits | Redis | Same — Upstash |

**Highest ROI:** scheduled cleanup, webhooks — not full Express rewrite.

**Topic 4 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Serverless vs PaaS vs K8s

| | Serverless | PaaS (Render) | K8s |
|---|------------|---------------|-----|
| Deploy unit | Function | Container | Pod |
| Idle cost | ~$0 | Container running | Cluster cost |
| WebSockets | Poor | Good | Good |

See: `server/notes/horizontal-scaling-and-kubernetes.md`

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| What is serverless? | Provider runs code on demand; pay per use |
| React on Vercel serverless? | **No** for Vite SPA — static CDN |
| When use it? | Bursty, cron, queues, webhooks, S3 events |
| When avoid? | WebSockets, BullMQ, steady high QPS |
| This project? | Serverful correct; cleanup = Lambda candidate |
| Hybrid? | Express core + Lambda for cron/webhooks |

**One-liner:** *"SPA on static hosting, always-on Node API for workers and connections; serverless for event-driven slices — usually hybrid, not full rewrite."*

---

## Related files

- `client/vercel.json` — SPA static deploy
- `server/worker.js` — serverful workers
- `server/jobs/cleanupExpiredTokens.js` — Lambda candidate
- `server/notes/bullmq-redis-workers.md` — Topic 1 vs serverless workers

---

## Further reading

- [AWS Lambda docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Neon serverless driver](https://neon.tech/docs/serverless/serverless-driver)
