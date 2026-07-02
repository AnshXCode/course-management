/**
 * Full LeetCode-style problem specifications for all 50 curriculum problems.
 * Keyed by directory path relative to solutions/ (e.g. '01-hash-map/day-01-two-sum')
 */

export const problemSpecs = {
  '01-hash-map/day-01-two-sum': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/two-sum/',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the **same** element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
      },
    ],
    constraints: [
      '`2 <= nums.length <= 10^4`',
      '`-10^9 <= nums[i] <= 10^9`',
      '`-10^9 <= target <= 10^9`',
      '**Only one valid answer exists.**',
    ],
    followUp: 'Can you come up with an algorithm that is less than O(n²) time complexity?',
    signature: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target)',
    signal: 'Find two indices whose values sum to a target.',
    invariant: 'Map stores `value → index` for O(1) complement lookup.',
    bruteForce: 'O(n²) — check every pair with nested loops.',
    optimized: 'O(n) time, O(n) space — one pass with a hash map.',
  },

  '01-hash-map/day-02-contains-duplicate': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/contains-duplicate/',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      {
        input: 'nums = [1,2,3,1]',
        output: 'true',
        explanation: 'The element 1 occurs at indices 0 and 3.',
      },
      {
        input: 'nums = [1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
      {
        input: 'nums = [1,1,1,3,3,4,3,2,4,2]',
        output: 'true',
        explanation: 'Several values appear more than once.',
      },
    ],
    constraints: [
      '`1 <= nums.length <= 10^5`',
      '`-10^9 <= nums[i] <= 10^9`',
    ],
    signature: '/**\n * @param {number[]} nums\n * @return {boolean}\n */\nfunction containsDuplicate(nums)',
    signal: 'Does any value appear more than once?',
    invariant: 'Set tracks values seen; duplicate found if already in set.',
    bruteForce: 'O(n²) — compare every pair.',
    optimized: 'O(n) time, O(n) space — single pass with Set.',
  },

  '01-hash-map/day-03-valid-anagram': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/valid-anagram/',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: [
      '`1 <= s.length, t.length <= 5 * 10^4`',
      '`s` and `t` consist of lowercase English letters.',
    ],
    followUp: 'What if the inputs contain Unicode characters? How would you adapt your solution?',
    signature: '/**\n * @param {string} s\n * @param {string} t\n * @return {boolean}\n */\nfunction isAnagram(s, t)',
    signal: 'Same characters, different order?',
    invariant: 'Character frequency counts must match exactly.',
    bruteForce: 'O(n log n) — sort both strings and compare.',
    optimized: 'O(n) time, O(1) space — frequency map (26 letters).',
  },

  '01-hash-map/day-04-group-anagrams': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/group-anagrams/',
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in **any order**.`,
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: 'Strings grouped by anagram equivalence.',
      },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: [
      '`1 <= strs.length <= 10^4`',
      '`0 <= strs[i].length <= 100`',
      '`strs[i]` consists of lowercase English letters.',
    ],
    signature: '/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs)',
    signal: 'Group strings that are anagrams of each other.',
    invariant: 'Sorted characters (or char count key) identify anagram groups.',
    bruteForce: 'O(n * k log k) — sort each string as key, group in map.',
    optimized: 'O(n * k log k) sort key, or O(n * k) with 26-char count key.',
  },

  '01-hash-map/day-05-subarray-sum-k': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    description: `Given an array of integers \`nums\` and an integer \`k\`, return the **total number of subarrays** whose sum equals to \`k\`.

A subarray is a contiguous **non-empty** sequence of elements within an array.`,
    examples: [
      {
        input: 'nums = [1,1,1], k = 2',
        output: '2',
        explanation: 'Subarrays [1,1] at index 0 and [1,1] at index 1.',
      },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    constraints: [
      '`1 <= nums.length <= 2 * 10^4`',
      '`-1000 <= nums[i] <= 1000`',
      '`-10^7 <= k <= 10^7`',
    ],
    signature: '/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nfunction subarraySum(nums, k)',
    signal: 'Count contiguous subarrays with sum exactly k.',
    invariant: 'If prefix[j] - prefix[i] = k, subarray (i, j] sums to k. Track prefix frequency in map.',
    bruteForce: 'O(n²) — check all subarrays.',
    optimized: 'O(n) time, O(n) space — prefix sum + hash map.',
  },

  '01-hash-map/day-47-top-k-frequent': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in **any order**.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: [
      '`1 <= nums.length <= 10^5`',
      '`-10^4 <= nums[i] <= 10^4`',
      '`k` is in the range `[1, number of unique elements]`.',
      'The answer is **guaranteed** to be unique.',
    ],
    followUp: 'Your algorithm\'s time complexity must be better than O(n log n), where n is the array size.',
    signature: '/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number[]}\n */\nfunction topKFrequent(nums, k)',
    signal: 'Find k elements with highest frequency.',
    invariant: 'Bucket sort by frequency: index = count, value = list of nums.',
    bruteForce: 'O(n log n) — sort by frequency.',
    optimized: 'O(n) time — bucket sort on frequencies.',
  },

  '01-hash-map/day-48-longest-consecutive': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    description: `Given an unsorted array of integers \`nums\`, return the length of the **longest consecutive elements sequence**.

You must write an algorithm that runs in **O(n)** time.`,
    examples: [
      {
        input: 'nums = [100,4,200,1,3,2]',
        output: '4',
        explanation: 'The longest consecutive sequence is [1, 2, 3, 4]. Length = 4.',
      },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' },
    ],
    constraints: [
      '`0 <= nums.length <= 10^5`',
      '`-10^9 <= nums[i] <= 10^9`',
    ],
    signature: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction longestConsecutive(nums)',
    signal: 'Longest run of consecutive integers (unordered input).',
    invariant: 'Only start counting from sequence start (n-1 not in set).',
    bruteForce: 'O(n log n) — sort then scan.',
    optimized: 'O(n) time, O(n) space — hash set, skip non-starts.',
  },

  '02-two-pointers/day-06-valid-palindrome': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/valid-palindrome/',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a **palindrome**, or \`false\` otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: 'true', explanation: 'After removing non-alphanumeric, s is empty which reads the same forward and backward.' },
    ],
    constraints: ['`1 <= s.length <= 2 * 10^5`', '`s` consists only of printable ASCII characters.'],
    signature: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isPalindrome(s)',
    signal: 'Compare from both ends, skip non-alphanumeric.',
    invariant: 'Two pointers move inward while chars match (case-insensitive).',
    bruteForce: 'O(n) — clean string then compare.',
    optimized: 'O(n) time, O(1) space — two pointers in-place.',
  },

  '02-two-pointers/day-08-two-sum-ii': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    description: `Given a **1-indexed** array of integers \`numbers\` that is already sorted in **non-decreasing order**, find two numbers such that they add up to a specific \`target\` number. Let these two numbers be \`numbers[index1]\` and \`numbers[index2]\` where \`1 <= index1 < index2 <= numbers.length\`.

Return the indices \`[index1, index2]\` of length 2, **1-indexed**.

The tests are generated such that there is **exactly one solution**. You **may not** use the same element twice.

Your solution must use only constant extra space.`,
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', explanation: '2 + 7 = 9.' },
      { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' },
      { input: 'numbers = [-1,0], target = -1', output: '[1,2]' },
    ],
    constraints: [
      '`2 <= numbers.length <= 3 * 10^4`',
      '`-1000 <= numbers[i] <= 1000`',
      '`-1000 <= target <= 1000`',
      'The tests are generated such that there is exactly one solution.',
    ],
    signature: '/**\n * @param {number[]} numbers\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(numbers, target)',
    signal: 'Sorted array — find pair summing to target (1-indexed answer).',
    invariant: 'If sum too small, move left++; too big, move right--.',
    bruteForce: 'O(n²) — two loops.',
    optimized: 'O(n) time, O(1) space — opposite pointers.',
  },

  '02-two-pointers/day-09-3sum': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/3sum/',
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0. Distinct triplets only.',
      },
      { input: 'nums = [0,1,1]', output: '[]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['`3 <= nums.length <= 3000`', '`-10^5 <= nums[i] <= 10^5`'],
    signature: '/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nfunction threeSum(nums)',
    signal: 'Find all unique triplets summing to zero.',
    invariant: 'Sort, fix i, two-pointer on remainder; skip duplicate values.',
    bruteForce: 'O(n³) — three nested loops with dedup.',
    optimized: 'O(n²) time, O(1) extra — sort + two pointers.',
  },

  '02-two-pointers/day-10-move-zeroes': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/move-zeroes/',
    description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the **relative order** of the non-zero elements.

**Note** that you must do this in-place without making a copy of the array.`,
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
      { input: 'nums = [0]', output: '[0]' },
    ],
    constraints: ['`1 <= nums.length <= 10^4`', '`-2^31 <= nums[i] <= 2^31 - 1`'],
    followUp: 'Could you minimize the total number of operations?',
    signature: '/**\n * @param {number[]} nums\n * @return {void} Do not return anything, modify nums in-place.\n */\nfunction moveZeroes(nums)',
    signal: 'Compact non-zeros to front, fill rest with zeros.',
    invariant: 'Write pointer marks next slot for non-zero element.',
    bruteForce: 'O(n) — extra array then copy back (not in-place optimal).',
    optimized: 'O(n) time, O(1) space — slow/fast pointers swap.',
  },

  '02-two-pointers/day-53-container-water': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/container-with-most-water/',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the **maximum** amount of water a container can store.

**Notice** that you may not slant the container.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area between index 1 (8) and 8 (7): min(8,7) * 7 = 49.' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: ['`n == height.length`', '`2 <= n <= 10^5`', '`0 <= height[i] <= 10^4`'],
    signature: '/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height)',
    signal: 'Maximize area between two lines (two pointers).',
    invariant: 'Move the shorter line inward — only way to possibly increase area.',
    bruteForce: 'O(n²) — check all pairs.',
    optimized: 'O(n) time, O(1) space — two pointers from ends.',
  },

  '03-sliding-window/day-11-longest-substring': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'Answer is "abc", length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'Answer is "b", length 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'Answer is "wke", length 3.' },
    ],
    constraints: [
      '`0 <= s.length <= 5 * 10^4`',
      '`s` consists of English letters, digits, symbols and spaces.',
    ],
    signature: '/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s)',
    signal: 'Longest contiguous substring with all unique chars.',
    invariant: 'Window [left, right] has no duplicates; shrink left when duplicate found.',
    bruteForce: 'O(n³) — all substrings, check uniqueness.',
    optimized: 'O(n) time, O(min(n,m)) space — sliding window + last-seen map.',
  },

  '03-sliding-window/day-12-permutation-string': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/permutation-in-string/',
    description: `Given two strings \`s1\` and \`s2\`, return \`true\` if \`s2\` contains a **permutation** of \`s1\`, or \`false\` otherwise.

In other words, return \`true\` if one of \`s1\`'s permutations is the substring of \`s2\`.`,
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', explanation: '"ba" is a permutation of "ab" and a substring of s2.' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false' },
    ],
    constraints: [
      '`1 <= s1.length, s2.length <= 10^4`',
      '`s1` and `s2` consist of lowercase English letters.',
    ],
    signature: '/**\n * @param {string} s1\n * @param {string} s2\n * @return {boolean}\n */\nfunction checkInclusion(s1, s2)',
    signal: 'Fixed-size window |s1| over s2; compare char counts.',
    invariant: 'Window of size len(s1) slides; valid when counts match s1.',
    bruteForce: 'O(n * m!) — generate permutations.',
    optimized: 'O(n) time — sliding window with frequency map.',
  },

  '03-sliding-window/day-13-max-ones-iii': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/max-consecutive-ones-iii/',
    description: `Given a binary array \`nums\` and an integer \`k\`, return the **maximum** number of consecutive \`1\`'s in the array if you can flip at most \`k\` \`0\`'s.`,
    examples: [
      { input: 'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2', output: '6', explanation: 'Flip 0s at index 4 and 5 → six 1s.' },
      { input: 'nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1,0], k = 3', output: '10' },
    ],
    constraints: [
      '`1 <= nums.length <= 10^5`',
      '`nums[i]` is either `0` or `1`.',
      '`0 <= k <= nums.length`',
    ],
    signature: '/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nfunction longestOnes(nums, k)',
    signal: 'Longest subarray with at most k zeros (variable window).',
    invariant: 'Window valid when zero count ≤ k; shrink when exceeded.',
    bruteForce: 'O(n²) — try all subarrays.',
    optimized: 'O(n) time, O(1) space — sliding window.',
  },

  '03-sliding-window/day-54-min-window': {
    difficulty: 'Hard',
    lcUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (**including duplicates**) is included in the window. If there is no such substring, return the empty string \`""\`.

The testcases will be generated such that the answer is **unique**.`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'Minimum window containing A, B, C.' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    constraints: [
      '`m == s.length, n == t.length`',
      '`1 <= m, n <= 10^5`',
      '`s` and `t` consist of uppercase and lowercase English letters.',
    ],
    followUp: 'Could you find an O(m + n) solution?',
    signature: '/**\n * @param {string} s\n * @param {string} t\n * @return {string}\n */\nfunction minWindow(s, t)',
    signal: 'Smallest substring of s containing all chars of t.',
    invariant: 'Expand right until valid; shrink left while still valid; track min.',
    bruteForce: 'O(n²) — all substrings, check contains t.',
    optimized: 'O(m + n) — sliding window with formed-char counter.',
  },

  '04-stack/day-15-valid-parentheses': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/valid-parentheses/',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([])"', output: 'true' },
    ],
    constraints: ['`1 <= s.length <= 10^4`', '`s` consists of parentheses only `()[]{}`'],
    signature: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s)',
    signal: 'Match brackets in correct LIFO order.',
    invariant: 'Stack holds unmatched open brackets.',
    bruteForce: 'O(n²) — repeatedly remove "()", "[]", "{}" until empty or stuck.',
    optimized: 'O(n) time, O(n) space — single pass stack.',
  },

  '04-stack/day-16-min-stack': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/min-stack/',
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in **constant time**.

Implement the \`MinStack\` class:
- \`MinStack()\` initializes the stack object.
- \`void push(int val)\` pushes the element \`val\` onto the stack.
- \`void pop()\` removes the element on the top of the stack.
- \`int top()\` gets the top element.
- \`int getMin()\` retrieves the minimum element in the stack.

You must implement a solution with \`O(1)\` time complexity for each function call.`,
    examples: [
      {
        input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
        output: '[null,null,null,null,-3,null,0,-2]',
      },
    ],
    constraints: ['`-2^31 <= val <= 2^31 - 1`', 'Methods `pop`, `top` and `getMin` always called on non-empty stack.', 'At most `3 * 10^4` calls.'],
    signature: 'class MinStack {\n  constructor() {}\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}',
    signal: 'Stack with O(1) min — auxiliary min stack.',
    invariant: 'Parallel stack tracks min at each depth.',
    bruteForce: 'O(n) getMin — scan stack.',
    optimized: 'O(1) all ops — store min alongside each push.',
    isClass: true,
    exportName: 'MinStack',
  },

  '04-stack/day-17-daily-temperatures': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/daily-temperatures/',
    description: `Given an array of integers \`temperatures\` represents the daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`th day to get a warmer temperature. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.`,
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
      { input: 'temperatures = [30,60,90]', output: '[1,1,0]' },
    ],
    constraints: ['`1 <= temperatures.length <= 10^5`', '`30 <= temperatures[i] <= 100`'],
    signature: '/**\n * @param {number[]} temperatures\n * @return {number[]}\n */\nfunction dailyTemperatures(temperatures)',
    signal: 'Next greater element to the right for each index.',
    invariant: 'Monotonic decreasing stack stores indices awaiting warmer day.',
    bruteForce: 'O(n²) — nested loops.',
    optimized: 'O(n) time — monotonic stack.',
  },

  '04-stack/day-55-evaluate-rpn': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
    description: `You are given an array of strings \`tokens\` that represents an arithmetic expression in a **Reverse Polish Notation**.

Evaluate the expression. Return an integer that represents the value of the expression.

**Note** that:
- The valid operators are \`'+'\`, \`'-'\`, \`'*'\`, and \`'/'\`.
- Each operand may be an integer or another expression.
- The division between two integers always **truncates toward zero**.
- There will not be any division by zero.
- The input represents a valid arithmetic expression.
- All intermediate results will be in the range \`[-2^31, 2^31 - 1]\`.`,
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
      { input: 'tokens = ["4","13","5","/","+"]', output: '6' },
      { input: 'tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]', output: '22' },
    ],
    constraints: ['`1 <= tokens.length <= 10^4`', '`tokens[i]` is an operator or integer in range `[-200, 200]`'],
    signature: '/**\n * @param {string[]} tokens\n * @return {number}\n */\nfunction evalRPN(tokens)',
    signal: 'Process tokens left-to-right; stack for operands.',
    invariant: 'Operator pops two, pushes result.',
    bruteForce: 'Same approach — stack is the standard solution.',
    optimized: 'O(n) time, O(n) space.',
  },

  '05-binary-search/day-18-binary-search': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/binary-search/',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: [
      '`1 <= nums.length <= 10^4`',
      '`-10^4 < nums[i], target < 10^4`',
      'All integers in `nums` are unique.',
      '`nums` is sorted in ascending order.',
    ],
    signature: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target)',
    signal: 'Find target in sorted array.',
    invariant: 'Search space [lo, hi] halves each step.',
    bruteForce: 'O(n) linear scan.',
    optimized: 'O(log n) — classic binary search.',
  },

  '05-binary-search/day-19-search-insert': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/search-insert-position/',
    description: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: 'nums = [1,3,5,6], target = 5', output: '2' },
      { input: 'nums = [1,3,5,6], target = 2', output: '1' },
      { input: 'nums = [1,3,5,6], target = 7', output: '4' },
    ],
    constraints: ['`1 <= nums.length <= 10^4`', '`-10^4 <= nums[i] <= 10^4`', '`nums` is distinct and sorted.', '`-10^4 <= target <= 10^4`'],
    signature: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction searchInsert(nums, target)',
    signal: 'Lower bound — first index where nums[i] >= target.',
    invariant: 'Binary search for insertion point.',
    bruteForce: 'O(n) linear scan.',
    optimized: 'O(log n) — lower-bound binary search.',
  },

  '05-binary-search/day-20-min-rotated': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    description: `Suppose an array of length \`n\` sorted in ascending order is **rotated** between \`1\` and \`n\` times. Given the sorted rotated array \`nums\` of **unique** elements, return the minimum element.

You must write an algorithm that runs in \`O(log n)\` time.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
      { input: 'nums = [11,13,15,17]', output: '11' },
    ],
    constraints: ['`n == nums.length`', '`1 <= n <= 5000`', '`-5000 <= nums[i] <= 5000`', 'All integers are unique.', '`nums` is sorted ascending and rotated 1 to n times.'],
    signature: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction findMin(nums)',
    signal: 'Find minimum in rotated sorted array.',
    invariant: 'If nums[mid] > nums[hi], min is in right half; else in left.',
    bruteForce: 'O(n) scan.',
    optimized: 'O(log n) — binary search on rotation.',
  },

  '05-binary-search/day-56-search-rotated': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **rotated** at an unknown pivot index. Given \`nums\` and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not.

You must write an algorithm with \`O(log n)\` runtime.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      { input: 'nums = [1], target = 0', output: '-1' },
    ],
    constraints: ['`1 <= nums.length <= 5000`', '`-10^4 <= nums[i] <= 10^4`', 'All values unique.', '`nums` is rotated sorted array.'],
    signature: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target)',
    signal: 'Binary search on rotated array — identify sorted half.',
    invariant: 'One half [lo,mid] or [mid,hi] is always sorted.',
    bruteForce: 'O(n) scan.',
    optimized: 'O(log n) — modified binary search.',
  },

  '06-linked-list/day-22-reverse-list': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: ['`0 <= number of nodes <= 5000`', '`-5000 <= Node.val <= 5000`'],
    followUp: 'Can you reverse in O(1) space?',
    signature: '/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head)',
    signal: 'Reverse singly linked list in-place.',
    invariant: 'Save next, point curr.next to prev, advance both.',
    bruteForce: 'O(n) time, O(n) space — copy values to array, rebuild.',
    optimized: 'O(n) time, O(1) space — iterative pointer reversal.',
  },

  '06-linked-list/day-23-merge-lists': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' },
    ],
    constraints: ['`0 <= list length <= 50`', '`-100 <= Node.val <= 100`', 'Both lists sorted in non-decreasing order.'],
    signature: '/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nfunction mergeTwoLists(list1, list2)',
    signal: 'Merge two sorted linked lists.',
    invariant: 'Dummy head; attach smaller node each step.',
    bruteForce: 'O(n+m) — collect values, sort, rebuild (wasteful).',
    optimized: 'O(n+m) time, O(1) space — two-pointer merge.',
  },

  '06-linked-list/day-24-linked-list-cycle': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/linked-list-cycle/',
    description: `Given \`head\`, the head of a linked list, determine if the linked list has a **cycle** in it.

There is a cycle if some node can be reached again by continuously following the \`next\` pointer.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to node index 1.' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    constraints: ['`0 <= nodes <= 10^4`', '`-10^5 <= Node.val <= 10^5`', '`pos` is -1 or valid index.'],
    followUp: 'Can you solve it using O(1) memory?',
    signature: '/**\n * @param {ListNode} head\n * @return {boolean}\n */\nfunction hasCycle(head)',
    signal: 'Detect cycle in linked list.',
    invariant: 'Fast pointer moves 2x; if cycle, fast meets slow.',
    bruteForce: 'O(n) space — hash set of visited nodes.',
    optimized: 'O(n) time, O(1) space — Floyd\'s algorithm.',
  },

  '06-linked-list/day-57-remove-nth': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    description: `Given the head of a linked list, remove the **nth** node from the **end** of the list and return its head.`,
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' },
      { input: 'head = [1,2], n = 1', output: '[1]' },
    ],
    constraints: ['`1 <= nodes <= 30`', '`-100 <= Node.val <= 100`', '`1 <= n <= nodes`'],
    followUp: 'Could you do this in one pass?',
    signature: '/**\n * @param {ListNode} head\n * @param {number} n\n * @return {ListNode}\n */\nfunction removeNthFromEnd(head, n)',
    signal: 'Remove nth node from end in one pass.',
    invariant: 'Fast pointer n+1 ahead; when fast ends, slow is before target.',
    bruteForce: 'Two passes — count length, then remove.',
    optimized: 'One pass — dummy head + two pointers.',
  },

  '07-tree/day-25-max-depth': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    description: `Given the root of a binary tree, return its **maximum depth**.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: ['`0 <= nodes <= 10^4`', '`-100 <= Node.val <= 100`'],
    signature: '/**\n * @param {TreeNode} root\n * @return {number}\n */\nfunction maxDepth(root)',
    signal: 'Tree depth — classic DFS.',
    invariant: 'depth(node) = 1 + max(depth(left), depth(right)).',
    bruteForce: 'Same DFS — straightforward recursion.',
    optimized: 'O(n) time, O(h) stack space.',
  },

  '07-tree/day-26-invert-tree': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    description: `Given the root of a binary tree, invert the tree, and return its root.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['`0 <= nodes <= 100`', '`-100 <= Node.val <= 100`'],
    signature: '/**\n * @param {TreeNode} root\n * @return {TreeNode}\n */\nfunction invertTree(root)',
    signal: 'Swap left and right subtrees recursively.',
    invariant: 'invert(node) swaps children then recurses.',
    bruteForce: 'Same — recursive swap.',
    optimized: 'O(n) time, O(h) space.',
  },

  '07-tree/day-27-same-tree': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/same-tree/',
    description: `Given the roots of two binary trees \`p\` and \`q\`, write a function to check if they are the same or not.

Two binary trees are the same if they are structurally identical and nodes have the same value.`,
    examples: [
      { input: 'p = [1,2,3], q = [1,2,3]', output: 'true' },
      { input: 'p = [1,2], q = [1,null,2]', output: 'false' },
      { input: 'p = [1,2,1], q = [1,1,2]', output: 'false' },
    ],
    constraints: ['`0 <= nodes <= 100`', '`-10^4 <= Node.val <= 10^4`'],
    signature: '/**\n * @param {TreeNode} p\n * @param {TreeNode} q\n * @return {boolean}\n */\nfunction isSameTree(p, q)',
    signal: 'Structural + value equality check.',
    invariant: 'Same if roots equal and subtrees same.',
    bruteForce: 'Serialize both, compare strings.',
    optimized: 'O(n) DFS simultaneous traversal.',
  },

  '07-tree/day-29-level-order': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['`0 <= nodes <= 2000`', '`-1000 <= Node.val <= 1000`'],
    signature: '/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nfunction levelOrder(root)',
    signal: 'BFS — process level by level.',
    invariant: 'Queue processes fixed levelSize nodes per iteration.',
    bruteForce: 'DFS with depth tracking (also works).',
    optimized: 'O(n) BFS with level-size loop.',
  },

  '07-tree/day-30-lca': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.

The LCA is defined as the lowest node that has both \`p\` and \`q\` as descendants (a node can be a descendant of itself).`,
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' },
      { input: 'root = [1,2], p = 1, q = 2', output: '1' },
    ],
    constraints: ['`2 <= nodes <= 10^5`', '`-10^9 <= Node.val <= 10^9`', 'All Node.val unique.', 'p and q exist in tree.'],
    signature: '/**\n * @param {TreeNode} root\n * @param {TreeNode} p\n * @param {TreeNode} q\n * @return {TreeNode}\n */\nfunction lowestCommonAncestor(root, p, q)',
    signal: 'LCA in binary tree — post-order DFS.',
    invariant: 'If both subtrees return non-null, current node is LCA.',
    bruteForce: 'Store paths to p and q, compare.',
    optimized: 'O(n) single DFS post-order.',
  },

  '07-tree/day-31-diameter': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/',
    description: `Given the root of a binary tree, return the **length** of the **diameter** of the tree.

The diameter is the length of the longest path between any two nodes. The path may or may not pass through the root.

**Length** = number of edges on the path.`,
    examples: [
      { input: 'root = [1,2,3,4,5]', output: '3', explanation: 'Path [4,2,1,3] or [5,2,1,3], length 3.' },
      { input: 'root = [1,2]', output: '1' },
    ],
    constraints: ['`1 <= nodes <= 10^4`', '`-100 <= Node.val <= 100`'],
    signature: '/**\n * @param {TreeNode} root\n * @return {number}\n */\nfunction diameterOfBinaryTree(root)',
    signal: 'Longest path — track max left+right at each node.',
    invariant: 'During depth DFS, update global max with leftDepth + rightDepth.',
    bruteForce: 'Check all pairs of nodes.',
    optimized: 'O(n) — single DFS with global max.',
  },

  '07-tree/day-32-serialize-tree': {
    difficulty: 'Hard',
    lcUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    description: `Serialization is converting a data structure into a sequence of bits for storage or transmission. Design an algorithm to serialize and deserialize a binary tree.

There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.`,
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: ['`0 <= nodes <= 10^4`', '`-1000 <= Node.val <= 1000`'],
    signature: 'function serialize(root) / function deserialize(data)',
    signal: 'Encode tree to string and back — BFS or DFS.',
    invariant: 'Level-order with null markers preserves structure.',
    bruteForce: 'Preorder with nulls works too.',
    optimized: 'O(n) BFS serialize/deserialize.',
  },

  '07-tree/day-33-flatten-tree': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/',
    description: `Given the root of a binary tree, flatten the tree into a **linked list**:

- The linked list should use the same \`TreeNode\` class where the \`right\` child pointer points to the next node and \`left\` child is always \`null\`.
- The linked list should be in the same order as a **pre-order traversal**.`,
    examples: [
      { input: 'root = [1,2,5,3,4,null,6]', output: '[1,null,2,null,3,null,4,null,5,null,6]' },
      { input: 'root = []', output: '[]' },
      { input: 'root = [0]', output: '[0]' },
    ],
    constraints: ['`0 <= nodes <= 2000`', '`-100 <= Node.val <= 100`'],
    followUp: 'Can you flatten in-place O(1) extra space?',
    signature: '/**\n * @param {TreeNode} root\n * @return {void}\n */\nfunction flatten(root)',
    signal: 'Preorder flatten to right-skewed list.',
    invariant: 'Reverse post-order: process right, left, then attach to prev.',
    bruteForce: 'Preorder traversal, rebuild list.',
    optimized: 'O(n) reverse post-order with prev pointer.',
  },

  '07-tree/day-34-path-sum': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/path-sum/',
    description: `Given the root of a binary tree and an integer \`targetSum\`, return \`true\` if the tree has a **root-to-leaf** path such that adding up all the values along the path equals \`targetSum\`.

A **leaf** is a node with no children.`,
    examples: [
      { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22', output: 'true', explanation: 'Path 5→4→11→2 = 22.' },
      { input: 'root = [1,2,3], targetSum = 5', output: 'false' },
      { input: 'root = [], targetSum = 0', output: 'false' },
    ],
    constraints: ['`0 <= nodes <= 5000`', '`-1000 <= Node.val <= 1000`', '`-1000 <= targetSum <= 1000`'],
    signature: '/**\n * @param {TreeNode} root\n * @param {number} targetSum\n * @return {boolean}\n */\nfunction hasPathSum(root, targetSum)',
    signal: 'Root-to-leaf path equals target?',
    invariant: 'At leaf, check if remaining sum is 0.',
    bruteForce: 'DFS all paths.',
    optimized: 'O(n) DFS subtracting node.val from target.',
  },

  '08-graph/day-36-number-of-islands': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/number-of-islands/',
    description: `Given an \`m x n\` 2D binary grid which represents a map of \`'1'\`'s (land) and \`'0'\`'s (water), return the **number of islands**.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges are surrounded by water.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    ],
    constraints: ['`m == grid.length`', '`n == grid[i].length`', '`1 <= m, n <= 300`', '`grid[i][j]` is `0` or `1`'],
    signature: '/**\n * @param {character[][]} grid\n * @return {number}\n */\nfunction numIslands(grid)',
    signal: 'Count connected components of 1s in grid.',
    invariant: 'DFS/BFS each unvisited land cell; mark visited (sink).',
    bruteForce: 'Same DFS — standard approach.',
    optimized: 'O(m*n) DFS or BFS.',
  },

  '08-graph/day-37-course-schedule': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/course-schedule/',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates you **must** take course \`b_i\` first if you want to take course \`a_i\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' },
    ],
    constraints: ['`1 <= numCourses <= 2000`', '`0 <= prerequisites.length <= 5000`', 'No duplicate prerequisites.'],
    signature: '/**\n * @param {number} numCourses\n * @param {number[][]} prerequisites\n * @return {boolean}\n */\nfunction canFinish(numCourses, prerequisites)',
    signal: 'Can complete all courses? — cycle detection in directed graph.',
    invariant: 'Topo sort (Kahn\'s BFS): if all nodes processed, no cycle.',
    bruteForce: 'DFS cycle detection with 3-color marking.',
    optimized: 'O(V+E) Kahn\'s algorithm or DFS.',
  },

  '08-graph/day-38-clone-graph': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/clone-graph/',
    description: `Given a reference of a node in a **connected** undirected graph, return a **deep copy** (clone) of the graph.

Each node contains a value (\`int\`) and a list of neighbors (\`Node[]\`).`,
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' },
      { input: 'adjList = [[]]', output: '[[]]' },
      { input: 'adjList = []', output: '[]' },
    ],
    constraints: ['`0 <= nodes <= 100`', '`1 <= Node.val <= 100`', '`Node.val` unique.', 'Graph connected.', 'No self-loop or repeated edges.'],
    signature: '/**\n * @param {Node} node\n * @return {Node}\n */\nfunction cloneGraph(node)',
    signal: 'Deep copy graph — map old node → new node.',
    invariant: 'DFS/BFS; create clone on first visit, reuse from map.',
    bruteForce: 'Same — map is essential.',
    optimized: 'O(V+E) DFS with HashMap.',
  },

  '09-intervals/day-39-merge-intervals': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/merge-intervals/',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap → [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: ['`1 <= intervals.length <= 10^4`', '`0 <= start_i <= end_i <= 10^4`'],
    signature: '/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals)',
    signal: 'Merge overlapping intervals.',
    invariant: 'Sort by start; merge if current.start <= last.end.',
    bruteForce: 'Repeatedly merge until stable.',
    optimized: 'O(n log n) sort + O(n) scan.',
  },

  '09-intervals/day-40-insert-interval': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/insert-interval/',
    description: `You are given an array of non-overlapping intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\` sorted by \`start_i\`, and an interval \`newInterval\`. Insert \`newInterval\` into \`intervals\` such that \`intervals\` remains sorted and non-overlapping.

Merge if necessary.`,
    examples: [
      { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
      { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]' },
    ],
    constraints: ['`0 <= intervals.length <= 10^4`', '`intervals[i].length == 2`', '`0 <= start_i <= end_i <= 10^5`', 'Intervals non-overlapping and sorted by start.'],
    signature: '/**\n * @param {number[][]} intervals\n * @param {number[]} newInterval\n * @return {number[][]}\n */\nfunction insert(intervals, newInterval)',
    signal: 'Insert and merge in one pass.',
    invariant: 'Three phases: before, overlapping (merge), after.',
    bruteForce: 'Insert then call merge.',
    optimized: 'O(n) single pass.',
  },

  '09-intervals/day-41-meeting-rooms-ii': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/meeting-rooms-ii/',
    description: `Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return the **minimum number of conference rooms** required.`,
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: '2' },
      { input: 'intervals = [[7,10],[2,4]]', output: '1' },
    ],
    constraints: ['`1 <= intervals.length <= 10^4`', '`0 <= start_i < end_i <= 10^6`'],
    signature: '/**\n * @param {number[][]} intervals\n * @return {number}\n */\nfunction minMeetingRooms(intervals)',
    signal: 'Min rooms = max concurrent meetings.',
    invariant: 'Sort by start; min-heap of end times; reuse room if earliest end <= start.',
    bruteForce: 'Check overlap count for each time point.',
    optimized: 'O(n log n) sort + min heap.',
  },

  '10-dp/day-43-climbing-stairs': {
    difficulty: 'Easy',
    lcUrl: 'https://leetcode.com/problems/climbing-stairs/',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' },
    ],
    constraints: ['`1 <= n <= 45`'],
    signature: '/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n)',
    signal: 'Count ways — Fibonacci-style DP.',
    invariant: 'ways(n) = ways(n-1) + ways(n-2).',
    bruteForce: 'O(2^n) recursion.',
    optimized: 'O(n) time, O(1) space iterative.',
  },

  '10-dp/day-44-house-robber': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/house-robber/',
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems **connected** — you **cannot** rob two adjacent houses.

Given an integer array \`nums\` representing money of each house, return the **maximum** amount you can rob **without alerting police**.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (1) + house 3 (3) = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12' },
    ],
    constraints: ['`1 <= nums.length <= 100`', '`0 <= nums[i] <= 400`'],
    signature: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction rob(nums)',
    signal: 'Max sum with no adjacent picks.',
    invariant: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).',
    bruteForce: 'O(2^n) include/exclude recursion.',
    optimized: 'O(n) time, O(1) space.',
  },

  '10-dp/day-45-coin-change': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/coin-change/',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the **fewest** number of coins needed to make up that amount. If impossible, return \`-1\`.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1.' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    constraints: ['`1 <= coins.length <= 12`', '`1 <= coins[i] <= 2^31 - 1`', '`0 <= amount <= 10^4`'],
    signature: '/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount)',
    signal: 'Min coins — unbounded knapsack DP.',
    invariant: 'dp[a] = min(dp[a], dp[a-coin] + 1) for each coin.',
    bruteForce: 'Recursive with memo.',
    optimized: 'O(amount * coins) bottom-up DP.',
  },

  '10-dp/day-46-lis': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    description: `Given an integer array \`nums\`, return the length of the longest **strictly increasing subsequence**.`,
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '[2,3,7,101].' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
      { input: 'nums = [7,7,7,7,7,7,7]', output: '1' },
    ],
    constraints: ['`1 <= nums.length <= 2500`', '`-10^4 <= nums[i] <= 10^4`'],
    followUp: 'Can you come up with O(n log n) solution?',
    signature: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction lengthOfLIS(nums)',
    signal: 'LIS — patience sorting / DP.',
    invariant: 'piles[i] = smallest tail of increasing subseq of length i+1.',
    bruteForce: 'O(2^n) all subsequences.',
    optimized: 'O(n log n) binary search on piles.',
  },

  '11-design/day-50-lru-cache': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/lru-cache/',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement \`LRUCache\`:
- \`LRUCache(int capacity)\`
- \`int get(int key)\` — return value or -1 if not found
- \`void put(int key, int value)\` — update or insert. When capacity exceeded, evict LRU key.

Both functions must run in **O(1)** average time.`,
    examples: [
      {
        input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
        output: '[null,null,null,1,null,-1,null,-1,3,4]',
      },
    ],
    constraints: ['`1 <= capacity <= 3000`', '`0 <= key <= 10^4`', '`0 <= value <= 10^5`', 'At most `2 * 10^5` calls.'],
    signature: 'class LRUCache { constructor(capacity) {} get(key) {} put(key, value) {} }',
    signal: 'O(1) get/put with eviction — Map + doubly linked list.',
    invariant: 'Map for lookup; linked list for usage order (or Map insertion order in JS).',
    bruteForce: 'O(n) eviction scanning timestamps.',
    optimized: 'O(1) — HashMap + DLL (or JS Map delete/reinsert trick).',
    isClass: true,
    exportName: 'LRUCache',
  },

  '11-design/day-51-flatten-array': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/flatten-deeply-nested-array/',
    description: `Given a multi-dimensional array \`arr\` and a depth \`n\`, return a flattened version of that array.

A **multi-dimensional** array is a recursive data structure where each element is either an array or a non-array.

Flattening depth \`n\` means reducing dimensions until depth reaches 0 — then stop flattening further.`,
    examples: [
      { input: 'arr = [1,2,3,4], n = 1', output: '[1,2,3,4]' },
      { input: 'arr = [1,[2,[3,[4]]]], n = 2', output: '[1,2,3,[4]]' },
      { input: 'arr = [[[1,2,3]]], n = 3', output: '[1,2,3]' },
    ],
    constraints: ['`0 <= arr.length <= 10^4`', '`maxDepth <= 1000`', '`2 <= n <= 1000`', 'All `arr[i]` are arrays or integers.'],
    signature: '/**\n * @param {Array} arr\n * @param {number} depth\n * @return {Array}\n */\nfunction flat(arr, depth)',
    signal: 'Flatten nested array to given depth — recursion.',
    invariant: 'If array and depth > 0, recurse with depth-1; else push as-is.',
    bruteForce: 'Built-in Array.flat(depth).',
    optimized: 'O(n) recursion over elements.',
  },

  '11-design/day-52-trie': {
    difficulty: 'Medium',
    lcUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    description: `A **trie** (prefix tree) is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class:

- \`Trie()\` initializes the trie.
- \`void insert(String word)\` inserts string \`word\`.
- \`boolean search(String word)\` returns true if \`word\` is in the trie.
- \`boolean startsWith(String prefix)\` returns true if a previously inserted string has prefix \`prefix\`.`,
    examples: [
      {
        input: '["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]',
        output: '[null,null,true,false,true,null,true]',
      },
    ],
    constraints: ['`1 <= word.length, prefix.length <= 2000`', 'Lowercase English letters only.', 'At most `3 * 10^4` calls.'],
    signature: 'class Trie { constructor() {} insert(word) {} search(word) {} startsWith(prefix) {} }',
    signal: 'Prefix tree for autocomplete.',
    invariant: 'Each node has children map + isEnd flag.',
    bruteForce: 'Store all words in array, scan for prefix.',
    optimized: 'O(m) per op where m = word length.',
    isClass: true,
    exportName: 'Trie',
  },
};
