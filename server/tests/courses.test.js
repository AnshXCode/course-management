import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api } from "./helpers/request.js";
import { loginAsAdmin } from "./helpers/auth.js";

describe("GET /api/courses", () => {
    it("returns 200 and a course list for authenticated admin", async () => {
        const token = await loginAsAdmin();

        const res = await api()
            .get("/api/courses")
            .set("Authorization", `Bearer ${token}`);

        assert.equal(
            res.status,
            200,
            `GET courses failed: ${JSON.stringify(res.body)}`
        );
        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body.data));
        assert.ok(res.body.pagination);
        assert.equal(typeof res.body.pagination.total, "number");
    });
});

describe("POST /api/courses", () => {
    it("returns 201 when admin creates a course", async () => {
        const token = await loginAsAdmin();
        const code = `TEST-${Date.now()}`;

        const res = await api()
            .post("/api/courses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                code,
                title: "Test Course",
                description: "Created by automated test",
                capacity: 25,
            });

        assert.equal(
            res.status,
            201,
            `POST course failed: ${JSON.stringify(res.body)}`
        );
        assert.equal(res.body.code, code);
        assert.equal(res.body.title, "Test Course");
        assert.ok(res.body.id);
    });
});
