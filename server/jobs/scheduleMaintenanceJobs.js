import { getMaintenanceQueue } from "../queues/maintenanceQueue.js";
import { logger } from "../lib/logger.js";

export async function scheduleMaintenanceJobs() {
    const queue = getMaintenanceQueue();
    if (!queue) return;

    //BullMQ repeatable job - cron like schedule
    await queue.add(
        "cleanup-expired-tokens",
        {},
        {
            // repeat: { pattern: "*/1 * * * *" }, //every 1 min (for testing)
            repeat: { pattern: "0 3 * * *" }, //every day at 3:00 AM UTC
            jobId: "cleanup-expired-tokens-daily", // idempotent - won't duplicate schedule
        }
    );

    logger.info("Maintenance job scheduled");
}

// Idempotent means you can run the same operation more than once and still get the same result — as if you only ran it once.

// scheduleMaintenanceJobs() might run every time the worker starts (or on deploy/restart).

// Without a fixed jobId, BullMQ could register the same daily cron job again and again,
//  so you’d end up with multiple “cleanup expired tokens at 3 AM” schedules.

// With a stable jobId like "cleanup-expired-tokens-daily", BullMQ treats it as the same job. 
// Calling queue.add(...) again doesn’t create a duplicate schedule — it updates or leaves the existing one.
