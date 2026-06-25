import pool from "../db/pool.js";
import { generateRefreshToken, hashToken, REFRESH_DAYS } from "../lib/tokens.js";


export async function createRefreshToken(userId) {
    const raw = generateRefreshToken();
    const token_hash = hashToken(raw);
    const expires_at = new Date(Date.now() + (REFRESH_DAYS) * 24 * 60 * 60 * 1000);

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
        VALUES ($1, $2, $3)
        `, [userId, token_hash, expires_at]
    );

    return raw; //send to client once
}

export async function findValidRefreshToken(raw) {
    const token_hash = hashToken(raw);
    const result = await pool.query(
        `SELECT rt.id, rt.user_id, u.email, u.role 
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = $1 AND rt.expires_at > NOW()
        ` , [token_hash]
    );
    return result.rows[0] ?? null;
}

export async function revokeRefreshToken(raw) {
    const token_hash = hashToken(raw);
    await pool.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [token_hash]);
}

export async function revokeAllForUser(userId) {
    await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
}


export async function deleteExpiredRefreshTokens() {
    const result = await pool.query(`DELETE FROM refresh_tokens WHERE expires_at < NOW() returning id`);
    return result.rowCount; // or result.rows.length
}