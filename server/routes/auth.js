import express from 'express';
import pool from '../db/pool.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { sendEmailForVerification } from '../services/email.js';
import {validateBody} from "../middleware/validate.js";
import {loginSchema,emailSchema} from "../schemas/auth.schema.js";

const router = express.Router();

const verifyPassword = async (hashPassword, password) => {
    try {
        const result = await bcrypt.compare(password, hashPassword);
        if (result) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error.message);
        return false;
    }
}


router.get('/verify-email/:verifyToken', async (req, res) => {
    try {
        const { verifyToken } = req.params;
        const payload = jwt.verify(verifyToken, process.env.JWT_SECRET);
        if (payload.purpose !== 'email-verify') {
            return res.status(400).json({ error: "Invalid or expired link" });
        }
        const user_id = payload.userId;
        const result = await pool.query(`UPDATE users SET email_verified = true WHERE id= $1 and email_verified = false returning id`, [user_id]);
        if (result.rows.length > 0) {
            return res.status(200).json({ info: "Email verified. You can login now" });
        }
        const check = await pool.query(`SELECT email_verified FROM users WHERE id=$1`, [user_id]);
        if (check.rows.length > 0 && check.rows[0].email_verified) {
            return res.status(200).json({ info: "Email already verified. You can log in." });
        }
        return res.status(400).json({ error: "Unable to verify email." });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Link Expired. Please resend link and try.', expired: true });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid verification link." });
        }
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});


router.post("/register", validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailExists = await pool.query(`SELECT * from USERS where EMAIL = $1`, [email]);
        if (emailExists.rows.length > 0 && emailExists.rows[0].email_verified) {
            return res.status(409).json({ error: 'Email already exists. Please Login.' });
        }
        if (emailExists.rows.length > 0 && !emailExists.rows[0].email_verified) {
            return res.status(409).json({ error: 'Email already exists. Please verify Email.' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(`INSERT INTO USERS (email, password_hash) values ($1, $2) returning id, email`, [email, password_hash]);
        const token = jwt.sign(
            { userId: result.rows[0].id, purpose: "email-verify" },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );
        await sendEmailForVerification(email, token);
        return res.status(201).json({ info: 'Email send. Please verify.' })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


router.post("/resend-email", validateBody(emailSchema),async (req, res) => {
    try {
        const { email } = req.body;
        const result = await pool.query(`SELECT id, email, role, email_verified, password_hash FROM users WHERE email=$1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Please register email. Given email does not exist' });
        }
        if (result.rows[0].email_verified) {
            return res.status(200).json({ info: "Email already verified. You can log in." });
        }
        const token = jwt.sign(
            {
                userId: result.rows[0].id,
                purpose: 'email-verify'
            },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        await sendEmailForVerification(email, token);
        return res.status(200).json({ info: 'Email send. Please verify.' })
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:'Something went wrong'});
    }
})


router.post("/login", validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(`SELECT id, email, role, email_verified, password_hash FROM users WHERE email=$1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!result.rows[0].email_verified) {
            return res.status(403).json({ error: 'Please register and verify email', needsVerification: true });
        }
        const hashPassword = result.rows[0].password_hash;
        const isPasswordCorrect = await verifyPassword(hashPassword, password);
        if (isPasswordCorrect) {
            // The 'payload' object contains user-specific information (e.g., id, email, and role)
            // that will be embedded into the JWT (JSON Web Token). This information can later
            // be used to identify the user and their permissions when they make authenticated requests.
            const payload = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                role: result.rows[0].role
            };

            // 'process.env.JWT_SECRET' is a secret key used to sign the JWT. It ensures the token's integrity:
            // only parties with knowledge of this secret can generate a valid token. When the token is received
            // in subsequent requests (usually sent in an Authorization header), the server can verify its signature
            // using the same secret. This prevents tampering and enables stateless authentication.
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            // The generated token is sent to the client. In future requests, the client will include this token
            // in the headers for protected endpoints; the server will verify and use the token's payload
            // to authenticate and authorize the user.
            return res.status(200).json({ token, user: payload });
        } else {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


export default router;