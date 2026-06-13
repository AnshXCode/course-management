// User → Load balancer → Server A or Server B
//                               ↓
//                          Shared Redis
//                          enrollments:list

import { createClient } from "redis";

/** @type {import("redis").RedisClientType | null} */
let client = null;

export function isRedisConfigured() {
    return Boolean(process.env.REDIS_URL);
}

export async function initRedis() {
    if (!isRedisConfigured()) return;

    if (client?.isOpen) return;

    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => {
        console.error("Redis client error:", err.message);
    });
    await client.connect();
}

async function getClient() {
    if (!isRedisConfigured()) {
        return null;
    }
    if (!client?.isOpen) {
        await initRedis();
    }
    return client;
}

/**
 * @param {string} key
 * @returns {Promise<unknown | undefined>}
 */
export async function get(key) {
    const redis = await getClient();
    if (!redis) return undefined;
    const raw = await redis.get(key);
    if (!raw) return undefined;
    return JSON.parse(raw);
}

/**
 * @param {string} key
 * @param {unknown} data
 * @param {number} [ttlSeconds]
 */
export async function set(key, data, ttlSeconds) {
    const redis = await getClient();
    if (!redis) return;
    const serialized = JSON.stringify(data);
    if (ttlSeconds) {
        await redis.setEx(key, ttlSeconds, serialized);
        return;
    }
    await redis.set(key, serialized);
}

/** @param {string} key */
export async function del(key) {
    const redis = await getClient();
    if (!redis) return;
    await redis.del(key);
}

export async function disconnectRedis() {
    if (client?.isOpen) {
        await client.quit();
    }
    client = null;
}
