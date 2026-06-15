import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { getLogEntries, MAX_ENTRIES } from "../../lib/logStore.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, asyncHandler(async (req, res) => {
    const parsed = Number(req.query.limit);
    const limit = Number.isFinite(parsed) && parsed > 0
        ? Math.min(Math.floor(parsed), MAX_ENTRIES)
        : 50;
    const result = getLogEntries({ limit });
    return res.status(200).json({ data: result });
}));

export default router;
