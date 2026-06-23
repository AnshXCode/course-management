# Database notes — course-management

Reference for indexing, JOINs, and how they apply to this project's schema (`schema.sql`).

---

## Indexing

### What is an index?

An **index** is a separate lookup structure (Postgres default: **B-tree**) that lets the database find matching rows **without scanning the whole table**.

**Analogy:** The table is a textbook; the index is the back-of-book index. Without it, you read every page. With it, you jump straight to the right page(s).

### Time complexity

| Method | Behavior | Cost as table grows |
|--------|----------|---------------------|
| **Seq Scan** (no useful index) | Read every row | **O(n)** |
| **Index Scan** (B-tree) | Walk the tree to the key | **~O(log n)** |

Postgres may still choose a seq scan on tiny tables because reading the whole table is cheaper than using the index.

### Primary keys and UNIQUE constraints

Every table with a `PRIMARY KEY` gets a **unique B-tree index** on that column automatically.

```sql
id SERIAL PRIMARY KEY   -- creates index users_pkey on (id)
```

`UNIQUE` constraints also create B-tree indexes:

```sql
CONSTRAINT users_email_key UNIQUE (email)   -- index on email
```

**Important:** A PK index only speeds up queries that use the PK column (e.g. `WHERE id = 3`). It does **not** make every query fast.

| Statement | True? |
|-----------|-------|
| Every table with a PK has a B-tree on the PK | Yes |
| The entire table is indexed | No |
| Every `WHERE` is O(log n) | No — only when filtering on an indexed column |

### When to add an index

Index columns that appear in:

1. **`WHERE`** — lookups and filters (`WHERE email = $1`, `WHERE course_id = $1`)
2. **`JOIN`** — foreign key columns on the child table (`enrollments.course_id`)
3. **`ORDER BY`** — sorted lists (`ORDER BY created_at`)

**Skip indexing when:**

- Table is tiny (thousands of rows or less)
- Column is rarely queried
- Column has very low cardinality alone (e.g. `role` with 3 values)
- Column is already covered by PK or UNIQUE

**Tradeoff:** Indexes speed reads but slow writes (`INSERT`/`UPDATE`/`DELETE` must update each index) and use extra disk.

### Foreign keys vs indexes

```sql
course_id INTEGER REFERENCES courses(id)
```

- **Foreign key** = integrity rule ("course must exist")
- **Index** = performance ("find rows by `course_id` fast")

Postgres does **not** auto-create indexes on FK columns. Add them when you query by that column.

### Example: `CREATE INDEX ON enrollments (course_id)`

From `schema.sql`:

```sql
CREATE INDEX enrollments_course_id_idx ON enrollments (course_id);
```

| Part | Meaning |
|------|---------|
| `CREATE INDEX` | Build a new B-tree structure |
| `enrollments_course_id_idx` | Index name (for `EXPLAIN` and migrations) |
| `ON enrollments` | Table being indexed |
| `(course_id)` | Column the tree is sorted by |

**Why it's needed:** The PK is on `id`, and there is a composite UNIQUE on `(student_id, course_id)`. Those do **not** efficiently support queries that filter **only** by `course_id`.

Composite index rule: `(student_id, course_id)` helps `WHERE student_id = ...` most. `WHERE course_id = ...` alone needs its own index.

**Queries in this app that use it:**

```sql
-- Enrollment capacity check (routes/enrollments.js)
SELECT COUNT(*)::int AS count FROM enrollments WHERE course_id = $1;

-- Students in a course (routes/courses.js)
SELECT s.id, s.email, s.username, e.enrolled_at
FROM enrollments e
JOIN students s ON e.student_id = s.id
WHERE e.course_id = $1;
```

**Without index:** Seq Scan — check every enrollment row (O(n)).

**With index:** Index Scan on `enrollments_course_id_idx` — jump to rows for that course (~O(log n) + rows returned).

Verify with:

```sql
EXPLAIN ANALYZE SELECT COUNT(*) FROM enrollments WHERE course_id = 3;
```

Look for `Index Scan using enrollments_course_id_idx`.

### Indexes in this schema

| Query | Column(s) | Index |
|-------|-----------|-------|
| Login `WHERE email = $1` | `users.email` | `users_email_key` (UNIQUE) |
| Lookup by id | any PK | `*_pkey` |
| Enroll count / list by course | `enrollments.course_id` | `enrollments_course_id_idx` |
| Revoke all tokens for user | `refresh_tokens.user_id` | `refresh_tokens_user_id_idx` |
| Refresh by token | `refresh_tokens.token_hash` | UNIQUE on `token_hash` |
| List students `ORDER BY created_at` | `students.created_at` | Not indexed (candidate if table grows) |

---

## JOINs

### When to JOIN two tables

**JOIN** when one query needs data from **more than one table**, linked by a key (usually a foreign key).

Relational design splits data to avoid duplication:

```text
students          courses           enrollments
─────────         ─────────         ─────────────
id, email         id, title         student_id → students.id
username          code              course_id  → courses.id
                                    enrolled_at
```

### Common cases

1. **Need columns from both tables** — enrollment date + student email
2. **Filter on a related table** — refresh token + user role
3. **Many-to-many** — students ↔ courses through `enrollments`

### When not to JOIN

- All columns are in one table (`SELECT * FROM courses WHERE id = 1`)
- Data is denormalized for reads (`student_name`, `course_name` on `enrollments` list)
- Separate databases / microservices (join in application code instead)

### Examples in this project

**Students enrolled in a course (INNER JOIN):**

```sql
SELECT s.id, s.email, s.username, e.enrolled_at
FROM enrollments e
JOIN students s ON e.student_id = s.id
WHERE e.course_id = $1;
```

**Refresh token validation:**

```sql
SELECT rt.id, rt.user_id, u.email, u.role
FROM refresh_tokens rt
JOIN users u ON u.id = rt.user_id
WHERE rt.token_hash = $1 AND rt.expires_at > NOW();
```

### JOIN types (quick reference)

| JOIN | Keeps |
|------|-------|
| `INNER JOIN` | Only rows that match on **both** sides |
| `LEFT JOIN` | All rows from **left** table + matches from right (or NULL) |
| `RIGHT JOIN` | All rows from **right** table (rare in practice) |

---

## LEFT JOIN + `WHERE a.id IS NULL`

### Pattern

```sql
SELECT *
FROM b
LEFT JOIN a ON b.id = a.id
WHERE a.id IS NULL;
```

**Meaning:** Rows in **`b`** that have **no matching row** in **`a`** (orphans / gaps on the left).

### Why it works — two steps

**Step 1 — LEFT JOIN:** Keep every row from `b`. For each row, attach matching `a` rows if they exist. If no match, **`a`'s columns are NULL**.

b (courses)       a (enrollments)
id | title        id | course_id
1  | Math         1  | 1
2  | History      2  | 1
3  | Art          (no enrollments for course 3)

b.id | b.title | a.id | a.course_id
1    | Math    | 1    | 1           ← matched
2    | History | 2    | 1           ← matched  
3    | Art     | NULL | NULL        ← NO match → a's side is NULL
```

**Step 2 — `WHERE a.id IS NULL`:** Keep only rows where **`a` did not match**.

Result: course 3 (Art) — enrolled in `b` but not in `a`.

### Why filter on `a`, not `b`?

- `b` is the preserved side — `b.id` is almost never NULL (it's the PK).
- When there is **no match**, the signal appears as **NULL on the `a` side**.
- When there **is** a match, `a.id` has a real value → excluded by `IS NULL`.

You can use any non-null column from `a` (e.g. `WHERE e.course_id IS NULL`).

### NULL comparison trap

```sql
WHERE b.id = NULL    -- WRONG: always unknown, returns nothing
WHERE b.id IS NULL   -- correct syntax, but useless if id is PK
WHERE a.id IS NULL   -- correct pattern for "no match in a"
```

In SQL, `NULL = NULL` is not TRUE. Always use **`IS NULL`** / **`IS NOT NULL`**.

### Real example — courses with zero enrollments

```sql
SELECT c.id, c.title
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE e.course_id IS NULL;
```

### Visual

```text
Match:     b ●──────────────● a     →  a.id = 5
No match:  b ●────── ✗              →  a.id = NULL  ← WHERE a.id IS NULL
```

---

## Quick reference

| Concept | One-liner |
|---------|-----------|
| Index | B-tree on a column for fast lookup instead of full table scan |
| PK / UNIQUE | Already creates a B-tree — don't duplicate |
| FK index | Add manually when you filter/join on that column |
| JOIN | Combine tables when one answer needs columns from both |
| LEFT JOIN + `a.id IS NULL` | Find left-table rows with no partner on the right |
