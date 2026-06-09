import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api } from "./helpers/request.js";


describe("GET /api/courses without auth", () => {
    it("return 401", async () => {
        const res = await api().get("/api/courses");
        assert.equal(res.status, 401);
        assert.equal(res.body.error, "Please authenticate");
    })
})

describe("POST /api/auth/register", () => {
    it("returns 201 for a new email", async () => {
        const email = `test-${Date.now()}@example.com`;

        const res = await api().post("/api/auth/register")
            .send({ email, password: 'password' });
        assert.equal(res.status, 201);
        assert.ok(res.body.info);
    })
})