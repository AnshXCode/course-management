import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api } from "./helpers/request.js";

describe("GET /api/health", () => {
    it("returns 200 and {ok: true}", async () => {
        const res = await api().get("/api/health");
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {ok: true});
    });
});