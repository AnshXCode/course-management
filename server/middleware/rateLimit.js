import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getClient } from "../redis-cache.js";

async function createStore() {
    const client = await getClient();
    if(!client) return null;
    return new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'rl:', // keys like rl:login:127.0.0.1
    });
}


// Factory - call once at startup (see Phase 4)
export async function createLoginLimiter() {
    const store = await createStore();

    return rateLimit({
        windowMs: 1 * 6 * 1000,  // 6 sec
        max: 5,    // 5 login attempts per IP per window
        standardHeaders: true, // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
        legacyHeaders: false,
        store,
        message: { error: "Too many login attempts. Try again later." },
        // Skip in tests so CI doesn't flake
        skip: () => process.env.NODE_ENV === "test"
    })
}


export async function createGlobalLimiter() {
    const store = await createStore();

    return rateLimit({
        windowMs: 1 * 6 * 1000, // 6 sec
        max: 100,            // 100 requests/min per IP
        standardHeaders: true,
        legacyHeaders: false,
        store,
        message: { error: "Too many requests. Slow down." },
        skip: () => process.env.NODE_ENV === "test",
    })

}