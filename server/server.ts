import app from "./src/app";
import { config } from "./src/config/config";
import connectDatabase from "./src/config/db.config";
import { connectRedis } from "./src/config/redis.config";

const PORT = config.port;

const startServer = async (): Promise<void> => {
  // Connect to MongoDB
  await connectDatabase();

  // Connect to redis globally
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Listening on port:${PORT}`);
  });
};

startServer();
