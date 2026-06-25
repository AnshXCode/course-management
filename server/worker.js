import "./env.js";
import { Worker } from "bullmq";
import { getQueueConnection, isQueueEnabled } from "./lib/queueConnection.js";
import { sendEmailForVerification } from "./services/email.js";
import { logger } from "./lib/logger.js";
import { EMAIL_QUEUE_NAME } from "./queues/emailQueue.js";
import { scheduleMaintenanceJobs } from "./jobs/scheduleMaintenanceJobs.js";
import { MAINTENANCE_QUEUE_NAME } from "./queues/maintenanceQueue.js";
import { cleanupExpiredTokensJob } from "./jobs/cleanupExpiredTokens.js";

if (!isQueueEnabled()) {
    console.error("REDIS_URL required to run email Worker. Exiting.");
    process.exit(1);
}

// 1. Register schedule on startup
await scheduleMaintenanceJobs();

// Consumer — listens ON queue named "email"
const emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    //handler 
    async (job) => {
        if (job.name === 'send-verification') {
            const { email, token } = job.data;
            await sendEmailForVerification(email, token);
            logger.info({ jobId: job.id, email }, "Verification email sent")
        }
    },
    { connection: getQueueConnection() }
);


const maintenanceWorker = new Worker(
    MAINTENANCE_QUEUE_NAME,
    async (job) => {
        if (job.name === "cleanup-expired-tokens") {
            return cleanupExpiredTokensJob();
        }
    },
    { connection: getQueueConnection() }
)

emailWorker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, "Email job failed");
});

emailWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Email job completed");
});


maintenanceWorker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, "Maintenance job failed");
})

maintenanceWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Maintenance job completed");
});


logger.info("Email worker started");
logger.info("Maintenance worker started");