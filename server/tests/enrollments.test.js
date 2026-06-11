import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api } from "./helpers/request.js";
import { loginAsAdmin } from "./helpers/auth.js";

describe("POST /api/enrollments", () => {
    it("returns 400 if capacity is full", async () => {
        const token = await loginAsAdmin();
        const courseQuery = await api().post('/api/courses').set({ "Authorization": `Bearer ${token}` }).send({
            code: `${Date.now()}`,
            title: 'ABC',
            capacity: 1
        })
        const id = courseQuery.body.id;
        const studentOne = await api().post('/api/students').set({ 'Authorization': `Bearer ${token}` })
            .send({
                username: `user- ${Date.now()}`,
                email: `email${Date.now()}@dc`
            });
        const studentTwo = await api().post('/api/students').set({ 'Authorization': `Bearer ${token}` })
            .send({
                username: `user- ${Date.now()}`,
                email: `email${Date.now()}@dc`
            });

        const res1 = await api().post("/api/enrollments")
            .set({ "Authorization": `Bearer ${token}` })
            .send({
                courseId: id,
                studentId: studentOne.body.id
            })
        const res2 = await api().post("/api/enrollments")
            .set({ "Authorization": `Bearer ${token}` })
            .send({
                courseId: id,
                studentId: studentTwo.body.id
            })
            assert.equal(courseQuery.status, 201);
            assert.equal(studentOne.status, 201);
            assert.equal(studentTwo.status, 201);
            assert.equal(res1.status, 201);
            assert.equal(res2.status, 400);
            assert.equal(res2.body.error, "Course capacity full");

    })
})