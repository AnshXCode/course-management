import { Router } from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
const router = Router();


router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM enrollments ORDER BY id");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
});


router.post("/", requireAdmin, async (req, res) => {
    try {
        const { studentId, courseId, courseName, studentName } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ error: "Please provide both studentId and courseId" })
        }
        const result = await pool.query(`INSERT INTO enrollments (student_id, course_id, student_name, course_name) VALUES ($1, $2, $3, $4) RETURNING id, student_id, course_id, enrolled_at`, [studentId, courseId, studentName, courseName]);
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Already Enrolled" })
        } else if (error.code === "23503") {
            return res.status(400).json({ error: "Provided student id or course id does not exist" });
        }
        console.error(error);
        return res.status(500).json({ error: "Failed to create enrollment" });
    }
})

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`Delete from enrollments where id=$1 RETURNING id`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Entry to delete not found" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
})


export default router;