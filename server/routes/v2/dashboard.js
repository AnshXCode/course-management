import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";


const router = Router();

router.get("/", asyncHandler(async (req, res) => {

    const [courses, students, enrollments, assignments] = await Promise.all([
        prisma.courses.count(),
        prisma.students.count(),
        prisma.enrollments.count(),
        prisma.assignments.count()
    ]);

    const coursesWithCounts = await prisma.courses.findMany({
        select: {
            id: true,
            code: true,
            title: true,
            capacity: true,
            _count: { select: { enrollments: true } },
        },
    });

    return res.status(200).json({ data: { courses, students, enrollments, assignments, coursesWithCounts } });
}));


export { router };