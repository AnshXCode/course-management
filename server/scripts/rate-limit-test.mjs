const API_BASE = process.env.API_BASE || "http://localhost:5001";
const LOGIN_URL = `${API_BASE}/api/auth/login`;
const TOTAL = Number(process.env.TOTAL_REQUESTS) || 120;

const body = JSON.stringify({
    email: "wrong@example.com",
    password: "wrongpassword",
});

async function hitLogin(i) {
    const res = await fetch(LOGIN_URL, 
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    }
);
    const remaining = res.headers.get("ratelimit-remaining");
    const limit = res.headers.get("ratelimit-limit");
    return { i, status: res.status, remaining, limit };
}

console.log(`Sending ${TOTAL} login requests to ${LOGIN_URL}\n`);

const results = await Promise.all(
    Array.from({ length: TOTAL }, (_, i) => hitLogin(i + 1))
);

const counts = {};

for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
    console.log(
        `#${String(r.i).padStart(2)} → ${r.status}` +
        (r.remaining != null ? ` (remaining: ${r.remaining}/${r.limit})` : "")
    );
}

console.log("\nSummary:", counts);
console.log(counts[429] > 0 ? "✅ Rate limiting is working" : "⚠️ No 429s — check limiter is mounted and Redis is up");