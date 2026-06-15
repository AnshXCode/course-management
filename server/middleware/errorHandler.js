import { addLogEntry } from "../lib/logStore.js";

const constraintMapping = {
    courses_code_key: "Course code already exists",
    students_email_key: "Student email already exists",
    students_username_key: "Student username already exists",
    enrollments_student_id_course_id_key: "Student is already enrolled in this course",
    users_email_key: "Email already exists",
};

export const errorReturnHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.code === "23505") {
        return res.status(409).json({
            error: constraintMapping[err.constraint] ?? "Resource already exists",
        });
    }

    if (err.code === "23503") {
        return res.status(400).json({ error: "Related record does not exist" });
    }

    return res.status(500).json({ error: "Something went wrong" });
};


export const errorHandler = (err, req, res, next) => {
    const statusCode = err.code === "23505" ? 409 :
        err.code === "23503" ? 400 : 500;

    const logPayload = {
        level: "error",
        reqId: req.id,
        method: req.method,
        path: req.url,
        statusCode,
        userId: req.user?.id ?? null,
        userEmail: req.user?.email ?? null,
        message: err.message,
        err: { message: err.message, code: err.code, constraint: err.constraint },
    }

    if (req.log) {
        req.log.error(logPayload, "request failed");
    } else {
        // This is a fallback if the request never got a Pino logger —
        //  e.g. an error before httpLogger runs, middleware order changes, 
        // or a test that skips that middleware.
        console.error(logPayload);
    }

    addLogEntry(logPayload);
    errorReturnHandler(err, req, res, next)

}