import {z} from "zod";

export const assignmentCreateSchema = z.object({
    course_id: z.coerce.number().int().positive(),
    title: z.string().min(1),
    description: z.string().optional(),
    due_date: z.coerce.date(),
    max_points: z.coerce.number().int().positive().optional(),
});

export const assignmentUpdateSchema = assignmentCreateSchema
.omit({course_id: true}) // usually don't change course on update
.partial()
// .refine is a Zod method that adds an extra custom validation step to a schema. 
// It receives a function that takes the parsed data and should return true if valid (or false if invalid), 
// plus a config object with a message shown on failure.
// Here, we ensure at least one field is present in the update (i.e., the body isn't empty):
.refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required to update" }
)