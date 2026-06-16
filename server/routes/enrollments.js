import { Router } from "express";
import pool from "../db/pool.js";
import { get, set, del } from "../redis-cache.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const ENROLLMENTS_LIST_KEY = "enrollments:list";
const ENROLLMENTS_LIST_TTL_SECONDS = 60;

router.get("/", asyncHandler(async (req, res) => {
    const cached = await get(ENROLLMENTS_LIST_KEY);
    if (cached) {
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Backend", "redis");
        return res.status(200).json(cached);
    }

    const result = await pool.query("SELECT * FROM enrollments ORDER BY id");
    await set(ENROLLMENTS_LIST_KEY, result.rows, ENROLLMENTS_LIST_TTL_SECONDS);
    res.set("X-Cache", "MISS");
    res.set("X-Cache-Backend", "redis");
    res.status(200).json(result.rows);
}));


// Transaction pattern (reusable template)
// const client = await pool.connect();
// try {
//     await client.query("BEGIN");

//     // all related queries on `client`
//     await client.query("...");
//     await client.query("...");

//     await client.query("COMMIT");
// } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;  // let errorHandler handle PG errors (23505, etc.)
// } finally {
//     client.release();
// }




router.post("/", requireAdmin, asyncHandler(async (req, res) => {
    const { studentId, courseId, courseName, studentName } = req.body;
    if (!studentId || !courseId) {
        return res.status(400).json({ error: "Please provide both studentId and courseId" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Lock the course row — concurrent enrollments block here until this tx commits
        const courseResult = await client.query(
            "SELECT capacity FROM courses WHERE id = $1 FOR UPDATE",
            [courseId]
        );
        if (courseResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Related record does not exist" });
        }

        const countResult = await client.query(
            "SELECT COUNT(*)::int AS count FROM enrollments WHERE course_id = $1",
            [courseId]
        );
        if (countResult.rows[0].count >= courseResult.rows[0].capacity) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Course capacity full" });
        }

        const result = await client.query(
            `INSERT INTO enrollments (student_id, course_id, student_name, course_name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, student_id, course_id, enrolled_at`,
            [studentId, courseId, studentName, courseName]
        );

        await client.query("COMMIT");
        await del(ENROLLMENTS_LIST_KEY);
        res.status(201).json({
            info: "Student enrolled successfully",
            data: result.rows[0],
        });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM enrollments WHERE id=$1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Entry to delete not found" });
    }
    await del(ENROLLMENTS_LIST_KEY);
    res.status(200).json(result.rows[0]);
}));

export default router;
