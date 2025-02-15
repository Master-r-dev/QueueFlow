import { RateLimiter, Unit } from "redis-sliding-rate-limiter";
import type { Request, Response } from "express";
import client from "../services/redis.js";

function pickRateForUrl(url: string, method: string): number {
  if (process.env.NODE_ENV === "production") {
    switch (url) {
      // endpoints
      case "/api/process/process-ids":
        if (method == "POST") return 5;
        return 0;
      default:
        // better to replace with 0 for non existing routes at all
        // currently, it will show error for non-existing route once
        return 1;
    }
  } else {
    return 500;
  }
}

type LimiterResponse = {
  remaining: number;
  firstExpireAtMs: number;
  windowExpireAtMs: number;
};

const rL = {
  // Define limiters that will be evaluated from this middleware for each request
  limiters: [
    {
      limiter: new RateLimiter({
        client: client,
        window: {
          unit: Unit.MINUTE,
          size: 2,
          subdivisionUnit: Unit.SECOND, // Defines with which precision elements would expire in the current window
        },
        limit: 80, // 40 req per minute, default
      }),
      overrideKey: true,
      overrideLimit: true,
      key: "ttt",
      errorMessage: "[Please, stop] Too many requests",
    },
  ],

  // Error status code
  errorStatusCode: 429,

  // Compute Redis key from request and limiter objects.
  overrideKeyFn: (req: Request) => {
    return req.originalUrl + req.ip;
  },

  // Enable/disable setting headers on response
  setHeaders: true,

  // Custom function to set headers on response object (otherwise default headers will be used)
  setHeadersFn: (
    req: Request,
    res: Response,
    limiter: any,
    limiterResponse: LimiterResponse
  ) => {
    const { remaining, firstExpireAtMs, windowExpireAtMs } = limiterResponse;
    res.set("remainingR", "" + remaining);
    res.set("firstExpireR", "" + firstExpireAtMs);
    res.set("resetL", "" + windowExpireAtMs);
  },

  // Override limit if enabled.
  overrideLimitFn: (req: Request, limiter: any) => {
    // Must return a positive integer!  Calmly, AL_S
    return pickRateForUrl(req.originalUrl, req.method);
  },

  // Skip (whitelist) requests. Should return true if the request must be skipped, false otherwise
  skip: (req: Request) => {
    return false;
  },

  // Function called when a request is throttled (not allowed)
  onThrottleRequest: (req: Request, res: Response) => {
    return res.status(429).send(` ( >:| ) Too many requests `);
  },
};

export default rL;
