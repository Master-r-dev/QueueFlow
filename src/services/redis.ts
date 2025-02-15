import { Redis } from "ioredis";
import logger from "./logger.js";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASS = process.env.REDIS_PASS || "";

const client = new Redis({
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  password: REDIS_PASS,
  /* username: "default", // needs Redis >= 6
    password: "my-top-secret",
    db: 0, // Defaults to 0 */
});
client.on("error", (error) => {
  //console.log("Error connecting to Redis", error);
  logger.error(`Error connecting to Redis: ${error}`);
});
client.on("ready", () => {
  logger.info("Redis is up and running");
});

client.on("end", () => {
  logger.info("Disconnected from Redis");
});

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = Number(process.env.REDIS_PORT) || 6379;

// Create separate Redis clients for publishing and subscribing
const publisher = new Redis({ host: redisHost, port: redisPort });
const subscriber = new Redis({ host: redisHost, port: redisPort });

const CHANNEL = "id-processed";

// Subscribe to the channel
subscriber.subscribe(CHANNEL, (err, count) => {
  if (err) {
    logger.error(`Failed to subscribe: ${err}`);
  } else {
    logger.info(`Subscribed to ${CHANNEL} (subscribed to ${count} channels)`);
  }
});

// Listen for messages and log them
subscriber.on("message", (channel, message) => {
  if (channel === CHANNEL) {
    logger.info(`Pub/Sub received: ${message}`);
  }
});

// Function to publish a message
export function publishMessage(message: string): void {
  publisher.publish(CHANNEL, message);
}

// Export the clients so you can shut them down later
export { client, publisher, subscriber };

/**
 * Closes all Redis connections gracefully.
 */
export async function closeRedisConnections() {
  try {
    await client.quit();
    await publisher.quit();
    await subscriber.quit();
    logger.info("Closed all Redis connections");
  } catch (err) {
    logger.error("Error closing Redis connections:", err);
  }
}

export default client;
