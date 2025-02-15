import Queue from "bull";

// Create a Bull queue named 'id-processing'
const idQueue = new Queue("id-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

export default idQueue;
