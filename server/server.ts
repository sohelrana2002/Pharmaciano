import app from "./src/app";
import { config } from "./src/config/config";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
