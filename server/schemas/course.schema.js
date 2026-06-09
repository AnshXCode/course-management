import { z } from "zod";

export const courseBodySchema = z.object({
    code: z.string().min(1, {error: 'code is required'}),
    title: z.string().min(1, {error: 'title is required'}),
    description: z.string().optional(),
    capacity: z.coerce.number().int().positive().optional()
})