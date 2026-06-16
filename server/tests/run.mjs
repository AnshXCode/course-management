// Custom test runner — runs all *.test.js files, then closes open handles so the process exits.
import { run } from "node:test";
import { spec } from "node:test/reporters";
import { globSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../db/pool.js";
import { disconnectRedis } from "../redis-cache.js";
import { prisma } from "../lib/prisma.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = globSync(join(__dirname, "**/*.test.js")).sort();

let failed = 0;

const stream = run({ files, concurrency: 1 });

stream.on("test:fail", () => {
    failed++;
});

stream.on("end", async () => {
    await Promise.allSettled([
        pool.end(),
        disconnectRedis(),
        prisma.$disconnect(),
    ]);
    process.exit(failed > 0 ? 1 : 0);
});

stream.on("error", (err) => {
    console.error("Test runner error:", err);
    process.exit(1);
});

stream.compose(spec).pipe(process.stdout);
