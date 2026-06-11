const store = new Map();

/**
 * @param {string} key
 * @returns {unknown | undefined}
 */
export function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
    }

    return entry.data;
}

/**
 * @param {string} key
 * @param {unknown} data
 * @param {number} [ttlSeconds]
 */
export function set(key, data, ttlSeconds) {
    const entry = { data };
    if (ttlSeconds) {
        entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    store.set(key, entry);
}

/** @param {string} key */
export function del(key) {
    store.delete(key);
}

/** Clears all entries — useful in tests. */
export function clear() {
    store.clear();
}
