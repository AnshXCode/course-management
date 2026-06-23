import pool from "./db/pool.js";
import { getClient, isRedisConfigured } from "./redis-cache.js";

export async function runHealthCheck() {
    const checks = {};
    let ok = true;

    try {
        await pool.query("SELECT 1");
        checks.db = {
            status: "up"
        }
    } catch (e) {
        checks.db = {
            status: "down", error: e.message
        };
        ok = false
    }
    if (!isRedisConfigured()) {
        checks.redis = {
            status: "skipped"
        }
    }else {
        try {
            const r = await getClient();
            await r.ping();
            checks.redis = {
                status: "up"
            };
        }catch(e){
            checks.redis = {
                status: "down", error: e.message
            }
            ok = false;
        }
        
    }

    return {ok, checks};

}