import { Queue } from "bullmq";
import { getQueueConnection, isQueueEnabled } from "../lib/queueConnection.js";

export const MAINTENANCE_QUEUE_NAME = "maintenance";
export const CLEANUP_EXPIRED_TOKENS_JOB = "cleanup-expired-tokens";

/** Default: daily at 03:00 UTC. Override with TOKEN_CLEANUP_CRON (cron syntax). */
const DEFAULT_CLEANUP_CRON = "0 3 * * *";

let queue = null;

function getQueue() {
    if (!isQueueEnabled()) return null;
    if (!queue) {
        queue = new Queue(MAINTENANCE_QUEUE_NAME, {
            connection: getQueueConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
    }
    return queue;
}

/** Register repeatable cleanup job once (idempotent across worker restarts). */
export async function scheduleMaintenanceJobs() {
    const q = getQueue();
    if (!q) return;

    const pattern = process.env.TOKEN_CLEANUP_CRON ?? DEFAULT_CLEANUP_CRON;
    const existing = await q.getRepeatableJobs();
    const alreadyScheduled = existing.some(
        (job) => job.name === CLEANUP_EXPIRED_TOKENS_JOB
    );

    if (alreadyScheduled) return;

    await q.add(
        CLEANUP_EXPIRED_TOKENS_JOB,
        {},
        { repeat: { pattern } }
    );
}

export async function closeMaintenanceQueue() {
    if (queue) {
        await queue.close();
        queue = null;
    }
}
