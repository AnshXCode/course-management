import { Router } from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { courseBodySchema } from "../schemas/course.schema.js";
const router = Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, code, title, description, capacity, created_at FROM courses ORDER BY id");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

router.post("/", requireAdmin, validateBody(courseBodySchema), async (req, res) => {
    const { code, title, description, capacity } = req.body;
    try {
        // pool.query accepts two arguments:
        // 1. The SQL query string, which can have placeholders ($1, $2, etc.) for parameterized values.
        // 2. An array of values that will be used to safely fill in those placeholders, preventing SQL injection.
        // Example: pool.query(
        //   "INSERT INTO mytable (col1, col2) VALUES ($1, $2)",
        //   [value1, value2]
        // );
        // In this code, we insert a new course and ask the database to return its details:
        const result = await pool.query(
            // In JavaScript, template literals (backticks: ``) allow for multi-line strings and interpolation.
            // Here, we use backticks to write a multi-line SQL query string more cleanly.
            // There is no need for interpolation here,
            // but the backticks let us spread the SQL nicely over multiple lines.

            // In contrast, in the course id query, double quotes ("") are used because that query is short and fits well in a single line.
            // Both are plain strings in JS; backticks are just more convenient for long/multi-line strings.

            `INSERT INTO courses (code, title, description, capacity)
             VALUES ($1, $2, $3, $4)
             RETURNING id, code, title, description, capacity, created_at
            `,
            [code, title, description ?? null, capacity ?? 30]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Course code already exists" });
        }
        console.error("error:", err);
        res.status(500).json({ error: "Failed to create course" });
    }
})

//Get students related to the course. If you add GET /:id/students below GET /:id, Express never reaches it — :id catches first.
router.get("/:id/students", async (req, res) => {
    try {
        const { id } = req.params;
        const course = await pool.query(`SELECT * from courses where id=$1`, [id]);
        if (course.rows.length === 0) {
            return res.status(404).json({ error: 'Course does not exist' })
        }
        const result = await pool.query(`SELECT s.id, s.email, s.username, e.enrolled_at from enrollments e join students s on e.student_id=s.id where e.course_id=$1`, [id]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch students" });
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT id, code, title, description, capacity, created_at FROM courses WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
})

router.put("/:id", requireAdmin, validateBody(courseBodySchema),async (req, res) => {
    const { id } = req.params;
    const { code, title, description, capacity } = req.body;
    try {
        const result = await pool.query(
            `UPDATE courses 
            set code = $1, title= $2, description=$3, capacity=$4
            WHERE id = $5
            RETURNING id, code, title, description, capacity, created_at
            `, [code, title, description ?? null, capacity ?? 30, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        };
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return res.status(409).json({ error: "Course code already exists" });
        }
        res.status(500).json({ error: "Failed to update course" })
    }
})

router.delete("/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`DELETE FROM courses WHERE id=$1 RETURNING id`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delelte course" });
    }
});

export default router;