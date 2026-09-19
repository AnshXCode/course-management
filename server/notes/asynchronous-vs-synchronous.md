# Async, await & the event loop — notes

Reference for interview prep — what `await` actually does in Node.js and when the thread really blocks.

**Read order:** Topic 1 (concepts) → Topic 2 (event loop) → Topic 3 (what blocks) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [Two meanings of "block"](#topic-1--two-meanings-of-block) | 56 |
| **2** | [How the event loop handles await](#topic-2--how-the-event-loop-handles-await) | 87 |
| **3** | [When the thread actually blocks](#topic-3--when-the-thread-actually-blocks) | 149 |
| — | [Appendix](#appendix) | 195 |

### Topic 1

| Section | Line |
|---------|------|
| [Wrong vs right (interview)](#wrong-vs-right-interview) | 64 |
| [Async function vs event loop](#async-function-vs-event-loop) | 73 |

### Topic 2

| Section | Line |
|---------|------|
| [Step-by-step: two requests](#step-by-step-two-requests) | 95 |
| [What await is under the hood](#what-await-is-under-the-hood) | 124 |
| [In this project](#in-this-project) | 137 |

### Topic 3

| Section | Line |
|---------|------|
| [Sync CPU work](#sync-cpu-work) | 157 |
| [Sync I/O APIs](#sync-io-apis) | 170 |
| [Work before the first await](#work-before-the-first-await) | 180 |

### Appendix

| Section | Line |
|---------|------|
| [Interview cheat sheet](#interview-cheat-sheet) | 201 |
| [Related files](#related-files) | 215 |

[↑ Back to top](#async-await--the-event-loop--notes)

---

# Topic 1 — Two meanings of "block"

> **Read first** — most confusion comes from mixing up these two meanings.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--how-the-event-loop-handles-await)

---

## Wrong vs right (interview)

| | Statement |
|---|-----------|
| **Wrong** | "`await` blocks the thread so the server can't handle other requests." |
| **Right** | "`await` suspends the **current async function** and returns control to the event loop. For I/O-bound work, other callbacks and requests run while we wait. Only **sync CPU work** or **sync I/O** blocks the thread." |

---

## Async function vs event loop

| | Pauses | Free to run other work? |
|---|--------|-------------------------|
| **`await` on I/O** (DB, HTTP, Redis) | This function only | **Yes** — event loop handles other requests |
| **Sync CPU loop** | Entire Node thread | **No** — nothing else runs |
| **`readFileSync`** | Entire Node thread | **No** |

**One-liner:** `await` pauses **your function**, not **the server** (for normal async I/O).

**Topic 1 complete.** → [Topic 2](#topic-2--how-the-event-loop-handles-await)

---

# Topic 2 — How the event loop handles `await`

> **Read second** — the mechanism behind Topic 1.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--two-meanings-of-block) · **Next:** [Topic 3](#topic-3--when-the-thread-actually-blocks)

---

## Step-by-step: two requests

```text
Request A hits handleLogin()
  → hits await db.query()
  → function pauses, Promise registered
  → control returns to event loop

Event loop is FREE:
  → Request B handled
  → Redis callback runs
  → another job in worker runs

DB responds for Request A
  → callback runs
  → handleLogin() resumes after await
  → res.json(user)
```

```text
Single JS thread (event loop)
─────────────────────────────────────────────
Req A:  [start]──await DB────────────[resume][done]
Req B:       [start]──await DB──[resume][done]
Worker:              [job1 await]────[job1 done]
```

---

## What await is under the hood

`await` is syntactic sugar over Promises. It **yields** to the event loop instead of busy-waiting.

```js
async function handler(req, res) {
  const rows = await pool.query('SELECT ...');  // yields here on I/O
  res.json(rows);                               // resumes when DB responds
}
```

---

## In this project

| Code | Behavior |
|------|----------|
| Express route with `await pool.query()` | Other `/api/*` requests still run |
| BullMQ worker with `await sendEmail()` | Other jobs can run (if concurrency > 1) |
| `asyncHandler` wrapping routes | Thrown errors reach `errorHandler` via `next(err)` |

**Topic 2 complete.** → [Topic 3](#topic-3--when-the-thread-actually-blocks)

---

# Topic 3 — When the thread actually blocks

> **Read third** — the cases where the whole server really freezes.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--how-the-event-loop-handles-await) · **Next:** [Appendix](#appendix)

---

## Sync CPU work

```js
async function bad() {
  await something();                        // fine — I/O
  for (let i = 0; i < 1e10; i++) { }       // BLOCKS — no await, pure CPU
}
```

`async` does not move CPU work off-thread. Use **worker threads** or **child processes** for heavy computation.

---

## Sync I/O APIs

```js
const data = fs.readFileSync('huge.json');  // blocks entire event loop
```

Prefer `fs.promises.readFile` or `readFile` with callback.

---

## Work before the first `await`

```js
async function handler() {
  JSON.parse(hugeString);   // blocks until done
  await db.query(...);      // only here does it yield
}
```

Everything **before** the first `await` runs synchronously on the thread.

**Topic 3 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| Does `await` wait before the next line? | **Yes**, in that function |
| Does it block the whole Node thread? | **No**, for async I/O |
| Can other HTTP requests run while one `await`s? | **Yes** |
| What actually blocks Node? | Sync code, `*Sync` APIs, heavy CPU |
| `async` vs multi-threading? | Event loop = cooperative I/O; threads = parallel CPU |

**One-liner:** *"`await` suspends the current async function and returns control to the event loop — other requests run while we wait on I/O; only synchronous work blocks the thread."*

---

## Related files

- `server/middleware/asyncHandler.js` — wraps async routes so errors reach `errorHandler`
- `server/worker.js` — async job handlers
- `server/notes/bullmq-redis-workers.md` — worker concurrency vs event loop
