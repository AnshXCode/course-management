# DSA Patterns — Recognition Without Memorization

> **Core idea:** Every problem is a variation of an **invariant** you maintain while moving pointers, expanding windows, or traversing nodes. Learn the invariant, not the solution.

## How to Use This Guide

1. Read the **"When you hear…"** trigger
2. Learn the **invariant** (what must stay true)
3. Learn the **template** (skeleton code)
4. Solve 4–6 problems in that pattern until you can identify it in < 90 seconds

---

## Pattern 1: Hash Map — Complement & Frequency

**When you hear:** "find two elements", "count occurrences", "group by", "anagram"

**Invariant:** A map holds information about elements we've already processed.

```js
// Complement: nums[i] + complement = target
const seen = new Map(); // value → index
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (seen.has(need)) return [seen.get(need), i];
  seen.set(nums[i], i);
}

// Frequency: count then decide
const freq = new Map();
for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
```

**Problems:** Two Sum, Group Anagrams, Subarray Sum Equals K, Top K Frequent

---

## Pattern 2: Two Pointers

**When you hear:** "sorted array", "pair with sum", "palindrome", "in-place"

**Invariant:** Moving `left`/`right` (or `slow`/`fast`) eliminates impossible candidates.

```js
let left = 0, right = arr.length - 1;
while (left < right) {
  const sum = arr[left] + arr[right];
  if (sum === target) { /* found */ }
  else if (sum < target) left++;
  else right--;
}
```

**Variants:**
- **Opposite ends** → sorted pair problems (Two Sum II, 3Sum)
- **Same direction (slow/fast)** → remove duplicates, move zeroes
- **Fast/slow on linked list** → cycle detection

---

## Pattern 3: Sliding Window

**When you hear:** "longest/shortest substring", "subarray with constraint", "at most K"

**Invariant:** Window `[left, right]` is valid; when invalid, shrink `left` until valid again.

```js
const count = new Map();
let left = 0, best = 0;

for (let right = 0; right < s.length; right++) {
  // expand: add s[right] to window
  count.set(s[right], (count.get(s[right]) ?? 0) + 1);

  while (/* window invalid */) {
    // shrink: remove s[left]
    count.set(s[left], count.get(s[left]) - 1);
    left++;
  }

  best = Math.max(best, right - left + 1);
}
```

**Key question:** What makes the window **invalid**? (duplicate char, sum > k, etc.)

---

## Pattern 4: Stack — Matching & Monotonic

**When you hear:** "valid parentheses", "next greater element", "evaluate expression"

**Invariant:** Stack holds candidates not yet resolved.

```js
// Matching brackets
const stack = [];
for (const ch of s) {
  if (isOpen(ch)) stack.push(ch);
  else if (stack.pop() !== matching(ch)) return false;
}
return stack.length === 0;

// Monotonic stack (next greater)
for (let i = 0; i < temps.length; i++) {
  while (stack.length && temps[i] > temps[stack.at(-1)]) {
    const idx = stack.pop();
    result[idx] = i - idx;
  }
  stack.push(i);
}
```

---

## Pattern 5: Binary Search — Boundary Finding

**When you hear:** "sorted", "O(log n)", "find first/last position", "minimum that works"

**Invariant:** Eliminate half the search space each step.

```js
let lo = 0, hi = arr.length - 1;
while (lo <= hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}
return -1;
```

**Twist:** Search on **answer space** (min capacity, max speed) not array index.

---

## Pattern 6: Linked List — Pointer Surgery

**When you hear:** "reverse", "merge sorted", "cycle", "nth from end"

**Invariant:** Always save `next` before rewiring pointers.

```js
// Reverse
let prev = null, curr = head;
while (curr) {
  const next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
return prev;
```

---

## Pattern 7: Tree DFS / BFS

**When you hear:** "nested", "depth", "level order", "ancestor", "path"

**DFS invariant:** Process node, recurse children, combine results.

```js
function dfs(node) {
  if (!node) return baseCase;
  const left = dfs(node.left);
  const right = dfs(node.right);
  return combine(node.val, left, right);
}
```

**BFS invariant:** Queue holds frontier of current level.

```js
const queue = [root];
while (queue.length) {
  const levelSize = queue.length;
  for (let i = 0; i < levelSize; i++) {
    const node = queue.shift();
  }
}
```

**Frontend connection:** Component tree, nested JSON, folder/file explorer.

---

## Pattern 8: Graph — BFS / DFS / Topo Sort

**When you hear:** "connected", "islands", "dependencies", "can finish all courses"

```js
// Grid DFS (islands)
function dfs(r, c) {
  if (outOfBounds || grid[r][c] === '0') return;
  grid[r][c] = '0'; // mark visited
  for (const [dr, dc] of directions) dfs(r + dr, c + dc);
}

// Topo sort (Kahn's BFS)
const indegree = buildIndegree(graph);
const queue = nodes.filter(n => indegree[n] === 0);
```

---

## Pattern 9: Intervals

**When you hear:** "overlapping meetings", "merge ranges", "insert event"

**Invariant:** Sort by start time; merge if `current.start <= prev.end`.

```js
intervals.sort((a, b) => a[0] - b[0]);
const merged = [intervals[0]];
for (let i = 1; i < intervals.length; i++) {
  const last = merged.at(-1);
  if (intervals[i][0] <= last[1]) {
    last[1] = Math.max(last[1], intervals[i][1]);
  } else {
    merged.push(intervals[i]);
  }
}
```

---

## Pattern 10: 1D Dynamic Programming

**When you hear:** "count ways", "minimum coins", "max without adjacent"

**Invariant:** `dp[i]` = optimal answer for prefix ending at `i`.

```js
// Climbing stairs: dp[i] = dp[i-1] + dp[i-2]
const dp = [0, 1, 2];
for (let i = 3; i <= n; i++) {
  dp[i] = dp[i - 1] + dp[i - 2];
}
```

**How to derive:** Ask "what's the last choice?" → recurrence.

---

## Pattern 11: Design — LRU / Trie / Flatten

**LRU:** `Map` for O(1) lookup + doubly linked list for O(1) eviction order.

**Trie:** Each node has `children: Map` + `isEnd` flag.

**Flatten:** Recursion with depth limit; `Array.isArray` guard.

---

## Pattern Recognition Cheat Sheet

| Keywords in prompt | Pattern |
|--------------------|---------|
| two sum, complement, frequency, anagram | Hash Map |
| sorted, palindrome, pair, in-place | Two Pointers |
| substring, subarray, longest, at most K | Sliding Window |
| parentheses, next greater, calculator | Stack |
| sorted + O(log n) | Binary Search |
| reverse list, cycle, merge lists | Linked List |
| tree, depth, level, ancestor | Tree DFS/BFS |
| islands, dependencies, connected | Graph |
| meetings, calendar, merge ranges | Intervals |
| count ways, min coins, rob houses | 1D DP |
| cache, autocomplete, flatten nested | Design |

---

## The Meta-Skill: Reduce Unknown → Known

When you see a new problem:

1. **Restate** in your own words
2. **Classify** using table above
3. **State invariant** before coding
4. **Brute force** if pattern unclear — then optimize
5. **Generalize:** "This is sliding window with 'at most K distinct' — same as Fruit Into Baskets"

That's how you solve problems **not** in the 60 — by mapping them to a pattern you've internalized.
