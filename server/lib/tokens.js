import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRY = "15m";
export const REFRESH_DAYS = 7;

export function signAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, type: "access" },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRY }
    )
}


export function verifyAccessToken(token) {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "access") throw new Error("Invalid token type");
    return payload;
}

export function generateRefreshToken() {
    return crypto.randomBytes(32).toString("hex"); // opaque, not JWT
    // Why opaque refresh token? Revoke by deleting DB row. JWT refresh is harder to invalidate.
}

export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}