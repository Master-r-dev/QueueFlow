import idQueue from "./queue.js";
import cacheService from "./cache.js";
import { publishMessage } from "./redis.js";
import logger from "./logger.js";

idQueue.process(async (job) => {
  const id: number | string = job.data.id;
  try {
    if (cacheService.has(id)) {
      logger.info(`Handled from cache ${id}`);
    } else {
      logger.info(`Handled ${id}`);
      cacheService.set(id, true);
    }
    publishMessage(`Processed id: ${id}`);
  } catch (error) {
    logger.error(`Error processing job ${id}: ${error}`);
    throw error; // Let Bull mark the job as failed
  }
});
