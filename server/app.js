import express from "express";
import cors from "cors";
import courseRouter from "./routes/courses.js";
import studentRouter from "./routes/students.js";
import enrollmentRouter from "./routes/enrollments.js";
import authRouter from "./routes/auth.js";
import {requireAuth} from "./middleware/auth.js";
const app = express();
// This middleware allows Cross-Origin Resource Sharing (CORS), enabling your server to accept requests from different origins (domains).
app.use(cors());

// This middleware enables parsing of JSON-formatted request bodies.
// It is commonly used to handle POST and PUT requests
// where the request body contains JSON data.
// Yes, this middleware parses incoming JSON requests and converts the JSON payload into a JavaScript object,
// which is then available under req.body. For example, if a client sends '{"name": "Alice"}', req.body will be { name: "Alice" }.
app.use(express.json());

app.use("/api/courses", requireAuth, courseRouter);
app.use("/api/students", requireAuth, studentRouter);
app.use("/api/enrollments", requireAuth, enrollmentRouter);
app.use("/api/auth", authRouter);

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

export default app;


// 2xx: Success Codes
// 3xx: Redirection Codes
// 4xx: Client Error Codes 
// 5xx: Server Error Codes