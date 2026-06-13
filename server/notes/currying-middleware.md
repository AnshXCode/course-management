# Currying in Express middleware

Notes on how `validateBody` and `asyncHandler` use **currying**, why we use that pattern, and what you gain from it.

Related files:

- `server/middleware/validate.js` — `validateBody`, `validateParams`
- `server/middleware/asyncHandler.js` — `asyncHandler`
- Example usage: `server/routes/courses.js`

---

## 1. What is currying?

**Currying** means: a function that does not take all arguments at once. Instead, it takes **some** arguments now and returns **another function** that waits for the rest later.

```js
// Normal function — all arguments at once
function add(a, b) {
  return a + b;
}
add(2, 3); // 5

// Curried version — one argument, then the next
function addCurried(a) {
  return function (b) {
    return a + b;
  };
}
addCurried(2)(3); // 5
```

Same idea in arrow functions (what we use):

```js
const addCurried = (a) => (b) => a + b;
addCurried(2)(3); // 5
```

**First call** locks in `a`. **Second call** receives `b`.

---

## 2. What Express actually wants

Express middleware must look like this:

```js
function middleware(req, res, next) {
  // do something
  next(); // or send a response
}
```

When you write:

```js
router.post("/", someMiddleware, routeHandler);
```

Express will call `someMiddleware(req, res, next)` on every matching request.

So anything you pass in the route must eventually become a function with **signature** `(req, res, next)`.

Currying is how we **build** that function in two steps:

1. **Configure** (pass schema, or route handler `fn`)
2. **Run** (Express passes `req`, `res`, `next`)

---

## 3. `validateBody` — step by step

### Source

```js
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) return sendValidationError(result, res);

  req.body = result.data;
  next();
};
```

### Two functions, one after the other

```text
validateBody(schema)  →  returns middleware(req, res, next)
         ↑                           ↑
   you call this              Express calls this
   when defining route        on each request
```

### Example from your courses route

```js
router.post("/", requireAdmin, validateBody(courseBodySchema), asyncHandler(async (req, res) => {
  // ...
}));
```

What JavaScript does:

```js
// Step 1 — when the app starts (route is registered)
const middleware = validateBody(courseBodySchema);
// middleware is now: (req, res, next) => { ... uses courseBodySchema ... }

// Step 2 — when a POST /api/courses request arrives
middleware(req, res, next);
// Inside: safeParse(req.body) against courseBodySchema
// If OK: req.body = cleaned data, next()
// If bad: res.status(400).json(...), stop chain
```

### Same helper, different schemas

```js
validateBody(courseBodySchema)   // for courses
validateBody(loginSchema)        // for auth login
validateBody(assignmentCreateSchema) // for assignments (when you add it)
```

You write **one** `validateBody` function. Each route **specializes** it by passing a different `schema`. That specialization is the first curry call.

### Without currying (repetitive)

You would need something like:

```js
function validateCourseBody(req, res, next) {
  const result = courseBodySchema.safeParse(req.body ?? {});
  // ... same logic repeated ...
}

function validateLoginBody(req, res, next) {
  const result = loginSchema.safeParse(req.body ?? {});
  // ... same logic repeated ...
}
```

Currying avoids copy-pasting the validation logic for every schema.

---

## 4. `asyncHandler` — step by step

### Source

```js
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
```

### Two functions again

```text
asyncHandler(routeFn)  →  returns async middleware(req, res, next)
        ↑                            ↑
  your async route            Express calls this;
  handler passed in           wraps fn in try/catch
```

### Example

```js
router.get("/", asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT ...");
  res.json(result.rows);
}));
```

Breakdown:

```js
// Step 1 — register route
const wrapped = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT ...");
  res.json(result.rows);
});
// wrapped is: async (req, res, next) => { try { await fn(...) } catch { next(err) } }

// Step 2 — request comes in
await wrapped(req, res, next);
```

### Why we need it

`async` route handlers return Promises. If you `throw` or reject inside async code, Express 4/5 does **not** automatically send that to your `errorHandler` unless you catch it.

**Without asyncHandler:**

```js
router.get("/", async (req, res) => {
  const data = await prisma.courses.findMany(); // if this throws → unhandled rejection
  res.json(data);
});
```

**With asyncHandler:**

```js
router.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.courses.findMany(); // throw → catch → next(err) → errorHandler
  res.json(data);
}));
```

One wrapper, every route gets the same error forwarding.

---

## 5. Middleware chain on one route

Real line from `courses.js`:

```js
router.post(
  "/",
  requireAdmin,
  validateBody(courseBodySchema),
  asyncHandler(async (req, res) => {
    // create course — req.body already validated
  })
);
```

Request flow:

```text
POST /api/courses
    │
    ▼
requireAuth (on app.use — runs first)
    │
    ▼
requireAdmin(req, res, next)
    │  not admin → 403, stop
    ▼
validateBody(courseBodySchema)(req, res, next)
    │  invalid body → 400, stop
    │  valid → req.body normalized, next()
    ▼
asyncHandler(handler)(req, res, next)
    │  await DB work
    │  error → next(err) → errorHandler
    ▼
201 response
```

Each item in the route is either:

- Already `(req, res, next)`, e.g. `requireAdmin`, or
- A **curried factory** that returns `(req, res, next)`, e.g. `validateBody(schema)`, `asyncHandler(fn)`

---

## 6. Side-by-side comparison

| | First call (you) | Second call (Express) | What gets “stored” |
|--|----------------|------------------------|---------------------|
| `validateBody(schema)` | Pass Zod schema | `(req, res, next)` | `schema` in closure |
| `asyncHandler(fn)` | Pass route function | `(req, res, next)` | `fn` in closure |

**Closure** = the inner function remembers variables from the outer function (`schema`, `fn`) even after the outer function finished running.

---

## 7. Why use currying here? (Benefits)

### Reuse one pattern, many routes

- One `validateBody` for all Zod schemas
- One `asyncHandler` for all async routes

### Express-compatible shape

Express needs `(req, res, next)`. Currying lets you **pre-fill** extra config (schema, handler) and still return exactly that shape.

### Readable routes

```js
validateBody(courseBodySchema)
```

Reads as: “validate body **with this schema**.” The schema is visible at the call site.

### Less duplication

Validation logic and try/catch logic live in **one file**, not copied into every route.

### Easy to compose

Middleware order is just argument order:

```js
router.put("/:id", requireAdmin, validateBody(schema), asyncHandler(handler));
```

---

## 8. “Is this the same as partial application?”

**Very similar.** People often use the terms loosely.

- **Currying:** transform `f(a, b, c)` into `f(a)(b)(c)` — one argument per function.
- **Partial application:** fix **some** arguments of a function, get a new function for the rest.

For middleware, the idea is: **fix schema (or fn) first, leave `(req, res, next)` for Express.**

---

## 9. Mental model (remember this)

```text
Curried middleware factory:

  (config) => (req, res, next) => { ... use config + req ... }

validateBody:
  config = schema

asyncHandler:
  config = your route handler fn
```

When you see:

```js
validateBody(something)
asyncHandler(something)
```

Read it as:

> “Give me a middleware configured with `something`.”

---

## 10. Quick self-test

1. What does `validateBody(courseBodySchema)` return?  
   → A function `(req, res, next) => { ... }`

2. Who calls that returned function?  
   → Express, on each request

3. Why not write `validateBody(req, res, next, schema)`?  
   → Express only calls `(req, res, next)`. Extra config must be fixed **before** via currying.

4. What happens if `asyncHandler` is removed and `await prisma...` throws?  
   → Error may not reach `errorHandler` cleanly

5. Why is `req.body = result.data` useful after Zod?  
   → Downstream code gets coerced/validated data (numbers as numbers, dates as dates, defaults applied)

---

## 11. Same pattern elsewhere

You will see currying-style APIs in many places:

- `router.get(path, middleware1, middleware2, handler)`
- `app.use(requireAuth)`
- Redux middleware `(store) => (next) => (action) => { ... }`
- Rate limiters: `rateLimit({ windowMs: 60000 })` → returns middleware

Once you recognize “outer function = config, inner function = Express request,” the pattern clicks everywhere.
