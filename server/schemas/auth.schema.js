import { z } from "zod";

const requiredEmail = z
    .string({ error: "email is required" })
    .min(1, { message: "email is required" })
    .pipe(z.email({ error: "Invalid email address" }));

export const loginSchema = z.object({
    email: requiredEmail,
    password: z.string({ error: "password is required" }).min(4, { message: "password must be at least 4 characters" })
});

export const emailSchema = z.object({
    email: requiredEmail
})
