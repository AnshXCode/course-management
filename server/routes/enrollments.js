import { Router } from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM enrollments ORDER BY id");
    res.status(200).json(result.rows);
}));

router.post("/", requireAdmin, asyncHandler(async (req, res) => {
    const { studentId, courseId, courseName, studentName } = req.body;
    if (!studentId || !courseId) {
        return res.status(400).json({ error: "Please provide both studentId and courseId" });
    }
    const studentsEnrolledInCourseQuery = await pool.query(`SELECT * from Enrollments Where course_id = $1`,[courseId]);
    const capacityQuery = await pool.query(`SELECT capacity from courses where id = $1`,[courseId]);
    if(studentsEnrolledInCourseQuery.rows.length >= capacityQuery.rows[0].capacity){
        return res.status(400).json({error: 'Course capacity full'});
    }
    const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id, student_name, course_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, student_id, course_id, enrolled_at`,
        [studentId, courseId, studentName, courseName]
    );
    res.status(201).json(result.rows[0]);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM enrollments WHERE id=$1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Entry to delete not found" });
    }
    res.status(200).json(result.rows[0]);
}));

export default router;
