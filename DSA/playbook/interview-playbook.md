# Interview Playbook — Pass Even When You Don't Finish

> Goal: interviewer leaves thinking *"This person thinks clearly under pressure."*

## The 45-Minute Timeline

```
0────5────15────35────45 min
│    │     │      │     │
Clarify Brute Optimize Code  Test
       discuss  implement
```

| Phase | Minutes | What to do |
|-------|---------|------------|
| **Clarify** | 0–5 | Repeat problem, ask constraints, write 2 examples (normal + edge) as comments |
| **Brute force** | 5–15 | Say naive approach + complexity out loud. Get interviewer nod before optimizing |
| **Implement** | 15–35 | Write clean JS. Talk while coding. Use helper functions |
| **Test & wrap** | 35–45 | Dry-run with your example. Name complexity. Mention what you'd improve |

### If stuck at minute 20

1. **Don't go silent** — narrate what you're trying
2. **Drop to brute force** — "Let me get something working first"
3. **Ask a hint** — "Is hash map the right direction here?"
4. **Partial credit** — correct approach + buggy code beats silence

---

## Questions to Ask the Interviewer (scored as senior signal)

### Before coding

- "Can the input be empty? Negative numbers? Duplicates?"
- "What should I return if no valid answer exists — null, -1, empty array?"
- "Is the input sorted? Can I sort it?" (changes approach entirely)
- "What's the expected input size — hundreds or millions?" (drives complexity choice)
- "Should I optimize for time or space if I can't have both?"

### During coding

- "I'll use a Map for O(1) lookups — does that work for you?"
- "JavaScript doesn't have a built-in heap — can I assume one exists?"
- "I'm going to extract a helper to keep the main loop readable."

### After coding

- "Time is O(n), space O(n) for the map. We could reduce space to O(1) if we sorted first, but that's O(n log n) time."
- "Edge cases I handled: empty input, single element, all duplicates."
- "In production I'd add input validation and unit tests for these cases."

---

## How to Look Capable When You Don't Solve It

| Situation | What to say |
|-----------|-------------|
| Wrong approach initially | "My first instinct was X, but that fails when Y. Let me pivot to Z." |
| Can't finish code | "Here's the algorithm fully; I'd need 5 more minutes to wire the loop." |
| Bug found in dry run | "Good catch — I'd move the pointer update after the window shrinks." |
| Never seen problem | "This looks like a sliding window — contiguous subarray with a constraint." |

**Interviewers score:** problem decomposition > perfect syntax > optimal complexity.

---

## Time Management Tips

### Daily practice (60 min session)

| Block | Duration | Activity |
|-------|----------|----------|
| Warm-up | 5 min | Re-state yesterday's pattern in one sentence |
| Solve | 35 min | Timed. Stop when timer ends even if incomplete |
| Review | 15 min | Read canonical solution, note what you missed |
| Reflect | 5 min | Write: pattern, invariant, complexity |

### Pattern recognition speed drill

Before coding, fill this template in **under 90 seconds**:

```
Pattern: ___________
Invariant: ___________ (what stays true each step)
Data structure: ___________
Complexity target: ___________
```

### JavaScript-specific traps (lose minutes if forgotten)

| Trap | Fix |
|------|-----|
| `arr.shift()` in loop | O(n²) — use index pointer instead |
| `arr.sort()` without comparator | Sorts as strings: `[10,2]` → `[10,2]` wrong |
| Mutating while iterating | Copy first or iterate backwards |
| `Map` vs object | Use `Map` for arbitrary keys, frequent add/delete |
| Recursion depth | Mention stack overflow for n > 10k; offer iterative |

---

## Communication Scripts

### Opening

> "Let me make sure I understand. We're given [X] and need to return [Y]. Can I assume [constraint]?"

### Transitioning to optimal

> "Brute force is O(n²) with nested loops. Since we need 'have we seen this value', a hash map gives O(n) time and O(n) space."

### While coding

> "I'm tracking the left boundary of the window. When the constraint breaks, I shrink from the left."

### Closing

> "Let me trace through the example: [walk through]. Time O(n), space O(k) where k is charset size."

---

## Red Flags vs Green Flags

| Red flag | Green flag |
|----------|------------|
| Coding in silence for 5+ min | Thinking aloud continuously |
| Jumping to code without examples | Writing examples as comments first |
| "I memorized this solution" | "This is the sliding window pattern because..." |
| Ignoring edge cases when prompted | Proactively listing empty/single/duplicate |
| Arguing with hints | "That's helpful — I'll adjust the invariant" |

---

## Weekly Mock Interview Checklist

- [ ] 1 timed problem (45 min) recorded or with a friend
- [ ] Explain solution without looking at code
- [ ] Re-solve 2 problems from memory (patterns you struggled with)
- [ ] 1 machine coding session (autocomplete, debounce, or infinite scroll)

---

## Day-Before Interview

1. Review `patterns/README.md` — pattern recognition signals only
2. Re-solve 2 easy problems from memory (confidence boost)
3. Sleep > cramming new hard problems
