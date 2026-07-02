/**
 * Shared data structures for DSA practice in JavaScript.
 * LeetCode doesn't provide these — build once, reuse everywhere.
 */

/** @param {number} val */
export function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}

/** @param {number} val */
export function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

/** Build linked list from array: [1,2,3] → 1→2→3 */
export function listFromArray(arr) {
  const dummy = new ListNode(0);
  let cur = dummy;
  for (const v of arr) {
    cur.next = new ListNode(v);
    cur = cur.next;
  }
  return dummy.next;
}

/** Linked list → array */
export function listToArray(head) {
  const out = [];
  while (head) {
    out.push(head.val);
    head = head.next;
  }
  return out;
}

/** Build tree from level-order array (null = missing node) */
export function treeFromArray(arr) {
  if (!arr.length || arr[0] == null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] != null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] != null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

/** O(1) amortized queue using two stacks */
export class Queue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  push(x) {
    this.inStack.push(x);
  }
  shift() {
    if (!this.outStack.length) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop());
    }
    return this.outStack.pop();
  }
  get length() {
    return this.inStack.length + this.outStack.length;
  }
}

/** Min-heap for priority queue problems */
export class MinHeap {
  constructor() {
    this.heap = [];
  }
  push(val) {
    this.heap.push(val);
    this.#bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.#sinkDown(0);
    return top;
  }
  peek() {
    return this.heap[0];
  }
  get size() {
    return this.heap.length;
  }
  #bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  #sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

export function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

export function assertEqual(actual, expected, label = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`FAIL ${label}: expected ${e}, got ${a}`);
}
