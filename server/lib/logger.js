import pino from "pino";

const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
    level: isTest ? "silent" : (process.env.LOG_LEVEL || "info"),
    // Pretty colors in dev terminal; raw json in production
    ...(process.env.NODE_ENV === "production" || isTest
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: { colorize: true, translateTime: "HH:MM:ss" },
            }
        }),
})