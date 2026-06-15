import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';
import { addLogEntry } from "../lib/logStore.js";


// Runs before pino-http - sets ID on request + response header
export function assignRequestId(req, res, next) {
    const reqId = req.headers["x-request-id"] || randomUUID();
    req.id = reqId;
    res.setHeader("X-Request-Id", reqId);
    next();
}

// This wraps your shared Pino logger (../lib/logger.js) and logs one line per HTTP request when the response finishes.
export const httpLogger = pinoHttp({
    logger,
    // Tells pino-http not to generate its own ID — use req.id from assignRequestId.
    genReqId: (req) => req.id,

    // Attach user + API info to every log line (filled after auth runs)
    customProps: (req, res) => ({
        userId: req.user?.id ?? null,
        userEmail: req.user?.email ?? null,
        userRole: req.user?.role ?? null,
        method: req.method,
        path: req.url,
        statusCode: res.statusCode
    }),

    // 4xx -> warn, 5xx -> error (so they stand out)
    customLogLevel(req, res, err) {
        // errorHandler already logged thrown errors — avoid duplicate stdout lines
        if (req._errorLogged) return "silent";
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },

    customErrorMessage() {
        return "request failed";
    },

    // Push 4xx/5xx into the in-memory store for the GUI
    customSuccessMessage(req, res) {
        if (res.statusCode >= 400) {
            addLogEntry({
                level: res.statusCode >= 500 ? "error" : "warn",
                reqId: req.id,
                method: req.method,
                path: req.url,
                statusCode: res.statusCode,
                userId: req.user?.id ?? null,
                userEmail: req.user?.email ?? null,
                message: `${req.method} ${req.url} -> ${res.statusCode}`,
            })
        }
        return "request completed";
    },
})
