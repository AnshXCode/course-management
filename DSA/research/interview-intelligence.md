# Frontend DSA Interview Intelligence (Jul 2025 – Jul 2026)

> **Note:** No specific company was named in your notes. This report aggregates patterns from **Glassdoor**, **LeetCode Discuss**, **Medium**, **Reddit**, and **dev.to** for **general mid-level frontend DSA rounds** at companies like Google, Meta, Amazon, Microsoft, Stripe, Reddit, Upstox, and product startups.

## What Changed in 2025–2026

| Trend | Detail | Sources |
|-------|--------|---------|
| DSA still exists | ~60% of senior loops still include a coding round; weight dropped from ~40% to ~15–20% of final decision | Stackademic 2026, NeetCode |
| Difficulty softened | Hard DP and exotic graph theory are rare; **medium-easy** dominates | SpaceComplexity, GreatFrontEnd |
| Frontend-specific tilt | Trees (DOM), hash maps (dedup/group), sliding window (streams), stacks (parsing), design (LRU) | FrontendInterviews.dev, Medium |
| Machine coding grew | Autocomplete, infinite scroll, debounce — often weighted **equal or more** than DSA | GreatFrontEnd, FrontendAtlas |
| Communication matters more | Silent coding fails; trade-off discussion scores higher than micro-optimizations | FrontendInterviews.dev, Reddit handbook |

## DSA Questions Grouped by Topic & Frequency

Frequency is **relative** across frontend interview reports (not a scientific count).  
🔴 Very High · 🟠 High · 🟡 Medium · 🟢 Lower (still worth knowing)

---

### 1. Hash Map / Set — 🔴 Most Common

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Two Sum | 1 | 🔴 | O(1) lookup pattern for any "find complement" UI filter |
| Contains Duplicate | 217 | 🔴 | Deduping lists, message threads |
| Valid Anagram | 242 | 🟠 | Search suggestion matching |
| Group Anagrams | 49 | 🟠 | Grouping/tagging data client-side |
| Subarray Sum Equals K | 560 | 🟠 | Running totals, analytics windows |
| Top K Frequent Elements | 347 | 🟡 | Popular items, trending tags |
| Longest Consecutive Sequence | 128 | 🟡 | Streak detection |
| First Unique Character | 387 | 🟡 | Notification badges |

**Pattern signal:** "Find pair", "count frequency", "group by key", "have we seen this before?"

---

### 2. Two Pointers — 🔴 Very Common

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Valid Palindrome | 125 | 🟠 | Input validation |
| Two Sum II (sorted) | 167 | 🟠 | Merging sorted API pages |
| 3Sum | 15 | 🟠 | Multi-filter combinations |
| Container With Most Water | 11 | 🟡 | Layout optimization metaphor |
| Move Zeroes | 283 | 🟡 | In-place list compaction |
| Remove Duplicates from Sorted Array | 26 | 🟡 | Compact rendered lists |

**Pattern signal:** Sorted input, pair/triplet from ends, in-place compaction.

---

### 3. Sliding Window — 🔴 Very Common

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Longest Substring Without Repeating Characters | 3 | 🔴 | Debounced search, stream scanning |
| Minimum Window Substring | 76 | 🟠 | Pattern matching in text |
| Max Consecutive Ones III | 1004 | 🟡 | Allow K errors in a stream |
| Permutation in String | 567 | 🟡 | Autocomplete prefix checks |
| Fruit Into Baskets | 904 | 🟡 | Limited category window |

**Pattern signal:** "Longest/shortest subarray/substring with constraint", contiguous segment.

---

### 4. Stack / Queue — 🟠 High

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Valid Parentheses | 20 | 🔴 | JSX/HTML parsing, expression eval |
| Min Stack | 155 | 🟡 | Undo history with min tracking |
| Daily Temperatures | 739 | 🟡 | "Next greater" UI events |
| Evaluate Reverse Polish Notation | 150 | 🟡 | Calculator widgets |
| Implement Queue using Stacks | 232 | 🟡 | Task scheduling |

**Pattern signal:** Matching brackets, monotonic stack, LIFO/FIFO processing.

---

### 5. Binary Search — 🟠 High

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Binary Search | 704 | 🟠 | Sorted data lookup |
| Search Insert Position | 35 | 🟠 | Insert into sorted virtual list |
| Find Minimum in Rotated Sorted Array | 153 | 🟡 | Circular buffer search |
| Search in Rotated Sorted Array | 33 | 🟡 | Rotated timeline lookup |

**Pattern signal:** Sorted array, "find boundary", O(log n) required.

---

### 6. Linked List — 🟡 Medium

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Reverse Linked List | 206 | 🟠 | Pointer manipulation fluency |
| Merge Two Sorted Lists | 21 | 🟠 | Merging sorted feeds |
| Linked List Cycle | 141 | 🟡 | Circular reference detection |
| Remove Nth Node From End | 19 | 🟡 | Two-pointer on lists |

**Pattern signal:** Pointer reversal, fast/slow pointers, merge sorted sequences.

---

### 7. Tree BFS / DFS — 🔴 Very Common (DOM = Tree)

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Maximum Depth of Binary Tree | 104 | 🔴 | Nested component depth |
| Invert Binary Tree | 226 | 🔴 | Tree transformation |
| Binary Tree Level Order Traversal | 102 | 🔴 | BFS layer rendering |
| Lowest Common Ancestor | 236 | 🟠 | Shared parent in component tree |
| Same Tree | 100 | 🟠 | Tree diffing |
| Diameter of Binary Tree | 543 | 🟡 | Longest path in hierarchy |
| Serialize/Deserialize Binary Tree | 297 | 🟡 | State persistence |

**Pattern signal:** Nested JSON, component trees, folder structures, comment threads.

---

### 8. Graph — 🟡 Medium

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Number of Islands | 200 | 🟠 | Grid UI regions |
| Course Schedule | 207 | 🟠 | Dependency resolution (build order) |
| Clone Graph | 133 | 🟡 | Deep copy with references |
| Pacific Atlantic Water Flow | 417 | 🟢 | Multi-source BFS |

**Pattern signal:** Dependencies, reachability, connected components.

---

### 9. Intervals — 🟠 High

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Merge Intervals | 56 | 🔴 | Calendar/scheduling UI |
| Insert Interval | 57 | 🟠 | Adding events to timeline |
| Meeting Rooms II | 253 | 🟡 | Resource overlap count |

**Pattern signal:** Overlapping time ranges, scheduling, calendar blocks.

---

### 10. 1D Dynamic Programming — 🟡 Medium (basics only)

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| Climbing Stairs | 70 | 🟠 | Simple recurrence building |
| House Robber | 198 | 🟡 | Non-adjacent max selection |
| Coin Change | 322 | 🟡 | Minimum steps problems |
| Longest Increasing Subsequence | 300 | 🟡 | Trend analysis |

**Pattern signal:** "Count ways", "min/max with choices", optimal substructure.

---

### 11. Design / Recursion — 🟠 High (frontend-specific)

| Question | LC# | Freq | Why frontend cares |
|----------|-----|------|-------------------|
| LRU Cache | 146 | 🔴 | Browser cache, API memoization |
| Flatten Nested Array | 2625 | 🔴 | Meta has asked variants |
| Implement Trie (Autocomplete) | 208 | 🟠 | Search suggestions |
| Flatten Binary Tree to Linked List | 114 | 🟡 | Tree → flat list |

**Pattern signal:** "Design a cache", "flatten nested structure", "autocomplete engine".

---

## Company-Specific Notes (from public reports)

| Company | DSA style | Non-DSA emphasis |
|---------|-----------|------------------|
| **Google / Amazon / Microsoft** | Full DSA loop + frontend depth | System design, UI coding |
| **Meta** | Lighter pure DSA; flatten nested array variants | Frontend system design |
| **Reddit** | Arrays/filters, dedupe without Set, form→JSON | Vanilla JS, communication |
| **Stripe** | Clean code, medium DSA | Accessibility, docs-quality |
| **Upstox / Fintech** | HackerRank medium + JS depth | React optimization, admin panels |
| **Startups** | Often skip DSA or very light | Machine coding, take-homes |

## Reddit / dev.to / Medium — Recurring Non-LeetCode DSA Adjacent

These appear alongside DSA and share the same **patterns**:

- Debounce / throttle (sliding window + timer)
- Promise.all / race / any (concurrency)
- Deep clone (graph traversal with cycle detection)
- Async scheduler with max concurrency (queue + semaphore)
- Flatten nested object/array (recursion)
- LRU cache (hash map + doubly linked list)

These are covered in `solutions/11-design/` and your existing `frontend-interview/` folder.

## Recommended Prep Split (60 days)

| Time | Focus |
|------|-------|
| 70% | 60 curated DSA problems by pattern (`curriculum/60-day-plan.md`) |
| 20% | Re-solve missed problems + explain aloud |
| 10% | Machine coding / JS utilities (debounce, Promise pool) |

---

*Sources consulted: [FrontendInterviews.dev](https://frontendinterviews.dev), [GreatFrontEnd Algorithms](https://www.greatfrontend.com/front-end-interview-playbook/algorithms), [SpaceComplexity Top 15](https://spacecomplexity.ai/blog/leetcode-problems-for-frontend-interview), [Frontend Interview Handbook](https://www.frontendinterviewhandbook.com), Reddit FE handbook, Medium (Sonika/Walmart, constCoder, Simon Gomes), dev.to interview prep posts, LeetCode Discuss trends.*
