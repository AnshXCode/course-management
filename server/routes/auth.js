import express from "express";
import pool from "../db/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailForVerification } from "../services/email.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, emailSchema } from "../schemas/auth.schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const verifyPassword = async (password, hashPassword) => {
    // bcrypt.compare returns a Promise that resolves to true if the password matches the hash, or false otherwise.
    return bcrypt.compare(password, hashPassword);
};

router.get("/verify-email/:verifyToken", asyncHandler(async (req, res) => {
    try {
        const { verifyToken } = req.params;
        const payload = jwt.verify(verifyToken, process.env.JWT_SECRET);
        if (payload.purpose !== "email-verify") {
            return res.status(400).json({ error: "Invalid or expired link" });
        }
        const user_id = payload.userId;
        const result = await pool.query(
            `UPDATE users SET email_verified = true WHERE id=$1 AND email_verified = false RETURNING id`,
            [user_id]
        );
        if (result.rows.length > 0) {
            return res.status(200).json({ info: "Email verified. You can login now" });
        }
        const check = await pool.query(`SELECT email_verified FROM users WHERE id=$1`, [user_id]);
        if (check.rows.length > 0 && check.rows[0].email_verified) {
            return res.status(200).json({ info: "Email already verified. You can log in." });
        }
        return res.status(400).json({ error: "Unable to verify email." });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ error: "Link Expired. Please resend link and try.", expired: true });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid verification link." });
        }
        throw error;
    }
}));

router.post("/register", validateBody(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const emailExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (emailExists.rows.length > 0 && emailExists.rows[0].email_verified) {
        return res.status(409).json({ error: "Email already exists. Please Login." });
    }
    if (emailExists.rows.length > 0 && !emailExists.rows[0].email_verified) {
        return res.status(409).json({ error: "Email already exists. Please verify Email." });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
        [email, password_hash]
    );
    const token = jwt.sign(
        { userId: result.rows[0].id, purpose: "email-verify" },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    );
    await sendEmailForVerification(email, token);
    res.status(201).json({ info: "Email send. Please verify." });
}));

router.post("/resend-email", validateBody(emailSchema), asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await pool.query(
        `SELECT id, email, role, email_verified, password_hash FROM users WHERE email=$1`,
        [email]
    );
    if (result.rows.length === 0) {
        return res.status(401).json({ error: "Please register email. Given email does not exist" });
    }
    if (result.rows[0].email_verified) {
        return res.status(200).json({ info: "Email already verified. You can log in." });
    }
    const token = jwt.sign(
        { userId: result.rows[0].id, purpose: "email-verify" },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    );
    await sendEmailForVerification(email, token);
    res.status(200).json({ info: "Email send. Please verify." });
}));

router.post("/login", validateBody(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
        `SELECT id, email, role, email_verified, password_hash FROM users WHERE email=$1`,
        [email]
    );
    if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!result.rows[0].email_verified) {
        return res.status(403).json({ error: "Please register and verify email", needsVerification: true });
    }
    const isPasswordCorrect = await verifyPassword(password, result.rows[0].password_hash);
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    const payload = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, user: payload });
}));

export default router;
