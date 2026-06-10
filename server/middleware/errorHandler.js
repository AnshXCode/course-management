const constraintMapping = {
    courses_code_key: "Course code already exists",
    students_email_key: "Student email already exists",
    students_username_key: "Student username already exists",
    enrollments_student_id_course_id_key: "Student is already enrolled in this course",
    users_email_key: "Email already exists",
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);

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
