import request from "supertest";
import { jest } from "@jest/globals";
import app from "../dist/app.js";
import idQueue from "../dist/services/queue.js";
import { closeRedisConnections } from "../dist/services/redis.js";
// Mock the Bull queue so that actual Redis connections aren’t used during tests.
/* jest.mock("../src/services/queue.js", () => ({
  __esModule: true,
  default: { add: jest.fn().mockResolvedValue({}) },
})); */

describe("POST /api/process/process-ids", () => {
  // Create a spy on idQueue.add before the tests run
  beforeAll(() => {
    jest.spyOn(idQueue, "add");
  });
  afterAll(async () => {
    await idQueue.close();
    await closeRedisConnections();
  });
  it("should return 400 if ids is not an array", async () => {
    const res = await request(app)
      .post("/api/process/process-ids")
      .send({ ids: "not an array" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", '"ids" must be an array');
    expect(res.body).toHaveProperty(
      "stack",
      'ValidationError: "ids" must be an array'
    );
  });

  it("should enqueue jobs and return success message", async () => {
    const ids = ["x12345", "6b7890"];
    const res = await request(app)
      .post("/api/process/process-ids")
      .send({ ids });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Jobs enqueued");
    expect(res.body).toHaveProperty("count", ids.length);
    expect(idQueue.add).toHaveBeenCalledTimes(ids.length);
  });
});
