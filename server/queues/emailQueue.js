import { Queue } from "bullmq";
import { getQueueConnection, isQueueEnabled } from "../lib/queueConnection.js";
import { sendEmailForVerification } from "../services/email.js";

export const EMAIL_QUEUE_NAME = "email";

let queue = null;

function getQueue() {
    if (!isQueueEnabled()) return null;
    if (!queue) {
        // Producer — jobs go INTO queue named "email"
        queue = new Queue(EMAIL_QUEUE_NAME, {
            connection: getQueueConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 },
                removeOnComplete: true,
                removeOnFail: false
            }
        })
    }
    return queue;
}

// Producer - called from auth routes

export async function enqueueVerificationEmail(email, token) {
    const q = getQueue();

    // Fallback: no Redis / tests -> send inline (keeps CI + local without worker working)
    if (!q) {
        await sendEmailForVerification(email, token);
        return;
    }
    await q.add("send-verification", { email, token });

}

