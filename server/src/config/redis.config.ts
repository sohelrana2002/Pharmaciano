import { createClient, RedisClientType } from "redis";
import { config } from "./config";

export const redisClient: RedisClientType = createClient({
  url: config.redisUrl,
});

// event listeners
redisClient.on("error", (err) => console.error("Redis client error: ", err));
redisClient.on("connect", () =>
  console.log("Redis client connected to server."),
);
redisClient.on("ready", () =>
  console.log("Redis client ready for operations."),
);

// initializes the redis connection
export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Global redis connection established successfully.");
    }
  } catch (error) {
    console.error("Failed to established global redis connection: ", error);
    process.exit(1);
  }
};

/*
This termination used for 
1. Render deployments
2. Docker containers
3. Kubernetes
4. Cloud platforms

Not suitable for Vercel
*/
// handle graceful termination (prevents hanfing socket connections)
/*
const gracefulShutdown = async () => {
  if (redisClient.isOpen) {
    console.log("Closing global redis connection.");
    await redisClient.quit();
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
*/
