# Kafka notification system (planned)

**Status:** Planned — not implemented yet.  
**Goal:** Domain events on Kafka so **multiple services** in this project can react independently (email, in-app alerts, logs/audit, future push/SMS).

**Today:** Verification email + cron use **BullMQ on Redis** (job queue). That stays for *delivery retries*. Kafka becomes the *event bus* services subscribe to.

---

## Index

| # | Topic |
|---|--------|
| 1 | [Why add Kafka](#topic-1--why-add-kafka) |
| 2 | [What we will build](#topic-2--what-we-will-build) |
| 3 | [Which services respond](#topic-3--which-services-in-our-project-will-respond) |
| 4 | [How it fits with BullMQ/Redis](#topic-4--how-it-fits-with-bullmq--redis) |
| 5 | [Example event flow](#topic-5--example-event-flow) |
| — | [Interview cheat sheet](#appendix--interview-cheat-sheet) |

---

## Topic 1 — Why add Kafka

We want a **notification / event system**, not only “send one email job”:

- One fact happened (`user.registered`, `payment.completed`, …)
- **Many** parts of the system should react without the API calling each one
- Events should be **durable** (worker down → catch up later) — unlike Redis Pub/Sub fire-and-forget
- Room to grow (push, SMS, webhooks) without changing every producer

Kafka = **pub/sub + log** (topics, consumer groups, replay).

---

## Topic 2 — What we will build

```text
API / workers (producers)
        │
        │  publish domain events
        ▼
   Kafka topics
   (e.g. user.events, payment.events, enrollment.events)
        │
        ├─► notification-service (email / in-app / future push)
        ├─► audit / logs consumer (optional)
        └─► other feature consumers (assignments, digests, …)
```

**Planned pieces:**

| Piece | Role |
|-------|------|
| **Kafka** | Event backbone (topics + retention) |
| **Producers** | API (and maybe workers) publish after successful DB writes |
| **Notification service** | Consumer group: turn events into user-facing notifications |
| **Channel senders** | Still use BullMQ/SMTP/etc. for actual send + retries |
| **Other consumers** | Same events, different jobs (metrics, audit, side effects) |

---

## Topic 3 — Which services in our project will respond

Map to **this** course-management codebase (current + natural extensions):

| Producer (publishes) | Example event | Consumers that respond |
|----------------------|---------------|-------------------------|
| **Auth API** (`/api/auth`) | `user.registered`, `user.email_verified`, `user.logged_in` (optional) | **Notification** → verification / welcome email; **Audit** → security log |
| **Payment API** (`/api/payments`) | `payment.checkout_created`, `payment.completed` | **Notification** → receipt / “enrolled” message; **Enrollment side-effect** if not already inline |
| **Enrollments API** | `enrollment.created`, `enrollment.removed` | **Notification** → student/admin alert; **Dashboard cache** invalidate (or Redis del) |
| **Courses API** | `course.created`, `course.updated` (admin) | **Notification** → optional admin/ops; future student “new course” |
| **Assignments API** (`/api/v2/assignments`) | `assignment.created`, `assignment.due_soon` | **Notification** → student reminders |
| **Maintenance worker** (today BullMQ cron) | `tokens.cleanup_completed` (ops event) | **Audit / logs** consumer — not user email |

**Notification service** (new, planned) is the main subscriber for user-facing channels:

- Email (Mailtrap/SMTP today)
- In-app notifications (future table + UI)
- Push / SMS (future)

**Existing worker** can either:

- Stay as BullMQ-only for sends, triggered *by* the notification consumer, or  
- Also be a Kafka consumer that enqueues BullMQ jobs

**API** remains the primary **producer** after commits succeed (outbox pattern later if we need stronger guarantees).

---

## Topic 4 — How it fits with BullMQ / Redis

| Layer | Tool | Job |
|-------|------|-----|
| “Something happened” | **Kafka** | Fan-out to many services |
| “Send this email now” | **BullMQ + Redis** | Retries, backoff, one job one worker |
| Cache / rate limits | **Redis** | Unchanged |

```text
Auth register success
  → produce user.registered (Kafka)
  → notification-service consumes
  → enqueue BullMQ send-verification (Redis)
  → email worker sends mail
```

We do **not** replace Redis cache or rate limiting with Kafka.

---

## Topic 5 — Example event flow

**Register → verify email (target design):**

```text
1. POST /api/auth/register  →  write user in Postgres
2. Produce Kafka: user.registered { userId, email }
3. Notification consumer (group: notifications)
4. Enqueue BullMQ job send-verification
5. Worker sends email via SMTP
```

**Payment completed:**

```text
1. POST /api/payments/:id/confirm
2. Produce: payment.completed { paymentId, userId, courseId }
3. Notification → “Payment successful” email / in-app
4. (Optional) another consumer updates analytics
```

Same event, **independent** responders — that is the point of Kafka pub/sub.

---

## Appendix — Interview cheat sheet

**What are we adding?**  
A Kafka-based notification/event system so domain events are published once and **different services** (notification, audit, feature workers) subscribe and respond.

**Why not only BullMQ?**  
BullMQ is a **job queue** (great for send-email). Kafka is an **event bus** (great when many services must react to the same fact).

**Why not Redis Pub/Sub?**  
Ephemeral — if a consumer is down, it misses the message. Kafka retains and allows catch-up/replay.

**Services that will respond (this project):**  
Notification (email/in-app), optional audit/logs, and later assignment/enrollment-driven alerts — all consuming topics produced by auth, payments, enrollments, courses, assignments.

**One-liner:**  
> “We’ll put domain events on Kafka; notification and other services in our system subscribe in their own consumer groups, while BullMQ still handles reliable email delivery.”

---

## Implementation backlog (when we build it)

- [ ] Add Kafka (local Compose + topics)
- [ ] Define event contracts (`user.registered`, `payment.completed`, …)
- [ ] Publish from API after successful DB writes
- [ ] Notification consumer service → BullMQ email jobs
- [ ] Optional: audit consumer → structured logs / DB
- [ ] Document consumer groups and idempotency keys
