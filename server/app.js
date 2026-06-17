import "./env.js";
import express from "express";
import cors from "cors";
import courseRouter from "./routes/courses.js";
import studentRouter from "./routes/students.js";
import enrollmentRouter from "./routes/enrollments.js";
import { router as dashboardRouter } from "./routes/v2/dashboard.js";
import assignmentRouter from "./routes/v2/assignments.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { assignRequestId, httpLogger } from "./middleware/requestLogger.js";
import logsRouter from "./routes/v2/logs.js";
import { createLoginLimiter, createGlobalLimiter } from "./middleware/rateLimit.js";

const loginLimiter = await createLoginLimiter();
const globalLimiter = await createGlobalLimiter();

const app = express();
app.use(express.json());

app.use(assignRequestId);
app.use(httpLogger);
// This middleware allows Cross-Origin Resource Sharing (CORS), enabling your server to accept requests from different origins (domains).
app.use(cors());

// app.use("/api/", globalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/", globalLimiter);
app.use("/api/courses", courseRouter);
app.use("/api/students", requireAuth, studentRouter);
app.use("/api/enrollments", requireAuth, enrollmentRouter);
app.use("/api/v2/dashboard", requireAuth, dashboardRouter);
app.use("/api/v2/assignments", requireAuth, assignmentRouter);
app.use("/api/v2/logs", requireAuth, logsRouter);
app.use("/api/auth", authRouter);
app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.use(errorHandler);

export default app;


// 2xx: Success Codes
// 3xx: Redirection Codes
// 4xx: Client Error Codes 
// 5xx: Server Error Codes