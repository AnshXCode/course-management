# Currying in Express middleware — notes

Notes on how `validateBody` and `asyncHandler` use **currying**, why we use that pattern, and what you gain from it.

**Read order:** Topic 1 (concepts) → Topic 2 (`validateBody`) → Topic 3 (`asyncHandler`) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [What is currying + Express shape](#topic-1--what-is-currying--express-shape) | 61 |
| **2** | [`validateBody`](#topic-2--validatebody) | 104 |
| **3** | [`asyncHandler`](#topic-3--asynchandler) | 162 |
| — | [Appendix](#appendix) | 224 |

### Topic 1

| Section | Line |
|---------|------|
| [What is currying?](#what-is-currying) | 69 |
| [What Express wants](#what-express-wants) | 86 |

### Topic 2

| Section | Line |
|---------|------|
| [Source code](#validatebody-source) | 112 |
| [Two functions](#validatebody-two-functions) | 126 |
| [Route example](#validatebody-route-example) | 136 |
| [Without currying](#without-currying) | 154 |

### Topic 3

| Section | Line |
|---------|------|
| [Source code](#asynchandler-source) | 170 |
| [Why we need it](#why-we-need-asynchandler) | 185 |
| [Middleware chain](#middleware-chain) | 203 |

### Appendix

| Section | Line |
|---------|------|
| [Side-by-side comparison](#side-by-side-comparison) | 230 |
| [Benefits](#benefits) | 239 |
| [Mental model](#mental-model) | 248 |
| [Self-test](#self-test) | 261 |
| [Same pattern elsewhere](#same-pattern-elsewhere) | 271 |
| [Related files](#related-files) | 280 |

[↑ Back to top](#currying-in-express-middleware--notes)

---

# Topic 1 — What is currying + Express shape

> **Read first** — foundation for both middleware helpers.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--validatebody)

---

## What is currying?

A function that takes **some** arguments now and returns **another function** for the rest later.

```js
// Normal
function add(a, b) { return a + b; }

// Curried
const addCurried = (a) => (b) => a + b;
addCurried(2)(3); // 5
```

**First call** locks in `a`. **Second call** receives `b`.

---

## What Express wants

Middleware must be `(req, res, next) => { ... }`.

```js
router.post("/", someMiddleware, routeHandler);
// Express calls: someMiddleware(req, res, next)
```

Currying builds that in two steps:

1. **Configure** — pass schema or route handler `fn`
2. **Run** — Express passes `req`, `res`, `next`

**Topic 1 complete.** → [Topic 2 — `validateBody`](#topic-2--validatebody)

---

# Topic 2 — `validateBody`

> **Read second** — currying for Zod validation.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--what-is-currying--express-shape) · **Next:** [Topic 3](#topic-3--asynchandler)

---

## validateBody — source

```js
// server/middleware/validate.js
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) return sendValidationError(result, res);
  req.body = result.data;
  next();
};
```

---

## validateBody — two functions

```text
validateBody(schema)  →  returns middleware(req, res, next)
         ↑                           ↑
   you call at route setup    Express calls per request
```

---

## validateBody — route example

```js
// server/routes/courses.js
router.post("/", requireAdmin, validateBody(courseBodySchema), asyncHandler(async (req, res) => {
  // req.body already validated and coerced
}));
```

Same helper, different schemas:

```js
validateBody(courseBodySchema)
validateBody(loginSchema)
```

---

## Without currying

You'd copy-paste validation logic for every schema — one function per route. Currying = **one** implementation, many specializations.

**Topic 2 complete.** → [Topic 3 — `asyncHandler`](#topic-3--asynchandler)

---

# Topic 3 — `asyncHandler`

> **Read third** — currying for async error forwarding.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--validatebody) · **Next:** [Appendix](#appendix)

---

## asyncHandler — source

```js
// server/middleware/asyncHandler.js
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
```

---

## Why we need asyncHandler

`async` handlers return Promises. Uncaught throws **don't** reach `errorHandler` without a wrapper.

```js
// Without — throw may become unhandled rejection
router.get("/", async (req, res) => {
  await pool.query(...);
});

// With — throw → catch → next(err) → errorHandler
router.get("/", asyncHandler(async (req, res) => {
  await pool.query(...);
}));
```

---

## Middleware chain

```js
router.post("/", requireAdmin, validateBody(courseBodySchema), asyncHandler(handler));
```

```text
POST /api/courses
    → requireAuth (app level)
    → requireAdmin        (403 if not admin)
    → validateBody        (400 if invalid)
    → asyncHandler        (errors → errorHandler)
    → 201 response
```

Each item is either `(req, res, next)` directly, or a **factory** that returns it.

**Topic 3 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Side-by-side comparison

| | First call (you) | Second call (Express) | Stored in closure |
|--|------------------|----------------------|-------------------|
| `validateBody(schema)` | Zod schema | `(req, res, next)` | `schema` |
| `asyncHandler(fn)` | Route function | `(req, res, next)` | `fn` |

---

## Benefits

- **Reuse** — one `validateBody`, one `asyncHandler`, all routes
- **Express-compatible** — always returns `(req, res, next)`
- **Readable** — `validateBody(courseBodySchema)` reads as config at call site
- **Composable** — order = argument order in route definition

---

## Mental model

```text
(config) => (req, res, next) => { ... use config ... }

validateBody:  config = schema
asyncHandler:  config = route handler fn
```

Read `validateBody(something)` as: *"Give me middleware configured with `something`."*

---

## Self-test

1. What does `validateBody(schema)` return? → `(req, res, next) => { ... }`
2. Who calls it? → Express, per request
3. Why not `validateBody(req, res, next, schema)`? → Express only passes 3 args
4. Remove `asyncHandler` and `await` throws? → May not reach `errorHandler`
5. Why `req.body = result.data`? → Downstream gets coerced Zod output

---

## Same pattern elsewhere

- `rateLimit({ windowMs: 60000 })` → returns middleware
- Redux: `(store) => (next) => (action) => { ... }`

**Outer = config, inner = request.**

---

## Related files

- `server/middleware/validate.js` — `validateBody`, `validateParams`
- `server/middleware/asyncHandler.js` — `asyncHandler`
- `server/routes/courses.js` — example usage
- `server/notes/asynchronous-vs-synchronous.md` — why async routes need the wrapper
