# DSA — Frontend Interview Prep

**60 pattern-based problems in JavaScript. No memorization — learn invariants, solve anything.**

## Quick Start

```bash
# Run today's solution (example: Day 1)
cd DSA/solutions/01-hash-map/day-01-two-sum
node mySolution.js    # your attempt
node solution.js      # reference (after you try)

# Run all reference solutions
node DSA/run-all.js
```

## What's Inside

| Folder | Purpose |
|--------|---------|
| [`research/`](research/interview-intelligence.md) | DSA questions grouped by topic & frequency (Glassdoor, LC Discuss, Reddit, Medium, dev.to) |
| [`playbook/`](playbook/interview-playbook.md) | 45-min timeline, questions to ask, how to pass when stuck |
| [`patterns/`](patterns/README.md) | 11 patterns with recognition signals & templates |
| [`curriculum/`](curriculum/60-day-plan.md) | Day-by-day schedule for 60 must-know problems |
| [`solutions/`](solutions/) | Runnable JS — solve in `mySolution.js`, reference in `solution.js` |
| [`utils/`](utils/data-structures.js) | ListNode, TreeNode, Queue, MinHeap |

## Philosophy

1. **Patterns over problems** — Sliding window is one invariant; 6 problems are practice reps
2. **Talk while coding** — Interviewers score process, not just output
3. **Brute force first** — Optimize after you have something correct
4. **Frontend context** — Trees = DOM; hash maps = dedup; windows = streams

## Your 60-Day Loop

```
Read pattern (5m) → Timed solve (35m) → Compare solution (15m) → Journal (5m)
```

Start at **Day 1**: [Two Sum](solutions/01-hash-map/day-01-two-sum/solution.js)

Full schedule: [`curriculum/60-day-plan.md`](curriculum/60-day-plan.md)

## Research Highlights (2025–2026)

- **Most frequent:** Hash map, sliding window, trees, stacks, intervals
- **Rare for frontend:** Hard DP, advanced graph theory
- **Still critical:** LRU cache, flatten nested array, topo sort (dependencies)
- **Weight shift:** DSA ~15–20% of decision; communication & machine coding matter more

Details: [`research/interview-intelligence.md`](research/interview-intelligence.md)

## Interview Day Checklist

- [ ] Clarify constraints before coding
- [ ] State brute force + optimized complexity
- [ ] Code while narrating
- [ ] Dry-run with your example
- [ ] Name edge cases proactively

Full playbook: [`playbook/interview-playbook.md`](playbook/interview-playbook.md)

---

*Let's go. Day 1 is waiting.*
