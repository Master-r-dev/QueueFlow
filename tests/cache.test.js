// tests/cache.test.ts
import cacheService from "../dist/services/cache.js";
//jest.mock('mongoose')

describe("CacheService", () => {
  beforeEach(() => {
    // Clear the cache before each test
    cacheService.cleanup();
  });
  afterAll(() => {
    // Clean up the timer to prevent it from leaking after tests finish
    cacheService.stop();
  });
  it("should set and get a value", () => {
    cacheService.set("test", "value", 5000);
    expect(cacheService.get("test")).toBe("value");
  });

  it("should return undefined for expired value", (done) => {
    cacheService.set("test", "value", 100); // Expires in 100ms
    setTimeout(() => {
      expect(cacheService.get("test")).toBeUndefined();
      done();
    }, 150);
  });

  it("should correctly report existence with has()", () => {
    cacheService.set("test", "value", 5000);
    expect(cacheService.has("test")).toBe(true);
    cacheService.cache.delete("test");
    expect(cacheService.has("test")).toBe(false);
  });
});
