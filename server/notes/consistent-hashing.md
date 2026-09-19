# Consistent hashing — notes

Reference for interview prep — how distributed caches and databases shard data across nodes.

**Read order:** Topic 1 (problem) → Topic 2 (how it works) → Topic 3 (interview Q&A) → Appendix

---

## Index

Line numbers match this file. **Read top to bottom.**

### Read in order

| # | Topic | Start at line |
|---|-------|---------------|
| **1** | [The problem](#topic-1--the-problem) | 59 |
| **2** | [How it works](#topic-2--how-it-works) | 87 |
| **3** | [Interview Q&A](#topic-3--interview-qa) | 142 |
| — | [Appendix](#appendix) | 207 |

### Topic 1

| Section | Line |
|---------|------|
| [Naive approach fails](#naive-approach-fails) | 67 |
| [What consistent hashing fixes](#what-consistent-hashing-fixes) | 79 |

### Topic 2

| Section | Line |
|---------|------|
| [The hash ring](#the-hash-ring) | 95 |
| [Adding a server](#adding-a-server) | 116 |
| [Virtual nodes](#virtual-nodes) | 124 |
| [One-line definition](#one-line-definition) | 134 |

### Topic 3

| Section | Line |
|---------|------|
| [Q1–Q6](#q1-q6) | 150 |
| [Q7–Q12](#q7-q12) | 172 |
| [Where it's used](#where-its-used) | 194 |

### Appendix

| Section | Line |
|---------|------|
| [Comparison table](#comparison-table) | 213 |
| [30-second script](#30-second-script) | 224 |
| [Common mistakes](#common-mistakes) | 230 |
| [Follow-up drawing](#follow-up-drawing) | 239 |

[↑ Back to top](#consistent-hashing--notes)

---

# Topic 1 — The problem

> **Read first** — why modulo hashing isn't enough.

[↑ Index](#index) · **Next:** [Topic 2](#topic-2--how-it-works)

---

## Naive approach fails

1 million sessions across 10 cache servers. Pick server with:

```text
server = hash(key) % 10
```

Works until you **add or remove a server**. Then **~90% of keys remap** → mass migration, cache invalidation, thundering herd.

---

## What consistent hashing fixes

When you add/remove **one** server, only **~1/N** of keys move. Most assignments stay stable.

**Topic 1 complete.** → [Topic 2](#topic-2--how-it-works)

---

# Topic 2 — How it works

> **Read second** — the hash ring mental model.

[↑ Index](#index) · **Previous:** [Topic 1](#topic-1--the-problem) · **Next:** [Topic 3](#topic-3--interview-qa)

---

## The hash ring

Circle numbered 0 to 2³²−1:

- Each **server** at `hash(server_name)`
- Each **key** at `hash(key)`

**Rule:** Key belongs to the **first server clockwise** from the key's position.

```text
                    Server C
                       ●
          Key K ●

    Server A ●              ● Server B

Key K → walk clockwise → Server B
```

---

## Adding a server

Add **Server D** between A and B. Only keys between D and B's old position move. Keys on A and C **untouched**.

Roughly **1/N** keys move per single node change.

---

## Virtual nodes

One physical server might own 70% of the ring. **Fix:** many virtual nodes per machine (`server-A#1`, `server-A#2`, …).

- Even load distribution
- On failure, keys spread to **many** nodes (not one neighbor)
- Weight powerful machines with more vnodes

---

## One-line definition

> **Consistent hashing** maps keys and servers onto a ring so add/remove only remaps keys near that server — keeping most assignments stable.

**Topic 2 complete.** → [Topic 3](#topic-3--interview-qa)

---

# Topic 3 — Interview Q&A

> **Read third** — most common questions.

[↑ Index](#index) · **Previous:** [Topic 2](#topic-2--how-it-works) · **Next:** [Appendix](#appendix)

---

## Q1–Q6

**Q1: Why not `hash(key) % N`?**  
When N changes, most keys remap. Consistent hashing limits remapping to ~1/N.

**Q2: Server added?**  
Only keys between new server and clockwise neighbor move.

**Q3: Server removed?**  
Keys go to next server clockwise. Use **replication** so data isn't lost.

**Q4: Virtual nodes?**  
Multiple hash points per machine — even load, smoother redistribution.

**Q5: Hot keys?**  
Consistent hashing doesn't fix hot keys. Add replicas, app-level sharding, local cache.

**Q6: Time complexity?**  
Lookup O(log N) with sorted ring; migration O(K) where K ≈ total_keys / N.

---

## Q7–Q12

**Q7: Dynamo relation?**  
Dynamo/Cassandra partition by token ranges on the ring. Replication = next R nodes clockwise.

**Q8: vs rendezvous hashing (HRW)?**  
HRW: highest `hash(key, server)` wins. O(N) lookup. Consistent hashing better for large clusters.

**Q9: Hash collision on ring?**  
Rare. Use salting, skip to next, or more vnodes.

**Q10: Migration on topology change?**  
Background copy affected range; dual-read/write during transition. Redis Cluster automates with 16384 slots.

**Q11: Redis Cluster?**  
**Yes, conceptually.** `CRC16(key) mod 16384` → slot → node. Fixed-slot variant of consistent hashing.

**Q12: Replication on ring?**  
Primary = first clockwise; replicas on next R−1 nodes.

---

## Where it's used

| System | Use |
|--------|-----|
| Memcached / Redis clusters | Shard keys |
| Dynamo / Cassandra | Partition data |
| CDNs | Route to edge |
| Load balancers | Sticky routing with minimal reshuffle |

**Topic 3 complete.** → [Appendix](#appendix)

---

# Appendix

[↑ Index](#index)

---

## Comparison table

| Approach | Keys move when N changes? | Even load? | Complexity |
|----------|---------------------------|------------|------------|
| `hash % N` | ~all keys | Can be OK | Very low |
| Consistent hashing | ~1/N per change | Needs vnodes | Medium |
| Range partitioning | Depends on ranges | Hot range risk | Low |
| Directory-based | None (lookup table) | Flexible | High |

---

## 30-second script

> "Servers and keys on a hash ring. Each key goes to the next server clockwise. Add/remove moves only ~1/N keys. Virtual nodes balance load. Used in Dynamo, Cassandra, Redis Cluster."

---

## Common mistakes

1. Saying it **guarantees** even load (needs vnodes)
2. Forgetting **replication** on failure
3. Confusing with **round-robin** load balancing
4. Not mentioning **Redis slots** or **Dynamo**

---

## Follow-up drawing

Be ready to sketch:

1. Ring with 3 servers and 2 keys
2. Add 4th server — shade only moved keys
3. Server dies — keys flow clockwise to next node
