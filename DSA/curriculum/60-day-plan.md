| Topic              | Frequency   | Top Problems                            |
|--------------------|------------|-----------------------------------------|
| Hash Map / Set     | Very High  | Two Sum, Group Anagrams, Subarray Sum K |
| Sliding Window     | Very High  | Longest Substring, Min Window, Max Ones III |
| Trees (BFS/DFS)    | Very High  | Max Depth, Invert Tree, LCA, Level Order|
| Two Pointers       | High       | 3Sum, Valid Palindrome, Container Water |
| Stack              | High       | Valid Parentheses, Daily Temperatures   |
| Intervals          | High       | Merge Intervals, Meeting Rooms II       |
| Binary Search      | High       | Search Rotated, Find Min Rotated        |
| Graph              | Medium     | Islands, Course Schedule                |
| 1D DP              | Medium     | Climbing Stairs, Coin Change            |
| Design             | High       | LRU Cache, Flatten Nested Array, Trie   |

# 60-Day Frontend DSA Curriculum

> **Daily routine (60 min):** 5 min pattern review → 35 min timed solve → 15 min compare solution → 5 min journal  
> **Weekends:** Re-solve 2 hardest problems from the week without looking.

## How Days Are Structured

Each day folder in `solutions/` contains:
- `problem.md` — recognition signals, invariant, approach
- `solution.js` — runnable JS with inline tests

Run any solution:
```bash
node DSA/solutions/01-hash-map/day-01-two-sum/solution.js
```

---

## Month 1 — Foundations (Patterns 1–6)

### Week 1: Hash Map & Two Pointers

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 1 | Two Sum | 1 | Hash Map | `01-hash-map/day-01-two-sum` |
| 2 | Contains Duplicate | 217 | Hash Set | `01-hash-map/day-02-contains-duplicate` |
| 3 | Valid Anagram | 242 | Frequency Map | `01-hash-map/day-03-valid-anagram` |
| 4 | Group Anagrams | 49 | Hash + Sort Key | `01-hash-map/day-04-group-anagrams` |
| 5 | Subarray Sum Equals K | 560 | Prefix Sum + Map | `01-hash-map/day-05-subarray-sum-k` |
| 6 | Valid Palindrome | 125 | Two Pointers | `02-two-pointers/day-06-valid-palindrome` |
| 7 | **Review** | — | Re-solve Days 1, 4, 5 | — |

### Week 2: Two Pointers & Sliding Window

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 8 | Two Sum II | 167 | Opposite Pointers | `02-two-pointers/day-08-two-sum-ii` |
| 9 | 3Sum | 15 | Sort + Two Pointers | `02-two-pointers/day-09-3sum` |
| 10 | Move Zeroes | 283 | Slow/Fast | `02-two-pointers/day-10-move-zeroes` |
| 11 | Longest Substring Without Repeating | 3 | Sliding Window | `03-sliding-window/day-11-longest-substring` |
| 12 | Permutation in String | 567 | Fixed Window | `03-sliding-window/day-12-permutation-string` |
| 13 | Max Consecutive Ones III | 1004 | Variable Window | `03-sliding-window/day-13-max-ones-iii` |
| 14 | **Review** | — | Re-solve Days 11–13 | — |

### Week 3: Stack & Binary Search

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 15 | Valid Parentheses | 20 | Stack Match | `04-stack/day-15-valid-parentheses` |
| 16 | Min Stack | 155 | Stack + Aux | `04-stack/day-16-min-stack` |
| 17 | Daily Temperatures | 739 | Monotonic Stack | `04-stack/day-17-daily-temperatures` |
| 18 | Binary Search | 704 | Classic BS | `05-binary-search/day-18-binary-search` |
| 19 | Search Insert Position | 35 | Lower Bound | `05-binary-search/day-19-search-insert` |
| 20 | Find Min in Rotated Array | 153 | BS on Rotated | `05-binary-search/day-20-min-rotated` |
| 21 | **Review** | — | Re-solve Days 15, 17, 20 | — |

### Week 4: Linked List & Trees Intro

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 22 | Reverse Linked List | 206 | Pointer Reversal | `06-linked-list/day-22-reverse-list` |
| 23 | Merge Two Sorted Lists | 21 | List Merge | `06-linked-list/day-23-merge-lists` |
| 24 | Linked List Cycle | 141 | Fast/Slow | `06-linked-list/day-24-linked-list-cycle` |
| 25 | Max Depth of Binary Tree | 104 | Tree DFS | `07-tree/day-25-max-depth` |
| 26 | Invert Binary Tree | 226 | Tree DFS | `07-tree/day-26-invert-tree` |
| 27 | Same Tree | 100 | Tree DFS | `07-tree/day-27-same-tree` |
| 28 | **Review** | — | Re-solve Days 22, 25, 26 | — |

---

## Month 2 — Trees, Graphs, Intervals, DP, Design

### Week 5: Tree BFS/DFS

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 29 | Binary Tree Level Order | 102 | BFS | `07-tree/day-29-level-order` |
| 30 | Lowest Common Ancestor | 236 | Tree DFS | `07-tree/day-30-lca` |
| 31 | Diameter of Binary Tree | 543 | DFS + Global | `07-tree/day-31-diameter` |
| 32 | Serialize/Deserialize Tree | 297 | BFS/DFS Design | `07-tree/day-32-serialize-tree` |
| 33 | Flatten Binary Tree to List | 114 | Reverse Morris/DFS | `07-tree/day-33-flatten-tree` |
| 34 | Path Sum | 112 | DFS Path | `07-tree/day-34-path-sum` |
| 35 | **Review** | — | Re-solve Days 29, 30 | — |

### Week 6: Graph & Intervals

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 36 | Number of Islands | 200 | Grid DFS | `08-graph/day-36-number-of-islands` |
| 37 | Course Schedule | 207 | Topo Sort | `08-graph/day-37-course-schedule` |
| 38 | Clone Graph | 133 | Graph DFS + Map | `08-graph/day-38-clone-graph` |
| 39 | Merge Intervals | 56 | Sort + Merge | `09-intervals/day-39-merge-intervals` |
| 40 | Insert Interval | 57 | Interval Insert | `09-intervals/day-40-insert-interval` |
| 41 | Meeting Rooms II | 253 | Sweep Line / Heap | `09-intervals/day-41-meeting-rooms-ii` |
| 42 | **Review** | — | Re-solve Days 36, 39 | — |

### Week 7: DP & Hash Map Advanced

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 43 | Climbing Stairs | 70 | 1D DP | `10-dp/day-43-climbing-stairs` |
| 44 | House Robber | 198 | 1D DP | `10-dp/day-44-house-robber` |
| 45 | Coin Change | 322 | Unbounded DP | `10-dp/day-45-coin-change` |
| 46 | Longest Increasing Subsequence | 300 | DP / BS | `10-dp/day-46-lis` |
| 47 | Top K Frequent Elements | 347 | Bucket Sort | `01-hash-map/day-47-top-k-frequent` |
| 48 | Longest Consecutive Sequence | 128 | Hash Set | `01-hash-map/day-48-longest-consecutive` |
| 49 | **Review** | — | Re-solve Days 43, 45 | — |

### Week 8: Design & Capstone

| Day | Problem | LC# | Pattern | File |
|-----|---------|-----|---------|------|
| 50 | LRU Cache | 146 | Design | `11-design/day-50-lru-cache` |
| 51 | Flatten Nested Array | 2625 | Recursion | `11-design/day-51-flatten-array` |
| 52 | Implement Trie | 208 | Trie | `11-design/day-52-trie` |
| 53 | Container With Most Water | 11 | Two Pointers | `02-two-pointers/day-53-container-water` |
| 54 | Minimum Window Substring | 76 | Sliding Window | `03-sliding-window/day-54-min-window` |
| 55 | Evaluate RPN | 150 | Stack | `04-stack/day-55-evaluate-rpn` |
| 56 | Search Rotated Array | 33 | Binary Search | `05-binary-search/day-56-search-rotated` |
| 57 | Remove Nth From End | 19 | Two Pointer List | `06-linked-list/day-57-remove-nth` |
| 58 | **Mock Interview 1** | — | Random medium | — |
| 59 | **Mock Interview 2** | — | Random medium | — |
| 60 | **Final Review** | — | 5 problems, 25 min each | — |

---

## Spaced Repetition Schedule

After completing a day, mark it in your journal. Revisit:

| After | Action |
|-------|--------|
| 1 day | Re-state pattern + invariant (2 min) |
| 3 days | Re-solve without looking (15 min) |
| 7 days | Re-solve timed (25 min) |
| 30 days | Mock interview random pick |

---

## Progress Tracker

Copy to your notes:

```
[ ] Week 1  [ ] Week 2  [ ] Week 3  [ ] Week 4
[ ] Week 5  [ ] Week 6  [ ] Week 7  [ ] Week 8
Mock 1: ___/45 min   Mock 2: ___/45 min
```

---

## What "Done" Looks Like

For each of the 60 problems you can:

1. Identify the pattern in < 90 seconds
2. State brute force + optimized complexity
3. Implement in JS in < 25 min (medium) / < 15 min (easy)
4. Dry-run one example aloud
5. Name 2 edge cases without prompting

When all 60 are checked — you're interview-ready for mid-level frontend DSA.
