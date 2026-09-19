import pool from "../db/pool.js";
import { del } from "../redis-cache.js";
import { HttpError } from "../lib/HttpError.js";

const ENROLLMENTS_LIST_KEY = "enrollments:list";

export async function createCheckout({ courseId, userEmail, userId }) {
    const courseQuery = await pool.query(
        "SELECT id, title, price_cents, capacity FROM courses WHERE id = $1",
        [courseId]
    );
    if (courseQuery.rows.length === 0) {
        throw new HttpError(404, "Given course does not exist");
    }

    const { price_cents } = courseQuery.rows[0];
    if (price_cents <= 0) {
        throw new HttpError(400, "Course is free, no payment required");
    }

    const studentQuery = await pool.query(
        "SELECT id, username, email FROM students WHERE email = $1",
        [userEmail]
    );
    if (studentQuery.rows.length === 0) {
        throw new HttpError(400, "No student profile exists for your account email");
    }
    const student = studentQuery.rows[0];

    const enrollmentQuery = await pool.query(
        "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
        [student.id, courseId]
    );
    if (enrollmentQuery.rows.length > 0) {
        throw new HttpError(409, "Student is already enrolled in this course");
    }

    const paymentQuery = await pool.query(
        `INSERT INTO payments (user_id, course_id, student_id, amount_cents, status, provider)
         VALUES ($1, $2, $3, $4, 'pending', 'mock')
         RETURNING id, status, amount_cents, course_id`,
        [userId, courseId, student.id, price_cents]
    );

    const payment = paymentQuery.rows[0];

    return {
        id: payment.id,
        status: payment.status,
        amountCents: payment.amount_cents,
        courseId: payment.course_id,
    };
}

export async function getPaymentForUser(paymentId, userId) {
    const result = await pool.query(
        `SELECT id, user_id, course_id, student_id, amount_cents, currency, status,
                provider, enrollment_id, created_at, confirmed_at
         FROM payments
         WHERE id = $1 AND user_id = $2`,
        [paymentId, userId]
    );
    return result.rows[0] ?? null;
}

async function getEnrollmentById(enrollmentId) {
    const result = await pool.query(
        "SELECT id, student_id, course_id, student_name, course_name, enrolled_at FROM enrollments WHERE id = $1",
        [enrollmentId]
    );
    return result.rows[0] ?? null;
}

export async function confirmPayment({ paymentId, userId, idempotencyKey }) {
    const paymentQuery = await pool.query(
        `SELECT p.*, s.username AS student_name, c.title AS course_name
         FROM payments p
         JOIN students s ON s.id = p.student_id
         JOIN courses c ON c.id = p.course_id
         WHERE p.id = $1 AND p.user_id = $2`,
        [paymentId, userId]
    );
    if (paymentQuery.rows.length === 0) {
        throw new HttpError(404, "Payment not found");
    }

    const payment = paymentQuery.rows[0];

    if (payment.status === "succeeded") {
        const enrollment = payment.enrollment_id
            ? await getEnrollmentById(payment.enrollment_id)
            : null;
        return { payment, enrollment, alreadyConfirmed: true };
    }

    if (payment.status !== "pending") {
        throw new HttpError(400, "Payment cannot be confirmed");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const courseResult = await client.query(
            "SELECT capacity FROM courses WHERE id = $1 FOR UPDATE",
            [payment.course_id]
        );
        if (courseResult.rows.length === 0) {
            throw new HttpError(404, "Course not found");
        }

        const countResult = await client.query(
            "SELECT COUNT(*)::int AS count FROM enrollments WHERE course_id = $1",
            [payment.course_id]
        );
        if (countResult.rows[0].count >= courseResult.rows[0].capacity) {
            throw new HttpError(400, "Course capacity full");
        }

        const enrollResult = await client.query(
            `INSERT INTO enrollments (student_id, course_id, student_name, course_name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, student_id, course_id, student_name, course_name, enrolled_at`,
            [payment.student_id, payment.course_id, payment.student_name, payment.course_name]
        );


        // Why an idempotency key at all?
        // Problem: Confirm can be called more than once:
        // User double-clicks “Confirm payment”
        // Network timeout → client retries same request
        // Mobile app auto-retries POST
        // our strongest idempotency guard is actually:

        // status === 'succeeded' → return early
        // UPDATE ... WHERE status = 'pending' → only one confirm wins
        // The idempotency key is extra safety + realism for a mock payment that maps cleanly to Stripe later (Idempotency-Key header). Confirm works without sending one — it’s optional in your schema.
        const updatedPayment = await client.query(
            `UPDATE payments
             SET status = 'succeeded',
                 enrollment_id = $1,
                 confirmed_at = NOW(),
                 idempotency_key = COALESCE($2, idempotency_key)
             WHERE id = $3 AND status = 'pending'
             RETURNING id, user_id, course_id, student_id, amount_cents, currency, status,
                       provider, enrollment_id, created_at, confirmed_at`,
            [enrollResult.rows[0].id, idempotencyKey ?? null, paymentId]
        );

        if (updatedPayment.rows.length === 0) {
            throw new HttpError(409, "Payment already processed");
        }

        await client.query("COMMIT");
        await del(ENROLLMENTS_LIST_KEY);

        return {
            payment: updatedPayment.rows[0],
            enrollment: enrollResult.rows[0],
            alreadyConfirmed: false,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
