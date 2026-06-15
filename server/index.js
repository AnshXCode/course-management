// Entry point: starts the HTTP server (npm run dev / npm start).
//
// app.js defines the Express app (routes, middleware) and exports it without listening.
// index.js calls app.listen() so the app can be imported elsewhere—e.g. supertest in
// tests—without binding a port or logging "Server running".
//
// Separation of concerns:
//   app.js   → what the API is (configurable, testable)
//   index.js → run the API as a live process
import { logger } from "./lib/logger.js";
import app from "./app.js";
import { initRedis } from "./redis-cache.js";

const PORT = process.env.PORT || 5001;

async function start() {
    if (process.env.REDIS_URL) {
        await initRedis();
        console.log("Redis connected");
    }

    app.listen(PORT, () => {
        logger.info({ port: PORT }, "Server running");
    });
}

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
