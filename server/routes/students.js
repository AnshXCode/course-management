import { Router } from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
    const result = await pool.query("SELECT * FROM students ORDER BY created_at");
    res.status(200).json(result.rows);
}));

router.post("/", requireAdmin, asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).json({ error: "Both username and email required" });
    }
    const result = await pool.query(
        `INSERT INTO students (username, email) VALUES ($1, $2)
         RETURNING id, username, email, created_at`,
        [username, email]
    );
    if (result.rows.length === 0) {
        return res.status(500).json({ error: "Something went wrong" });
    }
    res.status(201).json(result.rows[0]);
}));

router.put("/:id", requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).json({ error: "Both username and email required" });
    }
    const result = await pool.query(
        `UPDATE students SET username=$1, email=$2 WHERE id = $3
         RETURNING id, username, email, created_at`,
        [username, email, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(result.rows[0]);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM students WHERE id=$1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(result.rows[0]);
}));

export default router;
