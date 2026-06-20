import { api } from "./request.js";

export async function loginAsAdmin() {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in server/.env"
        );
    }

    const res = await api()
        .post("/api/auth/login")
        .send({ email, password });

    if (res.status !== 200) {
        throw new Error(
            `Admin login failed (${res.status}): ${JSON.stringify(res.body)}`
        );
    }

    if (!res.body.accessToken) {
        throw new Error("Login succeeded but no token was returned");
    }

    return res.body.token;
}
