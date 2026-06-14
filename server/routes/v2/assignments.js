import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { prisma } from "../../lib/prisma.js";
import { validateBody } from "../../middleware/validate.js";
import { assignmentCreateSchema, assignmentUpdateSchema } from "../../schemas/assignments.schema.js";
const router = Router();

router.get("/", asyncHandler(async (req, res) => {
    const result = await prisma.assignments.findMany();
    return res.status(200).json(result);
}))

router.post("/", validateBody(assignmentCreateSchema), asyncHandler(async (req, res) => {
    let { course_id, title, description, due_date, max_points, created_at } = req.body;
    const result = await prisma.assignments.create({
        data: {
            course_id: Number(course_id),
            title: title,
            description: description,
            due_date: new Date(due_date),
            max_points: max_points
        }
    });
    return res.status(201).json(result);
}));



router.put("/:id", validateBody(assignmentUpdateSchema), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateBody = req.body;
    if (updateBody.due_date) {
        updateBody.due_date = new Date(updateBody.due_date);
    }
    const result = await prisma.assignments.update({
        where: {
            id: Number(id)
        },
        data: updateBody
    });
    return res.status(200).json(result);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await prisma.assignments.delete({
        where: {
            id: Number(id)
        }
    });
    return res.status(200).json(result);
}))


export default router;