# Frontend Interview — Learning Notes

Quick reference from practice problems. Each section: **problem → why → fix**.

---

## 1. `await` and API errors

**Problem**
- When a promise **rejects**, `await` **throws** (like `throw`).
- Code after `await` does **not** run unless you catch it.
- `setLoading(false)` after `await` gets skipped → spinner stuck forever.

**Why**
- Reject = error path, not a normal return value.
- You must handle success, error, and cleanup separately.

**Fix — use `try / catch / finally` for every fetch**

```ts
setLoading(true)
setError(false)

try {
  const data = await fetchSomething(url, signal)
  if (signal?.aborted) return
  setData(data)
} catch {
  if (signal?.aborted) return   // abort is NOT a user error
  setError(true)
} finally {
  if (!signal?.aborted) setLoading(false)
}
```

**Points to remember**
- `try` → success path
- `catch` → API failed (network, 500, etc.)
- `finally` → always turn off loading (works for both success and failure)
- `signal.aborted` in `catch` → user typed again or navigated away; don't show error UI

**Rule:** Every `await` on an API needs error handling — `try/catch`, `.catch()`, or a library (React Query, SWR).

---

## 2. AbortController

**Problem**
- User triggers a new request before the old one finishes.
- Old response arrives late and overwrites new results (race condition).

**Fix**
- Create `AbortController` **inside** the effect (not at component top level).
- Pass `signal` to `fetch(url, { signal })`.
- Abort in effect cleanup: `return () => controller.abort()`.

**When to abort**
- **On debounce change** → cancel previous fetch when query changes.
- **On keystroke (Q2)** → cancel in-flight request immediately when user types again (before debounce updates).

**Abort vs error**
- Real `fetch` + abort → promise **rejects** → goes to `catch` → then `finally` runs. ✅
- Abort is **not** a failure — check `signal.aborted` and return early; don't show "Something went wrong".
- Some mocks only clear a timer and never resolve/reject → `await` hangs. Production APIs don't behave this way.

**Rule:** One controller per fetch, created in the effect, aborted in cleanup.

---

## 3. `useEffect` runs on mount

**Problem**
- Effect runs on **first render** too, not only when user interacts.
- Empty search input still triggers a fetch on page load.

**Fix**
- Guard before fetching:

```ts
if (query.trim().length < 2) {
  setResults([])
  setLoading(false)
  setError(false)
  return   // no fetch
}
```

**Also reset state manually on early return**
- Early `return` skips the fetch — nothing else clears old data.
- Must reset: `setUserData([])`, `setOpen(false)`, `setLoading(false)`, `setError(false)`.
- Without this, clearing the input can still show the previous search results.

---

## 4. One resource → one `useEffect` (pagination + search)

**Problem**
- Two effects — one on `[page]`, one on `[debounced]` — both fetch the same list.
- Causes: double requests, race conditions, `initialRender` hacks.

**Why it's wrong**
- Same data (product list) + same fetch function = should be **one pipeline**.

**Fix — derive one URL, one effect**

```ts
const query = debouncedSearch.trim()

const fetchUrl = useMemo(() => {
  if (query.length > 0) return searchProductsUrl(query)
  return productsUrl(PAGE_SIZE, (page - 1) * PAGE_SIZE)
}, [query, page])

useEffect(() => {
  const controller = new AbortController()
  fetchData(fetchUrl, controller.signal)
  return () => controller.abort()
}, [fetchUrl])
```

**How it behaves**
- Empty search → paginated list URL (uses `page`).
- Non-empty search → search URL (ignore pagination).
- `page` or `debouncedSearch` changes → `fetchUrl` changes → effect runs **once**.

**Checklist before writing effects**
1. What am I fetching?
2. What inputs change it? (page, search, filters…)
3. Can I compute one `fetchUrl = f(inputs)`?
4. One effect on `[fetchUrl]`
5. UI reads the same `loading / error / data` state

**When separate effects ARE ok**
- Different concerns, different resources (e.g. Q2: abort immediately on `search`, fetch on `debounce`).

**Rule:** Same resource + same fetch → **one effect**.

---

## 5. Autocomplete — selection fills input (Q2)

**Problem**
- Clicking a row calls `setSearch(user.name)`.
- That updates debounce → fetch effect runs again → unnecessary refetch.

**Fix**

**On row click**
- `setSearch(user.name)` — input shows full name
- `setSelected(user)`
- `setOpen(false)` — close dropdown

**In fetch effect — skip refetch after selection**
```ts
if (selected && debounce === selected.name) return
```

**Clear selection only when user types**
- Put `setSelected(null)` in input `onChange`.
- Do **not** clear `selected` inside the fetch effect.

**Why**
- Selection sets both `search` and `selected` to the same name → guard blocks refetch.
- User typing again clears `selected` → fetching resumes normally.

---

## 6. Safe access to fetched data

**Problem**
- `data` is empty/undefined while loading or after an error.
- `data.products.map(...)` crashes.

**Fix — optional chaining + fallbacks**

```ts
data?.total
data?.products?.length
data?.products?.map(...)
`${data?.total ?? 0} products`
```

**Rule:** Any value from async state → use `?.` and `??` until you know it's loaded.

---

## 7. Fetch checklist (copy before every API feature)

- [ ] `try / catch / finally` around `await`
- [ ] `if (signal?.aborted) return` before updating state
- [ ] `if (!res.ok) throw ...` before `res.json()`
- [ ] Guard empty/short input — don't fetch on mount with bad query
- [ ] Reset stale state when skipping fetch
- [ ] One `fetchUrl` + one effect for the same list
- [ ] `AbortController` inside effect + cleanup
- [ ] `data?.field` when rendering async results
- [ ] Retry button reuses the same URL (and signal if possible)
- [ ] Effect has cleanup (abort/timers) — survives StrictMode double mount in dev
- [ ] No `initialRender` ref to skip first effect (breaks under StrictMode)

---

## 8. Quick mental model

| Situation | What happens | What to do |
|---|---|---|
| API rejects | `await` throws | `catch` → show error |
| API succeeds | `await` returns data | `try` → set state |
| Either way | Loading must end | `finally` → `setLoading(false)` |
| User aborts | `fetch` rejects with abort | `catch` → ignore if `signal.aborted` |
| Empty input | Effect still runs on mount | Early `return` + reset state |
| Page + search | Two effects fetch same data | One `fetchUrl`, one effect |
| Row selected | Search changes → refetch | Guard: `debounce === selected.name` |
| Data not loaded yet | `data` is undefined | Use `data?.products` |
| StrictMode (dev only) | Effect runs twice on mount | Proper cleanup; never skip with `initialRender` ref |

---

## 9. React StrictMode — effects run twice (dev only)

**What you see**
- In dev, `useEffect` seems to run **twice** on mount.
- API called twice, console logs duplicated, loading flickers.
- You add `initialRender` ref to skip first run — then things break in weird ways.

**Why it happens**
- `<StrictMode>` (in `main.tsx`) **intentionally** does in development only:
  1. Mount component → run effects
  2. Unmount → run effect **cleanup**
  3. Remount → run effects **again**
- React is testing that your cleanup is correct (like real navigation away/back).
- **Production builds do NOT double-run.** Users never see this.

**What NOT to do**
- ❌ `initialRender` / `useRef` to skip the "first" effect run
  - StrictMode remounts — ref still says "not first" → you skip the **real** mount or run at wrong times
- ❌ Disable StrictMode as your permanent fix (ok briefly to debug, not a pattern)
- ❌ Assume duplicate calls = two separate bugs in your effect logic (often it's StrictMode + missing cleanup)

**What TO do**

**1. Write effects with proper cleanup (best fix)**
```ts
useEffect(() => {
  const controller = new AbortController()

  fetch(url, { signal: controller.signal })
    .then(/* ... */)

  return () => controller.abort()   // 1st run cleaned up before 2nd run
}, [fetchUrl])
```
- 1st fetch starts → StrictMode cleanup **aborts** it → 2nd fetch runs → only latest matters.
- Duplicate network calls in dev can still happen briefly; aborted one should not update state.

**2. Ignore aborted requests in `catch` / before `setState`**
```ts
if (controller.signal.aborted) return
```

**3. Guard invalid fetches (empty query) — not to beat StrictMode, but for real logic**
```ts
if (query.trim().length < 2) return
```

**4. Debug tip — confirm it's StrictMode**
- Temporarily remove `<StrictMode>` wrapper in `main.tsx`.
- If double-fetch disappears → it was StrictMode, not a production bug.
- Put it back and fix cleanup instead.

**StrictMode lifecycle (dev)**
```
Mount  → effect runs    → fetch #1 starts
Unmount → cleanup runs → fetch #1 aborted ✅
Remount → effect runs  → fetch #2 starts (this one should win)
```

**Rule:** Never skip effects with refs to "fix" StrictMode. Write cleanup so double mount is safe. Production runs once.
