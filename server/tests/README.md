import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api } from "./helpers/request.js";

describe("WHAT YOU ARE TESTING", () => {
  it("EXPECTED BEHAVIOR", async () => {
    const res = await api()
      .METHOD("/api/path")
      .set("Authorization", "Bearer TOKEN")  // only when needed
      .send({ key: "value" });               // only for POST/PUT

    assert.equal(res.status, EXPECTED_CODE);
    assert.equal(res.body.someField, "expected value");
  });
});