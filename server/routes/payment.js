import { Router } from "express";
import { checkoutSchema, confirmPaymentSchema } from "../schemas/payment.schema.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
    createCheckout,
    confirmPayment,
    getPaymentForUser,
} from "../services/paymentService.js";

const router = Router();

router.post("/checkout", validateBody(checkoutSchema), asyncHandler(async (req, res) => {
    const result = await createCheckout({
        courseId: req.body.courseId,
        userEmail: req.user.email,
        userId: req.user.id,
    });
    res.status(201).json({ data: result });
}));

router.post("/:id/confirm", validateBody(confirmPaymentSchema), asyncHandler(async (req, res) => {
    const result = await confirmPayment({
        paymentId: Number(req.params.id),
        userId: req.user.id,
        idempotencyKey: req.body.idempotencyKey,
    });
    res.status(200).json({ data: result });
}));

router.get("/:id", asyncHandler(async (req, res) => {
    const payment = await getPaymentForUser(Number(req.params.id), req.user.id);
    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json({ data: payment });
}));

export default router;
