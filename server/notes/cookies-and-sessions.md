# Cookies, sessions, and SPA auth — notes

Reference for interview prep — cookies, sessions, JWT, and when each fits a Node + React SPA.

**This project today:** JWT access + refresh in `localStorage`, `Authorization: Bearer` (`client/src/api/config.js`, `server/routes/auth.js`). No cookies on the auth hot path.

**Read order:** Topic 1 (cookies) → Topic 2 (auth mechanisms) → Topic 3 (SPA + security) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| — | [Overview — three mechanisms](#overview--three-mechanisms) | 67 |
| **1** | [Cookies — fundamentals](#topic-1--cookies--fundamentals) | 82 |
| **2** | [Auth mechanisms](#topic-2--auth-mechanisms) | 125 |
| **3** | [SPA, security & production](#topic-3--spa-security--production) | 188 |
| — | [Appendix](#appendix) | 282 |

### Topic 1 — Cookies

| Section | Line |
|---------|------|
| [What is a cookie?](#what-is-a-cookie) | 90 |
| [Important attributes](#important-attributes) | 100 |
| [Cookie vs localStorage](#cookie-vs-localstorage) | 112 |

### Topic 2 — Auth mechanisms

| Section | Line |
|---------|------|
| [Session auth (classic)](#session-auth-classic) | 133 |
| [JWT auth (your project)](#jwt-auth-your-project) | 144 |
| [Three auth patterns](#three-auth-patterns) | 156 |
| [Do backends use cookies?](#do-backends-use-cookies) | 175 |

### Topic 3 — SPA, security & production

| Section | Line |
|---------|------|
| [When cookies help in SPA](#when-cookies-help-in-spa) | 196 |
| [Highest-value upgrade](#highest-value-upgrade) | 210 |
| [CORS + cookies](#cors--cookies) | 224 |
| [Security comparison](#security-comparison) | 242 |
| [Sessions at scale](#sessions-at-scale) | 253 |
| [OAuth / SSO](#oauth--sso) | 264 |
| [CSRF in 30 seconds](#csrf-in-30-seconds) | 274 |

### Appendix

| Section | Line |
|---------|------|
| [What to implement vs know](#what-to-implement-vs-know) | 288 |
| [Interview cheat sheet](#interview-cheat-sheet) | 299 |
| [Related files](#related-files) | 315 |
| [Further reading](#further-reading) | 325 |

[↑ Back to top](#cookies-sessions-and-spa-auth--notes)

---

## Overview — three mechanisms

| Mechanism | Who stores auth? | How it travels |
|-----------|------------------|----------------|
| **Cookie (session id)** | Server (Redis/Postgres) | Browser auto-sends |
| **Cookie (token)** | Token in httpOnly cookie | Browser auto-sends |
| **JWT in header** | Client (memory / localStorage) | `Authorization: Bearer` |

**Session** = server remembers you; cookie is the lookup key.  
**JWT** = server verifies signed token; no DB lookup per request (unless blocklist).

**Start reading:** [Topic 1 — Cookies](#topic-1--cookies--fundamentals)

---

# Topic 1 — Cookies — fundamentals

> **Read first** — what cookies are before auth patterns.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--auth-mechanisms)

---

## What is a cookie?

Small name/value pair the **server sets** via `Set-Cookie`; browser stores and **auto-sends** on matching requests.

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

---

## Important attributes

| Attribute | Meaning |
|-----------|---------|
| `HttpOnly` | JS cannot read → helps against XSS token theft |
| `Secure` | HTTPS only |
| `SameSite=Strict\|Lax\|None` | Cross-site sending; `None` requires `Secure` |
| `Domain` / `Path` | Which URLs receive the cookie |
| `Max-Age` / `Expires` | Lifetime |

---

## Cookie vs localStorage

| | Cookie | localStorage |
|---|--------|--------------|
| Sent automatically | Yes | No — JS attaches to requests |
| Readable by JS | Only if not HttpOnly | Yes — any script |
| Size limit | ~4 KB | ~5 MB |
| Cross-origin | CORS + `credentials: 'include'` | Bearer + CORS |

**Topic 1 complete.** → [Topic 2 — Auth mechanisms](#topic-2--auth-mechanisms)

---

# Topic 2 — Auth mechanisms

> **Read second** — session vs JWT vs hybrid.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--cookies--fundamentals) · **Next:** [Topic 3](#topic-3--spa-security--production)

---

## Session auth (classic)

```text
Login → session in Redis → Set-Cookie: sessionId=xyz
Next request → cookie auto-sent → server looks up session
```

**Stateful:** every request may hit session store. Common in Rails, Django, banks. At scale: **Redis** session store shared across API replicas.

---

## JWT auth (your project)

```text
Login → server signs JWT → client stores tokens
Request → Authorization: Bearer <accessToken>
Refresh → POST refresh token → validate in Postgres → rotate
```

**Stateless access** (verify signature). **Stateful refresh** (tokens in Postgres with revoke/rotation).

---

## Three auth patterns

| # | Pattern | Best for |
|---|---------|----------|
| 1 | **Session cookie** — id only, data in Redis | Same-site server-rendered apps |
| 2 | **JWT in header** — your project | SPAs, mobile, microservices |
| 3 | **Hybrid** — access JWT in memory + refresh in httpOnly cookie | Industry sweet spot for SPAs |

```text
Hybrid:
  Login  → Set-Cookie: refresh (HttpOnly)
  API    → Authorization: Bearer <short access JWT>
  Refresh→ POST /refresh (cookie auto-sent)
```

Not classic `express-session` — still mostly stateless API with one cookie for the long-lived secret.

---

## Do backends use cookies?

| Area | Cookies common? |
|------|-----------------|
| Server-rendered apps | **Very** |
| OAuth / SSO | **Very** |
| SPA + separate API | **Sometimes** (refresh-in-cookie) |
| Mobile / third-party API | **Rare** (Bearer / API keys) |

**Topic 2 complete.** → [Topic 3](#topic-3--spa-security--production)

---

# Topic 3 — SPA, security & production

> **Read third** — when to use cookies in your architecture, traps, upgrades.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--auth-mechanisms) · **Next:** [Appendix](#appendix)

---

## When cookies help in SPA

| Use case | Cookie helps? |
|----------|---------------|
| **Refresh token storage** | **Yes — top pick** (httpOnly vs XSS) |
| **Access token** | Usually **no** (Bearer in memory simpler) |
| **OAuth social login** | **Yes** |
| **CSRF** | **Yes, if cookie authenticates** |
| **Same-site BFF** | **Yes** (Next.js API routes) |

**Stay header-only (your approach) when:** separate origins, mobile clients, simple portfolio, short access TTL + rotation mitigates XSS on refresh in localStorage.

---

## Highest-value upgrade

Move **only refresh token** to httpOnly cookie:

```text
Before: { accessToken, refreshToken } → both localStorage
After:  { accessToken, user } + Set-Cookie refresh (HttpOnly)
        access in React state (not localStorage)
```

Requires: `credentials: 'include'`, CORS `credentials: true` + explicit origin, CSRF on cookie routes. **No `express-session` needed.**

---

## CORS + cookies

Bearer (no credentials change):

```js
fetch(url, { headers: { Authorization: `Bearer ${token}` } })
```

Cookie auth (must include credentials):

```js
fetch(url, { method: 'POST', credentials: 'include' })
```

Server: `cors({ origin: 'https://app.example.com', credentials: true })` — not `*`.

---

## Security comparison

| Threat | JWT in localStorage | Refresh in httpOnly cookie | Session cookie |
|--------|---------------------|----------------------------|----------------|
| XSS steals access | **Yes** | Memory — harder | Session id if not HttpOnly |
| XSS steals refresh | **Yes** | **Much harder** | N/A |
| CSRF | Low | **Higher** — SameSite/CSRF token | **Higher** |
| Horizontal scale | Easy | Easy + refresh in DB | Shared Redis sessions |

---

## Sessions at scale

```text
API #1 ──┐
API #2 ──┼──► Redis (sessions)
```

In-memory session on one box → broken when scaled. Same rule as rate limits: **shared store** or **stateless JWT**.

---

## OAuth / SSO

```text
User → Google → callback → httpOnly cookie OR tokens to SPA
```

Explain in interviews even if project uses username/password only.

---

## CSRF in 30 seconds

Cookies auto-send → evil site can trigger authenticated POST. **Not a problem for Bearer** (attacker can't read token). Mitigate cookie auth: `SameSite`, CSRF token, double-submit cookie.

**Topic 3 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## What to implement vs know

| Goal | Action |
|------|--------|
| Pass interviews | **Know this doc** |
| Explain portfolio | Current JWT setup is enough |
| Production-harden | Refresh in httpOnly cookie |
| Learn classic sessions | Optional `express-session` + Redis lab |

---

## Interview cheat sheet

| Question | Answer |
|----------|--------|
| Cookie vs session? | Cookie = transport; session = server state keyed by cookie id |
| Your app auth? | Short JWT access + refresh in Postgres with rotation; Bearer header |
| Stateless or stateful? | Stateless access; refresh/revoke stateful in DB |
| When cookies in SPA? | httpOnly refresh; OAuth; same-site BFF |
| HttpOnly / SameSite? | XSS protection / CSRF defense |
| Improve project? | Refresh in httpOnly cookie; access in memory |
| Need express-session? | Not for this architecture |

**One-liner:** *"Stateless JWT API for access, revocable refresh in DB; I'd put refresh in an httpOnly cookie in production to reduce XSS risk."*

---

## Related files

- `client/src/api/config.js` — localStorage tokens, refresh flow
- `client/src/context/AuthProvider.jsx` — auth context
- `server/routes/auth.js` — login, refresh, logout
- `server/services/refreshTokenService.js` — refresh CRUD + rotation
- `server/notes/horizontal-scaling-and-kubernetes.md` — shared stores at scale

---

## Further reading

- [MDN: HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
