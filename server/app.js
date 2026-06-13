import "./env.js";
import express from "express";
import cors from "cors";
import courseRouter from "./routes/courses.js";
import studentRouter from "./routes/students.js";
import enrollmentRouter from "./routes/enrollments.js";
import {router as dashboardRouter} from "./routes/v2/dashboard.js";
import assignmentRouter from "./routes/v2/assignments.js";
import authRouter from "./routes/auth.js";
import {requireAuth} from "./middleware/auth.js";
import {errorHandler} from "./middleware/errorHandler.js";
const app = express();
app.use(express.json());
// This middleware allows Cross-Origin Resource Sharing (CORS), enabling your server to accept requests from different origins (domains).
app.use(cors());

app.use("/api/courses", requireAuth, courseRouter);
app.use("/api/students", requireAuth, studentRouter);
app.use("/api/enrollments", requireAuth, enrollmentRouter);
app.use("/api/v2/dashboard", requireAuth, dashboardRouter);
app.use("/api/v2/assignments",  assignmentRouter);
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