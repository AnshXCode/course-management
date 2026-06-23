import "./env.js";
import { Worker } from "bullmq";
import { getQueueConnection, isQueueEnabled } from "./lib/queueConnection.js";
import { sendEmailForVerification } from "./services/email.js";
import { logger } from "./lib/logger.js";
import {EMAIL_QUEUE_NAME} from "./queues/emailQueue.js";

if(!isQueueEnabled()){
    console.error("REDIS_URL required to run worker. Exiting.");
    process.exit(1);
}



// Consumer — listens ON queue named "email"
const worker = new Worker(
    EMAIL_QUEUE_NAME,
    //handler 
    async (job) => {
        if( job.name === 'send-verification'){
            const {email, token} = job.data;
            await sendEmailForVerification(email, token);
            logger.info({ jobId: job.id, email}, "Verification email sent")
        }
    },
    {connection: getQueueConnection()}
);

worker.on("failed", (job, err) => {
    logger.error({jobId: job?.id, err: err.message}, "Email job failed");
});

worker.on("completed", (job) => {
    logger.info({jobId: job.id}, "Email job completed");
});

logger.info("Email worker started");