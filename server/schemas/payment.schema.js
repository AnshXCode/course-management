import { z } from "zod";

export const checkoutSchema = z.object({
    courseId: z.coerce.number().int().positive()
});

export const confirmPaymentSchema = z.object({
    idempotencyKey: z.uuid().optional()
})