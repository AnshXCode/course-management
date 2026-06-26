# Services — when and why

Reference for when to put logic in `server/services/` instead of a route handler.

---

## What a route does vs what a service does

| Layer | Responsibility |
|-------|----------------|
| **Route** (`server/routes/`) | HTTP: read `req`, validate input (via middleware/schemas), choose status codes, send `res.json()` |
| **Service** (`server/services/`) | Domain logic: database work, business rules, integrations — no Express types |

A route should mostly **orchestrate**. A service should **do the work**.

---

## When to create a service

### 1. Logic is reused outside HTTP

If the same operation is needed from a route **and** a worker, webhook, or script, it belongs in a service.

**Example:** `refreshTokenService.js` is used by:

- `routes/auth.js` — login, logout, refresh
- `jobs/cleanupExpiredTokens.js` — delete expired rows on a schedule

A worker cannot call an Express route handler. Shared logic must live somewhere both can import.

### 2. The operation is a cohesive domain concept

Group related functions around one idea, not around one endpoint.

**Example:** refresh tokens — create, find valid, revoke one, revoke all for user, delete expired. These share hashing, expiry, and table access. Callers compose them as needed (e.g. refresh flow: find → revoke old → create new).

### 3. The flow is non-trivial or will grow

Multi-step flows with side effects (payments, enrollments, notifications) get hard to read and test inside a route.

**Example:** `paymentService.js` — checkout will likely involve course lookup, capacity checks, an external provider (Stripe, etc.), and writing payment rows. Keeping that in a service keeps routes thin and the payment flow in one place.

### 4. You want to test business logic without HTTP

Services accept plain arguments and return data or throw errors. Routes need mocked `req`/`res`, middleware, and status-code assertions.

Prefer testing `findValidRefreshToken(raw)` over testing the same SQL through `POST /refresh`.

---

## When to keep logic in the route

### 1. Thin CRUD with no reuse

List, get, create, update with a single query and a direct JSON response — fine in the route.

**Example:** most handlers in `routes/courses.js` — validate → query → respond. No second caller, little business logic beyond SQL and cache keys.

### 2. Logic is specific to this HTTP response

Choosing 401 vs 403, shaping error messages for the client, reading `req.params` — that orchestration can stay in the route.

**Example:** `POST /login` in `routes/auth.js` — email/password checks and status codes stay in the route; only `createRefreshToken()` is delegated to the service.

### 3. You are still exploring the design

During early work, inline code is acceptable. Extract a service when you see duplication, a second caller, or a block that is hard to follow.

---

## Rule of thumb

| Put it in the **route** | Put it in a **service** |
|-------------------------|-------------------------|
| Parse params/body, pick status codes | DB queries + business rules |
| Map errors to HTTP responses | Logic used by routes **and** jobs/webhooks |
| One-off simple CRUD | Multi-step flows with side effects |
| Tied to this endpoint’s response shape | Operations worth unit testing on their own |

You do not need a service for every route. Add one when reuse, complexity, or testability justify an extra file.

---

## Patterns in this project

### Good service: `refreshTokenService.js`

- Several related functions on one table/concept
- Used from auth routes and the maintenance worker
- No `req`/`res` — only `userId`, raw token strings, etc.

### Route + service split: `routes/auth.js`

- Route: “Is this login allowed? What status code?”
- Service: “Create/store/revoke/find refresh tokens”

### Fine without a service (for now): `routes/courses.js`

- Straightforward queries, cache invalidation, pagination
- Extract `courseService` only if enrollments, payments, or jobs start sharing course logic

### Emerging service: `paymentService.js`

- Checkout is a natural service boundary once routes, webhooks, or jobs all touch payments

---

## Checklist before adding a new service file

1. **Will anything besides one route call this?** (worker, webhook, another route)
2. **Is it more than one query or one clear business rule?**
3. **Would a test without Express be valuable?**
4. **Does it map to a domain noun?** (payment, enrollment, refresh token — not `handlePostRequest`)

If most answers are yes, create `server/services/<name>Service.js` and keep the route to validation + HTTP mapping.
