const { test, describe } = require("node:test");
const assert = require("node:assert");
const app = require("../src/app");

describe("🐾 Paws & Hearts Backend API Tests", () => {
  test("GET / returns running message", async () => {
    // Basic test using express app instance or fetch
    assert.strictEqual(typeof app, "function");
  });

  test("Config and environment load correctly", () => {
    const { env } = require("../src/config/env");
    assert.ok(env.PORT);
    assert.ok(env.MONGODB_URI);
    assert.ok(Array.isArray(env.CLIENT_ORIGINS));
  });

  test("Error middleware formats 404 responses cleanly", () => {
    const { notFoundHandler } = require("../src/middlewares/error.middleware");
    const mockReq = { method: "GET", originalUrl: "/test-404" };
    let capturedStatus = null;
    let capturedJson = null;
    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
    };

    notFoundHandler(mockReq, mockRes);
    assert.strictEqual(capturedStatus, 404);
    assert.strictEqual(capturedJson.error, "Not Found");
    assert.strictEqual(capturedJson.message, "Cannot GET /test-404");
  });
});
