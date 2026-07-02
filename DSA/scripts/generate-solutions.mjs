#!/usr/bin/env node
/**
 * Generates all DSA solution files, full problem.md, and mySolution.js stubs.
 * Run: node DSA/scripts/generate-solutions.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { problemSpecs } from './problem-specs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'solutions');

function depthToUtils(dir) {
  const levels = dir.split('/').length + 1;
  return '../'.repeat(levels) + 'utils/data-structures.js';
}

function renderProblemMd(p) {
  const spec = problemSpecs[p.dir] ?? {};
  const examples = (spec.examples ?? []).map((ex, i) => {
    let block = `### Example ${i + 1}:\n\n\`\`\`\nInput: ${ex.input}\nOutput: ${ex.output}\n\`\`\``;
    if (ex.explanation) block += `\n\n**Explanation:** ${ex.explanation}`;
    return block;
  }).join('\n\n');

  const constraints = (spec.constraints ?? ['See LeetCode for constraints.'])
    .map(c => `- ${c}`).join('\n');

  return `# ${p.name}

| | |
|---|---|
| **Day** | ${p.day} |
| **LeetCode** | [#${p.lc}](${spec.lcUrl ?? `https://leetcode.com/problems/`}) |
| **Difficulty** | ${spec.difficulty ?? '—'} |
| **Pattern** | ${p.pattern} |
| **Solve in** | \`mySolution.js\` |
| **Reference** | \`solution.js\` (after you try) |

---

## Description

${spec.description ?? '_No description available._'}

---

## Examples

${examples || '_See LeetCode._'}

---

## Constraints

${constraints}

${spec.followUp ? `---\n\n## Follow-up\n\n${spec.followUp}\n` : ''}
---

## Function Signature

\`\`\`javascript
${spec.signature ?? '// See solution.js'}
\`\`\`

---

## Pattern Recognition (Interview Prep)

| | |
|---|---|
| **Signal** | ${spec.signal ?? p.md?.split('\n')[0]?.replace('**Signal:** ', '') ?? 'See patterns/README.md'} |
| **Invariant** | ${spec.invariant ?? '—'} |
| **Brute force** | ${spec.bruteForce ?? '—'} |
| **Optimized** | ${spec.optimized ?? '—'} |

---

## Before You Code (90 sec)

1. Restate the problem in your own words.
2. What pattern is this?
3. What's the invariant?
4. Brute force complexity?
5. Optimized complexity?
6. Ask: edge cases? empty input? duplicates?

---

## How to Practice

\`\`\`bash
# 1. Solve in mySolution.js (do NOT peek at solution.js)
# 2. Run your solution:
node mySolution.js

# 3. Compare with reference:
node solution.js
\`\`\`

---

## After Solving

- [ ] Can explain invariant in one sentence
- [ ] Can solve a variant without hints
- [ ] Timed re-solve in < 25 min (medium) / < 15 min (easy)
- [ ] Dry-run one example on paper

---

## Related

- Pattern guide: [\`patterns/README.md\`](../../../patterns/README.md)
- Interview playbook: [\`playbook/interview-playbook.md\`](../../../playbook/interview-playbook.md)
`;
}

function extractTests(code) {
  const lines = code.split('\n');
  const marker = lines.findIndex(l => /^\/\/\s*Tests/.test(l.trim()));
  if (marker !== -1) {
    return lines.slice(marker + 1).join('\n');
  }
  const testStart = lines.findIndex(l =>
    /^\s*assertEqual/.test(l) ||
    /^\s*assert\(/.test(l) ||
    /^\s*const \w+ = new \w+/.test(l) ||
    /^\s*console\.log\('✅/.test(l)
  );
  if (testStart === -1) return '';
  return lines.slice(testStart).join('\n');
}

function extractImports(code) {
  const imports = [];
  for (const line of code.split('\n')) {
    if (line.startsWith('import ')) imports.push(line);
    else if (line.trim() && !line.startsWith('/**') && !line.startsWith(' *') && !line.startsWith('//')) break;
  }
  return imports.join('\n');
}

function generateMySolution(p) {
  const utilsPath = depthToUtils(p.dir);
  const spec = problemSpecs[p.dir] ?? {};
  const imports = extractImports(p.code);
  const tests = extractTests(p.code);

  if (spec.isClass) {
    const name = spec.exportName;
    return `/**
 * Day ${p.day} | LC ${p.lc} | ${p.name}
 * YOUR SOLUTION — implement below, then run: node mySolution.js
 * Do NOT peek at solution.js until you've attempted it.
 */
${imports || `import { assertEqual } from '${utilsPath}';`}

export class ${name} {
  // TODO: implement
}

${tests}
`;
  }

  const fnMatch = p.code.match(/export function (\w+)/);
  const fnName = fnMatch?.[1] ?? 'solve';

  let fnBlock;
  if (spec.signature) {
    fnBlock = spec.signature
      .replace(/^function /m, 'export function ')
      .trim();
    if (!fnBlock.endsWith('}')) {
      fnBlock += ' {\n  // TODO: implement\n}';
    }
  } else {
    fnBlock = `export function ${fnName}(/* TODO: add params */) {\n  // TODO: implement\n}`;
  }

  return `/**
 * Day ${p.day} | LC ${p.lc} | ${p.name}
 * YOUR SOLUTION — implement below, then run: node mySolution.js
 * Do NOT peek at solution.js until you've attempted it.
 */
${imports || `import { assertEqual } from '${utilsPath}';`}

${fnBlock}

// ─── Tests (do not modify) ───────────────────────────────────
${tests}
`;
}

function writeMySolution(dir, p) {
  const path = join(dir, 'mySolution.js');
  writeFileSync(path, generateMySolution(p));
}

const problems = [
  // Week 1
  { dir: '01-hash-map/day-01-two-sum', day: 1, lc: 1, pattern: 'Hash Map', name: 'Two Sum',
    md: '**Signal:** find two indices that sum to target.\n**Invariant:** map stores value→index of seen elements.',
    code: `/**
 * Day 1 | LC 1 | Two Sum | Pattern: Hash Map
 * Invariant: seen map holds value → index for O(1) complement lookup
 */
import { assertEqual } from '../../../utils/data-structures.js';

export function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

// Tests
assertEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
assertEqual(twoSum([3, 2, 4], 6), [1, 2]);
assertEqual(twoSum([3, 3], 6), [0, 1]);
console.log('✅ Day 1: Two Sum passed');` },

  { dir: '01-hash-map/day-02-contains-duplicate', day: 2, lc: 217, pattern: 'Hash Set', name: 'Contains Duplicate',
    md: '**Signal:** any duplicate?\n**Invariant:** set tracks seen values.',
    code: `/** Day 2 | LC 217 | Contains Duplicate | Pattern: Hash Set */
import { assertEqual } from '../../../utils/data-structures.js';

export function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}

assertEqual(containsDuplicate([1, 2, 3, 1]), true);
assertEqual(containsDuplicate([1, 2, 3, 4]), false);
console.log('✅ Day 2: Contains Duplicate passed');` },

  { dir: '01-hash-map/day-03-valid-anagram', day: 3, lc: 242, pattern: 'Frequency Map', name: 'Valid Anagram',
    md: '**Signal:** same letters, different order.\n**Invariant:** char counts must match.',
    code: `/** Day 3 | LC 242 | Valid Anagram | Pattern: Frequency Map */
import { assertEqual } from '../../../utils/data-structures.js';

export function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    if (!count.has(ch)) return false;
    const next = count.get(ch) - 1;
    if (next < 0) return false;
    count.set(ch, next);
  }
  return true;
}

assertEqual(isAnagram('anagram', 'nagaram'), true);
assertEqual(isAnagram('rat', 'car'), false);
console.log('✅ Day 3: Valid Anagram passed');` },

  { dir: '01-hash-map/day-04-group-anagrams', day: 4, lc: 49, pattern: 'Hash + Sort Key', name: 'Group Anagrams',
    md: '**Signal:** group strings that are anagrams.\n**Invariant:** sorted chars = canonical key.',
    code: `/** Day 4 | LC 49 | Group Anagrams | Pattern: Hash Map */
import { assertEqual } from '../../../utils/data-structures.js';

export function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()].map(g => g.sort()).sort((a, b) => a[0].localeCompare(b[0]));
}

const r = groupAnagrams(['eat','tea','tan','ate','nat','bat']);
assertEqual(r, [['ate','eat','tea'],['bat'],['nat','tan']]);
console.log('✅ Day 4: Group Anagrams passed');` },

  { dir: '01-hash-map/day-05-subarray-sum-k', day: 5, lc: 560, pattern: 'Prefix Sum + Map', name: 'Subarray Sum Equals K',
    md: '**Signal:** count subarrays summing to k.\n**Invariant:** prefix[j]-prefix[i]=k means subarray (i,j] sums to k.',
    code: `/** Day 5 | LC 560 | Subarray Sum Equals K | Pattern: Prefix Sum + Hash Map */
import { assertEqual } from '../../../utils/data-structures.js';

export function subarraySum(nums, k) {
  let sum = 0, count = 0;
  const freq = new Map([[0, 1]]);
  for (const n of nums) {
    sum += n;
    count += freq.get(sum - k) ?? 0;
    freq.set(sum, (freq.get(sum) ?? 0) + 1);
  }
  return count;
}

assertEqual(subarraySum([1, 1, 1], 2), 2);
assertEqual(subarraySum([1, 2, 3], 3), 2);
console.log('✅ Day 5: Subarray Sum Equals K passed');` },

  { dir: '02-two-pointers/day-06-valid-palindrome', day: 6, lc: 125, pattern: 'Two Pointers', name: 'Valid Palindrome',
    md: '**Signal:** reads same forwards/backwards (alphanumeric only).\n**Invariant:** skip non-alnum, compare from both ends.',
    code: `/** Day 6 | LC 125 | Valid Palindrome | Pattern: Two Pointers */
import { assertEqual } from '../../../utils/data-structures.js';

export function isPalindrome(s) {
  const isAlnum = c => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}

assertEqual(isPalindrome('A man, a plan, a canal: Panama'), true);
assertEqual(isPalindrome('race a car'), false);
console.log('✅ Day 6: Valid Palindrome passed');` },

  { dir: '02-two-pointers/day-08-two-sum-ii', day: 8, lc: 167, pattern: 'Opposite Pointers', name: 'Two Sum II',
    md: '**Signal:** sorted array, find pair with sum.\n**Invariant:** if sum too small, move left++; too big, move right--.',
    code: `/** Day 8 | LC 167 | Two Sum II | Pattern: Two Pointers */
import { assertEqual } from '../../../utils/data-structures.js';

export function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum === target) return [l + 1, r + 1];
    if (sum < target) l++;
    else r--;
  }
  return [];
}

assertEqual(twoSum([2, 7, 11, 15], 9), [1, 2]);
console.log('✅ Day 8: Two Sum II passed');` },

  { dir: '02-two-pointers/day-09-3sum', day: 9, lc: 15, pattern: 'Sort + Two Pointers', name: '3Sum',
    md: '**Signal:** triplets summing to zero.\n**Invariant:** fix i, two-pointer on sorted remainder; skip duplicates.',
    code: `/** Day 9 | LC 15 | 3Sum | Pattern: Sort + Two Pointers */
import { assertEqual } from '../../../utils/data-structures.js';

export function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        result.push([nums[i], nums[l], nums[r]]);
        l++; r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
        while (l < r && nums[r] === nums[r + 1]) r--;
      } else if (sum < 0) l++;
      else r--;
    }
  }
  return result;
}

assertEqual(threeSum([-1, 0, 1, 2, -1, -4]), [[-1,-1,2],[-1,0,1]]);
console.log('✅ Day 9: 3Sum passed');` },

  { dir: '02-two-pointers/day-10-move-zeroes', day: 10, lc: 283, pattern: 'Slow/Fast', name: 'Move Zeroes',
    md: '**Signal:** move all zeros to end in-place.\n**Invariant:** write pointer marks next non-zero slot.',
    code: `/** Day 10 | LC 283 | Move Zeroes | Pattern: Two Pointers */
import { assertEqual } from '../../../utils/data-structures.js';

export function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}

assertEqual(moveZeroes([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
console.log('✅ Day 10: Move Zeroes passed');` },

  { dir: '03-sliding-window/day-11-longest-substring', day: 11, lc: 3, pattern: 'Sliding Window', name: 'Longest Substring Without Repeating',
    md: '**Signal:** longest substring with all unique chars.\n**Invariant:** shrink left while duplicate exists.',
    code: `/** Day 11 | LC 3 | Longest Substring Without Repeating | Pattern: Sliding Window */
import { assertEqual } from '../../../utils/data-structures.js';

export function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    if (last.has(s[right]) && last.get(s[right]) >= left) {
      left = last.get(s[right]) + 1;
    }
    last.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

assertEqual(lengthOfLongestSubstring('abcabcbb'), 3);
assertEqual(lengthOfLongestSubstring('bbbbb'), 1);
console.log('✅ Day 11: Longest Substring passed');` },

  { dir: '03-sliding-window/day-12-permutation-string', day: 12, lc: 567, pattern: 'Fixed Window', name: 'Permutation in String',
    md: '**Signal:** s2 contains permutation of s1?\n**Invariant:** fixed window size |s1|, compare char counts.',
    code: `/** Day 12 | LC 567 | Permutation in String | Pattern: Sliding Window */
import { assertEqual } from '../../../utils/data-structures.js';

function buildCount(s) {
  const m = new Map();
  for (const c of s) m.set(c, (m.get(c) ?? 0) + 1);
  return m;
}

function mapsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

export function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = buildCount(s1);
  const window = new Map();
  for (let i = 0; i < s2.length; i++) {
    window.set(s2[i], (window.get(s2[i]) ?? 0) + 1);
    if (i >= s1.length) {
      const left = s2[i - s1.length];
      window.set(left, window.get(left) - 1);
      if (window.get(left) === 0) window.delete(left);
    }
    if (i >= s1.length - 1 && mapsEqual(window, need)) return true;
  }
  return false;
}

assertEqual(checkInclusion('ab', 'eidbaooo'), true);
assertEqual(checkInclusion('ab', 'eidboaoo'), false);
console.log('✅ Day 12: Permutation in String passed');` },

  { dir: '03-sliding-window/day-13-max-ones-iii', day: 13, lc: 1004, pattern: 'Variable Window', name: 'Max Consecutive Ones III',
    md: '**Signal:** longest subarray with at most k zeros flipped.\n**Invariant:** window valid when zero count ≤ k.',
    code: `/** Day 13 | LC 1004 | Max Consecutive Ones III | Pattern: Sliding Window */
import { assertEqual } from '../../../utils/data-structures.js';

export function longestOnes(nums, k) {
  let left = 0, zeros = 0, best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

assertEqual(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2), 6);
console.log('✅ Day 13: Max Consecutive Ones III passed');` },
];

// Append remaining problems in a second batch via continuation
const moreProblems = [
  { dir: '04-stack/day-15-valid-parentheses', day: 15, lc: 20, pattern: 'Stack', name: 'Valid Parentheses',
    code: `/** Day 15 | LC 20 | Valid Parentheses | Pattern: Stack */
import { assertEqual } from '../../../utils/data-structures.js';

const PAIRS = { ')': '(', ']': '[', '}': '{' };

export function isValid(s) {
  const stack = [];
  for (const ch of s) {
    if (ch in PAIRS) {
      if (stack.pop() !== PAIRS[ch]) return false;
    } else stack.push(ch);
  }
  return stack.length === 0;
}

assertEqual(isValid('()[]{}'), true);
assertEqual(isValid('(]'), false);
console.log('✅ Day 15: Valid Parentheses passed');` },

  { dir: '04-stack/day-16-min-stack', day: 16, lc: 155, pattern: 'Stack + Aux', name: 'Min Stack',
    code: `/** Day 16 | LC 155 | Min Stack | Pattern: Stack */
import { assertEqual } from '../../../utils/data-structures.js';

export class MinStack {
  constructor() {
    this.stack = [];
    this.mins = [];
  }
  push(val) {
    this.stack.push(val);
    const min = this.mins.length ? Math.min(this.mins.at(-1), val) : val;
    this.mins.push(min);
  }
  pop() { this.stack.pop(); this.mins.pop(); }
  top() { return this.stack.at(-1); }
  getMin() { return this.mins.at(-1); }
}

const ms = new MinStack();
ms.push(-2); ms.push(0); ms.push(-3);
assertEqual(ms.getMin(), -3);
ms.pop();
assertEqual(ms.top(), 0);
assertEqual(ms.getMin(), -2);
console.log('✅ Day 16: Min Stack passed');` },

  { dir: '04-stack/day-17-daily-temperatures', day: 17, lc: 739, pattern: 'Monotonic Stack', name: 'Daily Temperatures',
    code: `/** Day 17 | LC 739 | Daily Temperatures | Pattern: Monotonic Stack */
import { assertEqual } from '../../../utils/data-structures.js';

export function dailyTemperatures(temps) {
  const result = Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack.at(-1)]) {
      const idx = stack.pop();
      result[idx] = i - idx;
    }
    stack.push(i);
  }
  return result;
}

assertEqual(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]), [1, 1, 4, 2, 1, 1, 0, 0]);
console.log('✅ Day 17: Daily Temperatures passed');` },

  { dir: '05-binary-search/day-18-binary-search', day: 18, lc: 704, pattern: 'Binary Search', name: 'Binary Search',
    code: `/** Day 18 | LC 704 | Binary Search | Pattern: Binary Search */
import { assertEqual } from '../../../utils/data-structures.js';

export function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

assertEqual(search([-1, 0, 3, 5, 9, 12], 9), 4);
assertEqual(search([-1, 0, 3, 5, 9, 12], 2), -1);
console.log('✅ Day 18: Binary Search passed');` },

  { dir: '05-binary-search/day-19-search-insert', day: 19, lc: 35, pattern: 'Lower Bound', name: 'Search Insert Position',
    code: `/** Day 19 | LC 35 | Search Insert Position | Pattern: Binary Search */
import { assertEqual } from '../../../utils/data-structures.js';

export function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

assertEqual(searchInsert([1, 3, 5, 6], 5), 2);
assertEqual(searchInsert([1, 3, 5, 6], 2), 1);
console.log('✅ Day 19: Search Insert passed');` },

  { dir: '05-binary-search/day-20-min-rotated', day: 20, lc: 153, pattern: 'BS on Rotated', name: 'Find Minimum in Rotated Sorted Array',
    code: `/** Day 20 | LC 153 | Find Min in Rotated Array | Pattern: Binary Search */
import { assertEqual } from '../../../utils/data-structures.js';

export function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}

assertEqual(findMin([3, 4, 5, 1, 2]), 1);
assertEqual(findMin([11, 13, 15, 17]), 11);
console.log('✅ Day 20: Find Min Rotated passed');` },

  { dir: '06-linked-list/day-22-reverse-list', day: 22, lc: 206, pattern: 'Pointer Reversal', name: 'Reverse Linked List',
    code: `/** Day 22 | LC 206 | Reverse Linked List | Pattern: Linked List */
import { listFromArray, listToArray, assertEqual } from '../../../utils/data-structures.js';

export function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

assertEqual(listToArray(reverseList(listFromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);
console.log('✅ Day 22: Reverse List passed');` },

  { dir: '06-linked-list/day-23-merge-lists', day: 23, lc: 21, pattern: 'List Merge', name: 'Merge Two Sorted Lists',
    code: `/** Day 23 | LC 21 | Merge Two Sorted Lists | Pattern: Linked List */
import { ListNode, listFromArray, listToArray, assertEqual } from '../../../utils/data-structures.js';

export function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let cur = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
    else { cur.next = l2; l2 = l2.next; }
    cur = cur.next;
  }
  cur.next = l1 ?? l2;
  return dummy.next;
}

assertEqual(listToArray(mergeTwoLists(listFromArray([1,2,4]), listFromArray([1,3,4]))), [1,1,2,3,4,4]);
console.log('✅ Day 23: Merge Lists passed');` },

  { dir: '06-linked-list/day-24-linked-list-cycle', day: 24, lc: 141, pattern: 'Fast/Slow', name: 'Linked List Cycle',
    code: `/** Day 24 | LC 141 | Linked List Cycle | Pattern: Fast/Slow Pointers */
import { ListNode, assertEqual } from '../../../utils/data-structures.js';

export function hasCycle(head) {
  let slow = head, fast = head;
  while (fast?.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

const n1 = new ListNode(3);
const n2 = new ListNode(2);
const n3 = new ListNode(0);
const n4 = new ListNode(-4);
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2;
assertEqual(hasCycle(n1), true);
assertEqual(hasCycle(new ListNode(1)), false);
console.log('✅ Day 24: Linked List Cycle passed');` },

  { dir: '07-tree/day-25-max-depth', day: 25, lc: 104, pattern: 'Tree DFS', name: 'Maximum Depth of Binary Tree',
    code: `/** Day 25 | LC 104 | Max Depth | Pattern: Tree DFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

assertEqual(maxDepth(treeFromArray([3, 9, 20, null, null, 15, 7])), 3);
console.log('✅ Day 25: Max Depth passed');` },

  { dir: '07-tree/day-26-invert-tree', day: 26, lc: 226, pattern: 'Tree DFS', name: 'Invert Binary Tree',
    code: `/** Day 26 | LC 226 | Invert Binary Tree | Pattern: Tree DFS */
import { treeFromArray, TreeNode, assertEqual } from '../../../utils/data-structures.js';

function treeToArray(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) { result.push(null); continue; }
    result.push(node.val);
    queue.push(node.left ?? null);
    queue.push(node.right ?? null);
    while (queue.length && !queue.at(-1) && !queue.at(-2)) queue.pop(), queue.pop();
  }
  while (result.at(-1) == null) result.pop();
  return result;
}

export function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}

assertEqual(treeToArray(invertTree(treeFromArray([4,2,7,1,3,6,9]))), [4,7,2,9,6,3,1]);
console.log('✅ Day 26: Invert Tree passed');` },

  { dir: '07-tree/day-27-same-tree', day: 27, lc: 100, pattern: 'Tree DFS', name: 'Same Tree',
    code: `/** Day 27 | LC 100 | Same Tree | Pattern: Tree DFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

assertEqual(isSameTree(treeFromArray([1,2,3]), treeFromArray([1,2,3])), true);
assertEqual(isSameTree(treeFromArray([1,2]), treeFromArray([1,null,2])), false);
console.log('✅ Day 27: Same Tree passed');` },

  { dir: '07-tree/day-29-level-order', day: 29, lc: 102, pattern: 'BFS', name: 'Binary Tree Level Order Traversal',
    code: `/** Day 29 | LC 102 | Level Order | Pattern: Tree BFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

assertEqual(levelOrder(treeFromArray([3,9,20,null,null,15,7])), [[3],[9,20],[15,7]]);
console.log('✅ Day 29: Level Order passed');` },

  { dir: '07-tree/day-30-lca', day: 30, lc: 236, pattern: 'Tree DFS', name: 'Lowest Common Ancestor',
    code: `/** Day 30 | LC 236 | LCA | Pattern: Tree DFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left ?? right;
}

const root = treeFromArray([3,5,1,6,2,0,8,null,null,7,4]);
const p = root.left, q = root.right;
assertEqual(lowestCommonAncestor(root, p, q).val, 3);
console.log('✅ Day 30: LCA passed');` },

  { dir: '07-tree/day-31-diameter', day: 31, lc: 543, pattern: 'DFS + Global', name: 'Diameter of Binary Tree',
    code: `/** Day 31 | LC 543 | Diameter | Pattern: Tree DFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function diameterOfBinaryTree(root) {
  let best = 0;
  function depth(node) {
    if (!node) return 0;
    const l = depth(node.left), r = depth(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  }
  depth(root);
  return best;
}

assertEqual(diameterOfBinaryTree(treeFromArray([1,2,3,4,5])), 3);
console.log('✅ Day 31: Diameter passed');` },

  { dir: '07-tree/day-32-serialize-tree', day: 32, lc: 297, pattern: 'BFS/DFS Design', name: 'Serialize and Deserialize Binary Tree',
    code: `/** Day 32 | LC 297 | Serialize/Deserialize | Pattern: Tree Design */
import { TreeNode, assertEqual } from '../../../utils/data-structures.js';

export function serialize(root) {
  const parts = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) { parts.push('null'); continue; }
    parts.push(String(node.val));
    queue.push(node.left);
    queue.push(node.right);
  }
  while (parts.at(-1) === 'null') parts.pop();
  return parts.join(',');
}

export function deserialize(data) {
  if (!data) return null;
  const vals = data.split(',');
  const root = new TreeNode(Number(vals[0]));
  const queue = [root];
  let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (vals[i] !== 'null') { node.left = new TreeNode(Number(vals[i])); queue.push(node.left); }
    i++;
    if (i < vals.length && vals[i] !== 'null') { node.right = new TreeNode(Number(vals[i])); queue.push(node.right); }
    i++;
  }
  return root;
}

const tree = new TreeNode(1, new TreeNode(2), new TreeNode(3, new TreeNode(4), new TreeNode(5)));
assertEqual(serialize(deserialize(serialize(tree))), serialize(tree));
console.log('✅ Day 32: Serialize Tree passed');` },

  { dir: '07-tree/day-33-flatten-tree', day: 33, lc: 114, pattern: 'Tree DFS', name: 'Flatten Binary Tree to Linked List',
    code: `/** Day 33 | LC 114 | Flatten Tree | Pattern: Tree DFS (reverse preorder) */
import { TreeNode, assertEqual } from '../../../utils/data-structures.js';

export function flatten(root) {
  let prev = null;
  function dfs(node) {
    if (!node) return;
    dfs(node.right);
    dfs(node.left);
    node.right = prev;
    node.left = null;
    prev = node;
  }
  dfs(root);
  return root;
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(3), new TreeNode(4)), new TreeNode(5, null, new TreeNode(6)));
flatten(root);
const vals = [];
let cur = root;
while (cur) { vals.push(cur.val); cur = cur.right; }
assertEqual(vals, [1,2,3,4,5,6]);
console.log('✅ Day 33: Flatten Tree passed');` },

  { dir: '07-tree/day-34-path-sum', day: 34, lc: 112, pattern: 'DFS Path', name: 'Path Sum',
    code: `/** Day 34 | LC 112 | Path Sum | Pattern: Tree DFS */
import { treeFromArray, assertEqual } from '../../../utils/data-structures.js';

export function hasPathSum(root, targetSum) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === targetSum;
  const remain = targetSum - root.val;
  return hasPathSum(root.left, remain) || hasPathSum(root.right, remain);
}

assertEqual(hasPathSum(treeFromArray([5,4,8,11,null,13,4,7,2,null,null,null,1]), 22), true);
console.log('✅ Day 34: Path Sum passed');` },

  { dir: '08-graph/day-36-number-of-islands', day: 36, lc: 200, pattern: 'Grid DFS', name: 'Number of Islands',
    code: `/** Day 36 | LC 200 | Number of Islands | Pattern: Graph DFS */
import { assertEqual } from '../../../utils/data-structures.js';

export function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0';
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { count++; dfs(r, c); }
  return count;
}

assertEqual(numIslands([['1','1','0'],['1','0','0'],['0','0','1']]), 2);
console.log('✅ Day 36: Number of Islands passed');` },

  { dir: '08-graph/day-37-course-schedule', day: 37, lc: 207, pattern: 'Topo Sort', name: 'Course Schedule',
    code: `/** Day 37 | LC 207 | Course Schedule | Pattern: Topological Sort */
import { assertEqual } from '../../../utils/data-structures.js';

export function canFinish(numCourses, prerequisites) {
  const indegree = Array(numCourses).fill(0);
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    indegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
  let visited = 0;
  while (queue.length) {
    const node = queue.shift();
    visited++;
    for (const next of graph[node]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return visited === numCourses;
}

assertEqual(canFinish(2, [[1,0]]), true);
assertEqual(canFinish(2, [[1,0],[0,1]]), false);
console.log('✅ Day 37: Course Schedule passed');` },

  { dir: '08-graph/day-38-clone-graph', day: 38, lc: 133, pattern: 'Graph DFS', name: 'Clone Graph',
    code: `/** Day 38 | LC 133 | Clone Graph | Pattern: Graph DFS + Map */
import { assertEqual } from '../../../utils/data-structures.js';

export function cloneGraph(node) {
  if (!node) return null;
  const map = new Map();
  function dfs(n) {
    if (map.has(n)) return map.get(n);
    const copy = { val: n.val, neighbors: [] };
    map.set(n, copy);
    for (const nb of n.neighbors) copy.neighbors.push(dfs(nb));
    return copy;
  }
  return dfs(node);
}

const n1 = { val: 1, neighbors: [] };
const n2 = { val: 2, neighbors: [] };
n1.neighbors.push(n2); n2.neighbors.push(n1);
const cloned = cloneGraph(n1);
assertEqual(cloned.val, 1);
assertEqual(cloned.neighbors[0].val, 2);
assertEqual(cloned.neighbors[0] !== n2, true);
console.log('✅ Day 38: Clone Graph passed');` },

  { dir: '09-intervals/day-39-merge-intervals', day: 39, lc: 56, pattern: 'Sort + Merge', name: 'Merge Intervals',
    code: `/** Day 39 | LC 56 | Merge Intervals | Pattern: Intervals */
import { assertEqual } from '../../../utils/data-structures.js';

export function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = result.at(-1);
    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);
    else result.push(intervals[i]);
  }
  return result;
}

assertEqual(merge([[1,3],[2,6],[8,10],[15,18]]), [[1,6],[8,10],[15,18]]);
console.log('✅ Day 39: Merge Intervals passed');` },

  { dir: '09-intervals/day-40-insert-interval', day: 40, lc: 57, pattern: 'Interval Insert', name: 'Insert Interval',
    code: `/** Day 40 | LC 57 | Insert Interval | Pattern: Intervals */
import { assertEqual } from '../../../utils/data-structures.js';

export function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  while (i < intervals.length && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  result.push(newInterval);
  while (i < intervals.length) result.push(intervals[i++]);
  return result;
}

assertEqual(insert([[1,3],[6,9]], [2,5]), [[1,5],[6,9]]);
console.log('✅ Day 40: Insert Interval passed');` },

  { dir: '09-intervals/day-41-meeting-rooms-ii', day: 41, lc: 253, pattern: 'Sweep Line', name: 'Meeting Rooms II',
    code: `/** Day 41 | LC 253 | Meeting Rooms II | Pattern: Min Heap */
import { MinHeap, assertEqual } from '../../../utils/data-structures.js';

export function minMeetingRooms(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const heap = new MinHeap();
  for (const [start, end] of intervals) {
    if (heap.size && heap.peek() <= start) heap.pop();
    heap.push(end);
  }
  return heap.size;
}

assertEqual(minMeetingRooms([[0,30],[5,10],[15,20]]), 2);
assertEqual(minMeetingRooms([[7,10],[2,4]]), 1);
console.log('✅ Day 41: Meeting Rooms II passed');` },

  { dir: '10-dp/day-43-climbing-stairs', day: 43, lc: 70, pattern: '1D DP', name: 'Climbing Stairs',
    code: `/** Day 43 | LC 70 | Climbing Stairs | Pattern: 1D DP */
import { assertEqual } from '../../../utils/data-structures.js';

export function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

assertEqual(climbStairs(3), 3);
assertEqual(climbStairs(5), 8);
console.log('✅ Day 43: Climbing Stairs passed');` },

  { dir: '10-dp/day-44-house-robber', day: 44, lc: 198, pattern: '1D DP', name: 'House Robber',
    code: `/** Day 44 | LC 198 | House Robber | Pattern: 1D DP */
import { assertEqual } from '../../../utils/data-structures.js';

export function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}

assertEqual(rob([1,2,3,1]), 4);
assertEqual(rob([2,7,9,3,1]), 12);
console.log('✅ Day 44: House Robber passed');` },

  { dir: '10-dp/day-45-coin-change', day: 45, lc: 322, pattern: 'Unbounded DP', name: 'Coin Change',
    code: `/** Day 45 | LC 322 | Coin Change | Pattern: 1D DP */
import { assertEqual } from '../../../utils/data-structures.js';

export function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

assertEqual(coinChange([1,2,5], 11), 3);
assertEqual(coinChange([2], 3), -1);
console.log('✅ Day 45: Coin Change passed');` },

  { dir: '10-dp/day-46-lis', day: 46, lc: 300, pattern: 'DP / Patience', name: 'Longest Increasing Subsequence',
    code: `/** Day 46 | LC 300 | LIS | Pattern: Patience Sorting */
import { assertEqual } from '../../../utils/data-structures.js';

export function lengthOfLIS(nums) {
  const piles = [];
  for (const n of nums) {
    let lo = 0, hi = piles.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (piles[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    piles[lo] = n;
  }
  return piles.length;
}

assertEqual(lengthOfLIS([10,9,2,5,3,7,101,18]), 4);
console.log('✅ Day 46: LIS passed');` },

  { dir: '01-hash-map/day-47-top-k-frequent', day: 47, lc: 347, pattern: 'Bucket Sort', name: 'Top K Frequent Elements',
    code: `/** Day 47 | LC 347 | Top K Frequent | Pattern: Bucket Sort */
import { assertEqual } from '../../../utils/data-structures.js';

export function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  const buckets = Array(nums.length + 1).fill(null).map(() => []);
  for (const [num, count] of freq) buckets[count].push(num);
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    for (const n of buckets[i]) {
      result.push(n);
      if (result.length === k) break;
    }
  }
  return result.sort((a, b) => a - b);
}

assertEqual(topKFrequent([1,1,1,2,2,3], 2).sort(), [1,2]);
console.log('✅ Day 47: Top K Frequent passed');` },

  { dir: '01-hash-map/day-48-longest-consecutive', day: 48, lc: 128, pattern: 'Hash Set', name: 'Longest Consecutive Sequence',
    code: `/** Day 48 | LC 128 | Longest Consecutive | Pattern: Hash Set */
import { assertEqual } from '../../../utils/data-structures.js';

export function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const n of set) {
    if (set.has(n - 1)) continue;
    let len = 1;
    while (set.has(n + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}

assertEqual(longestConsecutive([100,4,200,1,3,2]), 4);
console.log('✅ Day 48: Longest Consecutive passed');` },

  { dir: '11-design/day-50-lru-cache', day: 50, lc: 146, pattern: 'Design', name: 'LRU Cache',
    code: `/** Day 50 | LC 146 | LRU Cache | Pattern: Map + Doubly Linked List */
import { assertEqual } from '../../../utils/data-structures.js';

export class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}

const lru = new LRUCache(2);
lru.put(1, 1); lru.put(2, 2);
assertEqual(lru.get(1), 1);
lru.put(3, 3);
assertEqual(lru.get(2), -1);
console.log('✅ Day 50: LRU Cache passed');` },

  { dir: '11-design/day-51-flatten-array', day: 51, lc: 2625, pattern: 'Recursion', name: 'Flatten Nested Array',
    code: `/** Day 51 | LC 2625 | Flatten Nested Array | Pattern: Recursion */
import { assertEqual } from '../../../utils/data-structures.js';

export function flat(arr, depth = 1) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) result.push(...flat(item, depth - 1));
    else result.push(item);
  }
  return result;
}

assertEqual(flat([1,[2,[3,[4]]]], 2), [1,2,3,[4]]);
assertEqual(flat([1,2,3]), [1,2,3]);
console.log('✅ Day 51: Flatten Array passed');` },

  { dir: '11-design/day-52-trie', day: 52, lc: 208, pattern: 'Trie', name: 'Implement Trie',
    code: `/** Day 52 | LC 208 | Trie | Pattern: Design */
import { assertEqual } from '../../../utils/data-structures.js';

export class Trie {
  constructor() {
    this.root = { children: new Map(), end: false };
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true;
  }
  search(word) {
    const node = this.#walk(word);
    return node?.end ?? false;
  }
  startsWith(prefix) {
    return this.#walk(prefix) != null;
  }
  #walk(s) {
    let node = this.root;
    for (const ch of s) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }
}

const trie = new Trie();
trie.insert('apple');
assertEqual(trie.search('apple'), true);
assertEqual(trie.search('app'), false);
assertEqual(trie.startsWith('app'), true);
console.log('✅ Day 52: Trie passed');` },

  { dir: '02-two-pointers/day-53-container-water', day: 53, lc: 11, pattern: 'Two Pointers', name: 'Container With Most Water',
    code: `/** Day 53 | LC 11 | Container With Most Water | Pattern: Two Pointers */
import { assertEqual } from '../../../utils/data-structures.js';

export function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}

assertEqual(maxArea([1,8,6,2,5,4,8,3,7]), 49);
console.log('✅ Day 53: Container With Most Water passed');` },

  { dir: '03-sliding-window/day-54-min-window', day: 54, lc: 76, pattern: 'Sliding Window', name: 'Minimum Window Substring',
    code: `/** Day 54 | LC 76 | Minimum Window Substring | Pattern: Sliding Window */
import { assertEqual } from '../../../utils/data-structures.js';

export function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let left = 0, formed = 0, required = need.size;
  let bestLen = Infinity, bestStart = 0;
  const window = new Map();
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) ?? 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) formed++;
    while (formed === required) {
      if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
      const leftC = s[left];
      window.set(leftC, window.get(leftC) - 1);
      if (need.has(leftC) && window.get(leftC) < need.get(leftC)) formed--;
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}

assertEqual(minWindow('ADOBECODEBANC', 'ABC'), 'BANC');
console.log('✅ Day 54: Minimum Window passed');` },

  { dir: '04-stack/day-55-evaluate-rpn', day: 55, lc: 150, pattern: 'Stack', name: 'Evaluate Reverse Polish Notation',
    code: `/** Day 55 | LC 150 | Evaluate RPN | Pattern: Stack */
import { assertEqual } from '../../../utils/data-structures.js';

export function evalRPN(tokens) {
  const stack = [];
  const ops = {
    '+': (a, b) => a + b, '-': (a, b) => a - b,
    '*': (a, b) => a * b, '/': (a, b) => Math.trunc(a / b),
  };
  for (const t of tokens) {
    if (t in ops) {
      const b = stack.pop(), a = stack.pop();
      stack.push(ops[t](a, b));
    } else stack.push(Number(t));
  }
  return stack[0];
}

assertEqual(evalRPN(['2','1','+','3','*']), 9);
console.log('✅ Day 55: Evaluate RPN passed');` },

  { dir: '05-binary-search/day-56-search-rotated', day: 56, lc: 33, pattern: 'Binary Search', name: 'Search in Rotated Sorted Array',
    code: `/** Day 56 | LC 33 | Search Rotated Array | Pattern: Binary Search */
import { assertEqual } from '../../../utils/data-structures.js';

export function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

assertEqual(search([4,5,6,7,0,1,2], 0), 4);
console.log('✅ Day 56: Search Rotated passed');` },

  { dir: '06-linked-list/day-57-remove-nth', day: 57, lc: 19, pattern: 'Two Pointer List', name: 'Remove Nth Node From End of List',
    code: `/** Day 57 | LC 19 | Remove Nth From End | Pattern: Two Pointers */
import { ListNode, listFromArray, listToArray, assertEqual } from '../../../utils/data-structures.js';

export function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}

assertEqual(listToArray(removeNthFromEnd(listFromArray([1,2,3,4,5]), 2)), [1,2,3,5]);
console.log('✅ Day 57: Remove Nth From End passed');` },
];

const all = [...problems, ...moreProblems];

for (const p of all) {
  const dir = join(ROOT, p.dir);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, 'problem.md'), renderProblemMd(p));
  writeFileSync(join(dir, 'solution.js'), p.code);
  writeMySolution(dir, p);
}

console.log(`Generated ${all.length} problems (problem.md + solution.js + mySolution.js) in ${ROOT}`);
