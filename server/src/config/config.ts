import { config as dotenvConfig } from "dotenv";
dotenvConfig();

interface IConfig {
    port: number;
    databaseURI: string;
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

if (!process.env.MONGOOSE_STRING_URI) {
    throw new Error("MONGOOSE_STRING_URI is required in environment variables");
}

const databaseURI = process.env.MONGOOSE_STRING_URI;

const _config: IConfig = { port, databaseURI };

// freeze to prevent accidental modification
export const config = Object.freeze(_config);
