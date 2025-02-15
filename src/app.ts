import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { createExpressMiddleware } from "redis-sliding-rate-limiter";
import rL from "./utils/rateLimiter.js";
import { notFound, errorHandler } from "./middlewares/error.js";

import processRoutes from "./routes/processRoutes.js";

const app = express();

app.use(express.json());
// Set security headers
app.use(
  helmet({
    xDownloadOptions: false,
  })
);

// Prevent http param pollution
app.use(hpp());
let origins = [];
if (process.env.NODE_ENV === "production") {
  origins.push(process.env.CLIENT_ORIGIN || "http://localhost:3000");
} else {
  origins.push(process.env.CLIENT_ORIGIN_TEST || "http://localhost:3000");
}
const corsOptions = {
  origin: origins,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 3600,
};
app.use(cors(corsOptions));

// Helper to wrap async middleware
const rateLimitMiddleware = createExpressMiddleware(rL);

// Plug-in rate limit
app.use((req, res, next) => {
  Promise.resolve(rateLimitMiddleware(req, res, next)).catch(next);
});

// API Endpoint to enqueue jobs
app.use("/api/process", processRoutes);

//error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
