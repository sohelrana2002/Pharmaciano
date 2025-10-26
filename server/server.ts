import app from "./src/app";
import { config } from "./src/config/config";
import connectDatabase from "./src/config/db";

const PORT = config.port;

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Listening on port:${PORT}`);
  });
}

startServer();