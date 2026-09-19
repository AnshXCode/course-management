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
import paymentRouter from "./routes/payment.js";
import { createLoginLimiter, createGlobalLimiter } from "./middleware/rateLimit.js";
import helmet from "helmet";
import {runHealthCheck} from "./health.js";
const loginLimiter = await createLoginLimiter();
const globalLimiter = await createGlobalLimiter();


const app = express();
app.use(express.json());
// Helmet sets secure HTTP response headers on every response
//  so browsers handle your API more safely (e.g. no MIME sniffing, no iframe embedding).
app.use(helmet())
app.use(assignRequestId);
app.use(httpLogger);
// This middleware allows Cross-Origin Resource Sharing (CORS), enabling your server to accept requests from different origins (domains).
app.use(cors());

// app.use("/api/", globalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/refresh", loginLimiter);

app.get("/api/health", async(req, res) => {
    const result = await runHealthCheck();
    res.status(result.ok ? 200 : 503).json(result);
});

app.use("/api/", globalLimiter);
app.use("/api/courses", requireAuth, courseRouter);
app.use("/api/students", requireAuth, studentRouter);
app.use("/api/enrollments", requireAuth, enrollmentRouter);
app.use("/api/payments", requireAuth, paymentRouter);
app.use("/api/v2/dashboard", requireAuth, dashboardRouter);
app.use("/api/v2/assignments", requireAuth, assignmentRouter);
app.use("/api/v2/logs", requireAuth, logsRouter);
app.use("/api/auth", authRouter);


app.use(errorHandler);

export default app;


// 2xx: Success Codes
// 3xx: Redirection Codes
// 4xx: Client Error Codes 
// 5xx: Server Error Codes