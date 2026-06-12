import { LRUCache } from "lru-cache";

const store = new LRUCache({
    max: 100,
});

/**
 * @param {string} key
 * @returns {unknown | undefined}
 */
export function get(key) {
    // LRUCache from 'lru-cache' handles automatic TTL expiry internally.
    // If the key is expired, .get(key) returns undefined and may clean the stale entry.
    return store.get(key);
}

/**
 * @param {string} key
 * @param {unknown} data
 * @param {number} [ttlSeconds]
 */
export function set(key, data, ttlSeconds) {
    if (ttlSeconds) {
        store.set(key, data, { ttl: ttlSeconds * 1000 });
        return;
    }
    store.set(key, data);
}

/** @param {string} key */
export function del(key) {
    store.delete(key);
}

/** Clears all entries — useful in tests. */
export function clear() {
    store.clear();
}
