# To-do: Batch processing

**Status:** Planned — not implemented yet.  
**Goal:** Add a real **batch processing** feature to this project after we understand the concept below.

---

## What is batch processing?

**Batch processing** = handle a **group of items together** (or on a schedule), instead of one-by-one in a live user request.

| Style | How it works | Example |
|-------|----------------|--------|
| **Online / request-response** | User calls API → process **one** thing → respond | `POST /enrollments` for one student |
| **Batch** | Collect many records (or a file) → process in bulk → report result | Enroll 500 students from a CSV overnight |

Typical traits:

- **Many inputs** in one run (rows, IDs, file lines)
- Often **async / background** (user doesn’t wait on each row)
- Often **scheduled** or **triggered** (“run this job”)
- Needs **progress, partial failure, retries** (row 3 fails, rest continue)
- Optimized for **throughput**, not interactive latency

```text
Online:     Request → one unit of work → Response

Batch:      [item1, item2, … itemN] → worker processes chunk → summary
            (or cron: “every night, process everything pending”)
```

### Batch vs background job vs event-driven

| Term | Meaning |
|------|---------|
| **Background job** | Work off the HTTP path (your BullMQ email / token cleanup) |
| **Batch processing** | That work (or a job) operates on a **set/bulk** of records |
| **Event-driven** | React to events as they happen (Kafka); can still *feed* a batch |

Token cleanup is a **scheduled background job**. It is only lightly “batch-like” (one SQL `DELETE` over many rows). A clearer batch feature is: **upload/process many rows with per-row results**.

### Why teams use it

- Bulk import/export (CSV of students, courses)
- Nightly reports, digests, reconciling payments
- Backfills (“recompute enrollment counts for all courses”)
- Rate-limited third-party APIs (send 1000 emails in chunks)

---

## How it could fit *this* project (ideas for later)

Pick one when we implement:

| Idea | Batch shape |
|------|-------------|
| **Bulk enroll students** | Admin uploads CSV → job processes N rows → success/fail report |
| **Bulk create courses** | Same pattern for courses |
| **Nightly digest** | One job aggregates many enrollments/payments → one email or report |
| **Backfill** | Re-verify or re-index many records in chunks of 100 |

Suggested stack (aligns with what we already have):

```text
API:  POST /api/batches (upload or start job)
      → enqueue BullMQ job { batchId }
Worker: load rows → process in chunks → update batch_status / errors
Optional later: Kafka event batch.completed → notification service
```

Redis/BullMQ = run the batch job. Postgres = store batch + row results.

---

## What “done” looks like (implementation checklist)

When we build it:

- [ ] Decide feature (recommend: **CSV bulk enroll** or **bulk student import**)
- [ ] DB: `batches` + `batch_rows` (or equivalent) for status / errors
- [ ] API: start batch + get status (`pending | running | completed | failed`)
- [ ] Worker: process in **chunks** (e.g. 50–100 rows), idempotent where possible
- [ ] Partial failure: continue on row error; return per-row errors
- [ ] Admin UI (optional): upload + progress
- [ ] Note in `server/notes/` + resume bullet if it ships

---

## Interview one-liner

> “Batch processing means handling many records in one job—often in the background—optimized for throughput, with chunking and partial-failure handling. We’ll add it here (e.g. bulk enroll) on BullMQ, separate from single-request APIs.”

---

## References in this repo

- Background jobs today: `server/notes/bullmq-redis-workers.md` (email + token cleanup cron)
- Planned events: `server/notes/kafka-notification-system.md` (batch can *emit* `batch.completed` later)
