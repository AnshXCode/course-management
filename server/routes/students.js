import {Router} from "express";
import pool from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * from students ORDER BY created_at");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

router.post("/", requireAdmin, async (req, res) => {
    try {
        const { username, email } = req.body;
        if (!username || !email) {
            return res.status(400).json({ error: "Both username and email required" })
        }
        const result = await pool.query(`Insert into Students (username, email) VALUES ($1, $2) RETURNING
            id, username, email, created_at`, [username, email]);
        if (result.rows.length === 0) {
            return res.status(500).json({ error: "Something went wrong" });
        }
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "username or email already exists" });
        }
        res.status(500).json({ "error": "Something went wrong" });
        console.error(error);
    }
});

router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        if (!username || !email) {
            return res.status(400).json({ error: "Both username and email required" })
        }
        const result = await pool.query(`UPDATE students SET username=$1, email=$2 Where id = $3 
            RETURNING id, username, email, created_at`, [username, email, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" })
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            res.status(409).json({ error: "Existing emailId or username" });
        }
        res.status(500).json({error: error.message})
    }
});

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE from students WHERE id=$1 RETURNING id`,[id]);
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

export default router;