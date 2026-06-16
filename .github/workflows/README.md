# GitHub Actions workflows — guide

This folder contains **workflow files** that tell GitHub what to automate when events happen in the repository (push, pull request, schedule, etc.).

Our project uses **`ci.yml`** to run automated checks on the **server** (tests) and **client** (lint) before code is merged or deployed.

---

## Why does GitHub Actions use a YAML file?

GitHub Actions is **configuration as code**. Instead of clicking buttons in the UI to set up CI, you describe the pipeline in a text file and commit it to the repo.

YAML (`.yml` or `.yaml`) is used because it is:

| Reason | Explanation |
|--------|-------------|
| **Human-readable** | Indentation-based structure is easy to scan |
| **Machine-parseable** | GitHub can read it and run jobs reliably |
| **Version-controlled** | Same PR that changes code can change CI rules |
| **Industry standard** | Docker Compose, Kubernetes, many CI tools use YAML |

GitHub specifically looks for workflow files in **`.github/workflows/`**. Any `*.yml` or `*.yaml` file there is treated as a workflow definition.

---

## When is a YAML file picked up as a workflow?

A file becomes a GitHub Actions workflow when **all** of these are true:

1. It lives in **`.github/workflows/`**
2. It has extension **`.yml`** or **`.yaml`**
3. It contains valid workflow keys (`name`, `on`, `jobs`, etc.)
4. It is on the branch GitHub is evaluating (usually `main` for default CI)

**Examples that are NOT workflows:**

| Path | Why not |
|------|---------|
| `server/docker-compose.yml` | Wrong folder — Docker config, not GitHub Actions |
| `ci.yaml` in repo root | Wrong folder |
| `.github/workflows/notes.md` | Wrong extension |
| Invalid YAML syntax | GitHub shows a workflow parse error |

You can have **multiple** workflow files in this folder (e.g. `ci.yml`, `deploy.yml`). Each runs independently based on its own `on:` triggers.

---

## Basic YAML syntax (what you need to read workflows)

YAML uses **indentation** (spaces, not tabs) to show nesting. **`#`** starts a comment.

### Scalars (plain values)

```yaml
name: CI
runs-on: ubuntu-latest
node-version: 22
enabled: true
```

Strings with special characters can be quoted:

```yaml
path: 'server/**'
message: "Build failed"
```

### Lists (arrays)

```yaml
branches: [main]
# or multi-line:
branches:
  - main
  - develop
```

### Maps (objects / key-value groups)

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Multi-line strings

```yaml
filters: |
  server:
    - 'server/**'
```

The `|` keeps newlines (used for path-filter config in our workflow).

### Important rules

- **Indent with 2 spaces** per level (GitHub examples use 2; be consistent)
- **Do not mix tabs and spaces** — parsing can break silently
- **Colons need a space after them**: `key: value` not `key:value`
- Order of keys at the same level usually does not matter

---

## GitHub Actions vocabulary

| Term | Meaning |
|------|---------|
| **Workflow** | One `.yml` file = one pipeline (e.g. `ci.yml`) |
| **Trigger (`on`)** | Event that starts the workflow (`push`, `pull_request`, `schedule`, …) |
| **Job** | A unit of work that runs on one runner VM (`server-test`, `client-lint`) |
| **Step** | One command or action inside a job (`npm test`, `actions/checkout`) |
| **Runner** | The machine that executes the job (`ubuntu-latest`) |
| **Action** | Reusable step from the marketplace (`actions/setup-node@v4`) |
| **Secret** | Encrypted value in repo Settings → Actions → Secrets |
| **Expression** | `${{ }}` syntax to reference context (secrets, job outputs, etc.) |

---

## Our `ci.yml` — line by line

### Workflow name and triggers

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

- **`name`**: Label shown in the GitHub Actions tab.
- **`on`**: When to run.
  - **`push` to `main`**: Every direct push to `main`.
  - **`pull_request` to `main`**: Every PR targeting `main`.

So contributors get checks on PRs; merges to `main` are also verified.

---

### Job 1: `changes` (path filter)

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      server: ${{ steps.filter.outputs.server }}
      client: ${{ steps.filter.outputs.client }}
```

This is a **monorepo optimization**. The repo has both `server/` and `client/`. We do not want to run server tests when only React files changed, or lint the client when only API code changed.

| Step | Purpose |
|------|---------|
| `actions/checkout@v4` | Clone the repo on the runner |
| `dorny/paths-filter@v3` | Compare changed files against path globs |
| **`outputs`** | Expose `server` / `client` as `'true'` or `'false'` to later jobs |

**Path rules:**

```yaml
server:
  - 'server/**'
  - '.github/workflows/ci.yml'
client:
  - 'client/**'
  - '.github/workflows/ci.yml'
```

- Changes under `server/` → `server-test` may run.
- Changes under `client/` → `client-lint` may run.
- Changes to **`ci.yml` itself** → both run (workflow edits can affect either side).
- Changes only to `README.md` or `plan.md` → **neither** job runs.

---

### Job 2: `server-test`

```yaml
server-test:
  needs: changes
  if: needs.changes.outputs.server == 'true'
```

- **`needs: changes`**: Wait for the `changes` job to finish.
- **`if`**: Skip entirely if no server-related files changed.

```yaml
defaults:
  run:
    working-directory: server
```

All `run:` shell commands execute inside `server/` (no need to `cd server` every time).

**Steps:**

| Step | What it does |
|------|----------------|
| Checkout | Get source code |
| Setup Node.js 22 | Install Node; cache `npm` using `server/package-lock.json` |
| `npm ci` | Clean install from lockfile (preferred in CI over `npm install`) |
| `npx prisma generate` | Generate Prisma client (not committed to git) |
| `npm test` | Run integration tests via `tests/run.mjs` |

**Environment variables** on the test step come from **GitHub Secrets** (never committed):

- `DATABASE_URL`, `JWT_SECRET` — app and auth
- `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` — test helper login
- `SMTP_*`, `EMAIL_FROM` — register test sends verification email

`NODE_ENV=test` disables Redis in tests and silences noisy logging.

---

### Job 3: `client-lint`

```yaml
client-lint:
  needs: changes
  if: needs.changes.outputs.client == 'true'
```

Same pattern as server: run only when client paths (or `ci.yml`) changed.

| Step | What it does |
|------|----------------|
| Checkout | Get source code |
| Setup Node.js 22 | Cache from `client/package-lock.json` |
| `npm ci` | Install client dependencies |
| `npm run lint` | ESLint — enforces shared style/rules for all contributors |

No secrets required for lint.

---

## How jobs relate to each other

```text
push / pull_request
        │
        ▼
   ┌─────────┐
   │ changes │  (which folders changed?)
   └────┬────┘
        │
   ┌────┴────┐
   ▼         ▼
server-test  client-lint
(if server)  (if client)
```

Jobs with no `needs` dependency on each other can run **in parallel**. Here, `server-test` and `client-lint` both `need` `changes`, then can run **at the same time** if both outputs are `'true'`.

---

## `${{ }}` expressions (used in this file)

GitHub replaces these at runtime:

| Expression | Example in our file |
|------------|---------------------|
| `${{ secrets.NAME }}` | `secrets.DATABASE_URL` |
| `${{ steps.filter.outputs.server }}` | Output from a previous step |
| `${{ needs.changes.outputs.client }}` | Output from another job |

---

## What “green” means for the team

| Check | Passes when |
|-------|-------------|
| **server-test** | All server integration tests pass against real DB (via secrets) |
| **client-lint** | ESLint reports no errors |

If either required job fails, the PR shows a red ❌. Teams often enable **branch protection** on `main` to require these checks before merge.

---

## Local equivalents (run before push)

```bash
# Server
cd server && NODE_ENV=test npm test

# Client
cd client && npm run lint
```

CI should match what you see locally when secrets and Node version align.

---

## Further reading

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [dorny/paths-filter](https://github.com/dorny/paths-filter) — path filter action used in `ci.yml`
