import request from "supertest";
import app from "../../app.js";

// Returns supertest wired to your Express app (no server.listen needed) 
export function api() {
    return request(app);
}