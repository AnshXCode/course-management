// BullMQ needs a connection config - reuse REDIS_URL
export function getQueueConnection() {
    const url = process.env.REDIS_URL;
    if (!url) return null;
    return { url }; // BULLMQ accepts {url: "redis://..."}
}


export function isQueueEnabled() {
    if (process.env.NODE_ENV === "test") return false;
    return Boolean(process.env.REDIS_URL);
}

// Why separate from redis-cache.js? BullMQ manages its own connections.
//  Same Redis server, different client library.