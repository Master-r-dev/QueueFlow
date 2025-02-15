// Explanation: This service is used to cache data in memory for a certain amount of time.
//It is used to reduce the number of requests to the database and to improve the performance of the application.
// The cache is implemented as a singleton class with a Map object to store the cached data.
//  The set method is used to add data to the cache with an optional time-to-live (TTL) parameter,
//  which specifies how long the data should be kept in the cache.
//  The get method is used to retrieve data from the cache,
//  and the has method is used to check if data is present in the cache.
//  The cleanup method is used to remove expired entries from the cache periodically.
//  The cache is cleaned up every minute to ensure that expired data is removed promptly.
//  The cache service is used in other parts of the application to cache data and improve performance.
interface CacheEntry {
  value: any;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string | number, CacheEntry> = new Map();
  private defaultTTL: number = 3 * 60 * 1000; // 3 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically clean up expired entries every minute and unref the timer
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    this.cleanupInterval.unref(); // This ensures the timer doesn't keep the process alive
  }

  set(key: string | number, value: any, ttl: number = this.defaultTTL): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string | number): any | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return entry.value;
      } else {
        this.cache.delete(key);
      }
    }
    return undefined;
  }

  has(key: string | number): boolean {
    return this.get(key) !== undefined;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Optional: add a method to stop the interval if needed (for tests or graceful shutdown)
  stop() {
    clearInterval(this.cleanupInterval);
  }
}

const cacheService = new CacheService();
export default cacheService;
