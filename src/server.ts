import app from "./app.js";
import logger from "./services/logger.js";
import cacheService from "./services/cache.js";
import idQueue from "./services/queue.js";
import { closeRedisConnections } from "./services/redis.js";
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => logger.info(`API listening on port ${PORT}`));

// Global error handlers
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Function to gracefully shut down the application
async function shutdown() {
  try {
    logger.info("Shutting down gracefully...");
    // Clear the cache and stop the cleanup timer
    cacheService.cleanup(); // Clears expired items immediately (optional)
    cacheService.stop(); // Stops the periodic cleanup timer

    await idQueue.close();
    await closeRedisConnections();

    logger.info("FeLiNa");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Listen for termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
