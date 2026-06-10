import { Router } from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { courseBodySchema } from "../schemas/course.schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
    const result = await pool.query(
        "SELECT id, code, title, description, capacity, created_at FROM courses ORDER BY id"
    );
    res.status(200).json(result.rows);
}));

router.post("/", requireAdmin, validateBody(courseBodySchema), asyncHandler(async (req, res) => {
    const { code, title, description, capacity } = req.body;
    const result = await pool.query(
        `INSERT INTO courses (code, title, description, capacity)
         VALUES ($1, $2, $3, $4)
         RETURNING id, code, title, description, capacity, created_at`,
        [code, title, description ?? null, capacity ?? 30]
    );
    res.status(201).json(result.rows[0]);
}));

router.get("/:id/students", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await pool.query(`SELECT * FROM courses WHERE id=$1`, [id]);
    if (course.rows.length === 0) {
        return res.status(404).json({ error: "Course does not exist" });
    }
    const result = await pool.query(
        `SELECT s.id, s.email, s.username, e.enrolled_at
         FROM enrollments e
         JOIN students s ON e.student_id = s.id
         WHERE e.course_id = $1`,
        [id]
    );
    res.status(200).json(result.rows);
}));

router.get("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        "SELECT id, code, title, description, capacity, created_at FROM courses WHERE id = $1",
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(result.rows[0]);
}));

router.put("/:id", requireAdmin, validateBody(courseBodySchema), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, title, description, capacity } = req.body;
    const result = await pool.query(
        `UPDATE courses
         SET code = $1, title = $2, description = $3, capacity = $4
         WHERE id = $5
         RETURNING id, code, title, description, capacity, created_at`,
        [code, title, description ?? null, capacity ?? 30, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(result.rows[0]);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM courses WHERE id=$1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
    }
    res.status(204).send();
}));

export default router;
