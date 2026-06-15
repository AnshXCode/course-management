import { randomUUID } from "crypto";

export const MAX_ENTRIES = 200;
const entries = [];

export function addLogEntry(entry) {
    entries.unshift({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        ...entry,
    });
    if (entries.length > MAX_ENTRIES) entries.pop();
}

export function getLogEntries({ limit = 50 } = {}) {
    return entries.slice(0, limit);
}
