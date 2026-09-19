# Forward proxy vs reverse proxy — notes

Reference for interview prep and for how traffic is shaped in front of clients vs servers.

**Read order:** Topic 1 (forward) → Topic 2 (reverse) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| — | [One-line difference](#one-line-difference) | 50 |
| **1** | [Forward proxy](#topic-1--forward-proxy) | 63 |
| **2** | [Reverse proxy](#topic-2--reverse-proxy) | 101 |
| — | [Appendix](#appendix) | 140 |

### Topic 1 — Forward proxy

| Section | Line |
|---------|------|
| [How it works](#how-it-works-forward) | 73 |
| [Primary uses](#primary-uses-forward) | 83 |
| [Client awareness](#client-awareness-forward) | 91 |

### Topic 2 — Reverse proxy

| Section | Line |
|---------|------|
| [How it works](#how-it-works-reverse) | 111 |
| [Primary uses](#primary-uses-reverse) | 121 |
| [Client awareness](#client-awareness-reverse) | 130 |

### Appendix

| Section | Line |
|---------|------|
| [Comparison table](#comparison-table) | 146 |
| [Mental model](#mental-model) | 159 |
| [This project](#this-project) | 170 |

[↑ Back to top](#forward-proxy-vs-reverse-proxy--notes)

---

## One-line difference

| | Sits in front of | Traffic | Hides |
|---|----------------|---------|-------|
| **Forward proxy** | **Clients** | Outgoing | The **user** from the internet |
| **Reverse proxy** | **Servers** | Incoming | The **origin server** from the internet |

The fundamental difference is **who they serve**.

**Start reading:** [Topic 1 — Forward proxy](#topic-1--forward-proxy)

---

# Topic 1 — Forward proxy

> **Read first** — client-side intermediary.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--reverse-proxy)

Acts on behalf of the **client** (individual user, corporate network, etc.).

---

## How it works (forward)

```text
Client → Forward proxy → Internet (origin server)
```

The proxy fetches data from the web and returns it to the client.

---

## Primary uses (forward)

- Privacy / masking client IP
- Bypassing geographic restrictions
- Content filtering and policy enforcement on outbound traffic

---

## Client awareness (forward)

The client **knows** the proxy is there and must configure their device or browser to use it.

**Common tools:** Squid, Cloudflare WARP, corporate HTTP proxies

**Topic 1 complete.** → [Topic 2 — Reverse proxy](#topic-2--reverse-proxy)

---

# Topic 2 — Reverse proxy

> **Read second** — server-side intermediary. **This is what load balancers and NGINX do for your API.**

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--forward-proxy) · **Next:** [Appendix](#appendix)

Acts on behalf of the **origin web servers**.

---

## How it works (reverse)

```text
Internet (user) → Reverse proxy → Internal origin server(s)
```

The proxy pulls the response from an internal server and delivers it to the user.

---

## Primary uses (reverse)

- Load balancing across multiple backends
- SSL/TLS termination
- Caching static or dynamic content
- Protecting origin servers from direct exposure (DDoS)

---

## Client awareness (reverse)

The client is usually **unaware** — they only see the public hostname.

**Common tools:** NGINX, Apache, HAProxy, Cloudflare (in front of your origin)

**Topic 2 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Comparison table

| Feature | Forward proxy | Reverse proxy |
|---------|---------------|---------------|
| Acts on behalf of | The client (user) | The origin server |
| Location | In front of client network | In front of origin servers |
| Traffic direction | Outgoing (client → internet) | Incoming (internet → server) |
| Visibility | Client is aware | Client is usually unaware |
| Main benefit | Masks client identity | Masks server; LB, security |
| Common tools | Squid, Cloudflare WARP | NGINX, Apache, Cloudflare |

---

## Mental model

Ask: **"Who is hidden?"**

- Forward proxy → **client** is hidden from servers
- Reverse proxy → **server** is hidden from clients

Both are intermediaries on opposite sides of the connection.

---

## This project

| Piece | Role |
|-------|------|
| Render / Fly load balancer | **Reverse proxy** in front of API containers |
| Vercel CDN | **Reverse proxy** + static cache for React |
| `docker-compose` client → api | Local reverse-proxy pattern (depends_on api) |

See also: `server/notes/horizontal-scaling-and-kubernetes.md`
