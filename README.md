# QueueFlow

Showcase of some node.js API fundamentals: Redis Queue Handling with Bull and Workers + Pub/Sub System

This application demonstrates asynchronous job handling using Bull with Redis, implements a custom caching service with a 3‑minute TTL, and sets up a Redis Pub/Sub mechanism.

## Features

- **Bull Queue:** Processes jobs representing IDs.
- **API Endpoint:** POST `/process-ids` to enqueue an array of IDs.
- **Custom Cache:** Stores processed IDs in memory for 3 minutes to avoid duplicate processing.
- **Custom error middleware:** Handles undefined routes and sends response on unhandled app behavior
- **Model validation:** JOI validation middleware before proceeding to the controller handler function
- **Security:** Checked headers cors and implemented Redis Sliding Rate Limiter
- **Logger:** Implemented winston logger for queue and worker
- **Redis Pub/Sub:** Publishes a message each time an ID is processed.
- **Dockerized:** Run the application using Docker and Docker Compose.
- **Test:** Covered in tests for queue and cache

## Setup

1.  **Clone the Repository & Install Dependencies**

    ```bash
    git clone <repository-url>
    cd QueueFlow
    npm install
    ```

2.  **Configure Environment Variables**

    You can set environment variables in a .env file or directly in your Docker Compose file. The app expects:

        REDIS_HOST
        REDIS_PORT
        PORT (for the API server)
        NODE_ENV (for the API server: regulate rate limit, error stack, and client origin)
        CLIENT_ORIGIN (for CORS)
        CLIENT_ORIGIN_TEST (for CORS, NODE_ENV=dev)

3.  **Running Locally**

    Run (API+Worker) in Production Mode (Build First, Then Run) :

    npm run build
    npm run start

    Run (API+Worker) in Development Mode (No Build Step, Faster Tests)
    npm run dev

    Separately:

        Worker process:
        npm run worker

        API process:
        npm run api

4.  **Using Docker Compose for build project**

    npm run build
    docker-compose up --build

5.  **Running Tests on builded project**

    npm test

---

## API Usage

Send a POST request to /process-ids with a JSON payload containing an array of IDs:

Request:

{
"ids": ["x12345bx", "b6b789x0"]
}

Response:

{
"message": "Jobs enqueued",
"count": 2
}

Logs:
worker-1 | Starting Worker  
api-1 | Starting API server
worker-1 | 2025-02-16T11:14:10.630Z info: Redis is up and running
worker-1 | 2025-02-16T11:14:10.640Z info: Subscribed to id-processed (subscribed to 1 channels)
api-1 | 2025-02-16T11:14:10.930Z info: API listening on port 4000
api-1 | 2025-02-16T11:14:10.947Z info: Redis is up and running
api-1 | 2025-02-16T11:14:10.955Z info: Subscribed to id-processed (subscribed to 1 channels)
worker-1 | 2025-02-16T11:14:26.081Z info: Handled x12345bx  
worker-1 | 2025-02-16T11:14:26.091Z info: Pub/Sub received: Processed id: x12345bx
api-1 | 2025-02-16T11:14:26.087Z info: Pub/Sub received: Processed id: x12345bx
worker-1 | 2025-02-16T11:14:26.093Z info: Handled b6b789x0
api-1 | 2025-02-16T11:14:26.098Z info: Pub/Sub received: Processed id: b6b789x0
worker-1 | 2025-02-16T11:14:26.104Z info: Pub/Sub received: Processed id: b6b789x0

The server will enqueue each ID as a job. When processed, the worker logs whether the ID was handled from cache or processed for the first time, and a Pub/Sub message is published.

## Architecture

    Bull Queue: Handles job processing.
    Worker: Checks the cache and processes IDs.
    Cache Service: An in-memory store with automatic cleanup.
    Redis Pub/Sub: Notifies on job completion.
    Docker: Containerizes the app and Redis using Docker Compose.

---

## Why startup script?

Note: Make sure to give execution permissions:
chmod +x start.sh

In production you may want to run the API server and worker as separate processes (or even separate containers). With startup script one image can run either the API or the worker based on an environment variable. Done for better isolation and scalability.

Running the API server and worker as single process using tools (like pm2) is also available.
