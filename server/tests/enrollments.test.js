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

    });

    it("allows only one enrollment when two requests race at capacity", async () => {
        const token = await loginAsAdmin();
        const courseQuery = await api().post("/api/courses").set({ Authorization: `Bearer ${token}` }).send({
            code: `${Date.now()}-race`,
            title: "Race Course",
            capacity: 1,
        });
        const studentOne = await api().post("/api/students").set({ Authorization: `Bearer ${token}` }).send({
            username: `race-user-1-${Date.now()}`,
            email: `race1-${Date.now()}@example.com`,
        });
        const studentTwo = await api().post("/api/students").set({ Authorization: `Bearer ${token}` }).send({
            username: `race-user-2-${Date.now()}`,
            email: `race2-${Date.now()}@example.com`,
        });

        const [res1, res2] = await Promise.all([
            api().post("/api/enrollments").set({ Authorization: `Bearer ${token}` }).send({
                courseId: courseQuery.body.id,
                studentId: studentOne.body.id,
            }),
            api().post("/api/enrollments").set({ Authorization: `Bearer ${token}` }).send({
                courseId: courseQuery.body.id,
                studentId: studentTwo.body.id,
            }),
        ]);

        assert.equal(courseQuery.status, 201);
        assert.equal(studentOne.status, 201);
        assert.equal(studentTwo.status, 201);
        const statuses = [res1.status, res2.status].sort();
        assert.deepEqual(statuses, [201, 400]);
        const errors = [res1, res2].filter((r) => r.status === 400);
        assert.equal(errors.length, 1);
        assert.equal(errors[0].body.error, "Course capacity full");
    });
})