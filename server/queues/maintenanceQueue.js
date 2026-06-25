import { Queue } from "bullmq";
import { getQueueConnection, isQueueEnabled } from "../lib/queueConnection.js";

export const MAINTENANCE_QUEUE_NAME = "maintenance";

let queue = null;

export function getMaintenanceQueue() {
    if(!isQueueEnabled()) return null;
    if(!queue) {
        queue = new Queue(MAINTENANCE_QUEUE_NAME, {
            connection: getQueueConnection(),
        });
    }
    return queue;
}