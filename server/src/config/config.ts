import { config as dotenvConfig } from "dotenv";
dotenvConfig();

interface IConfig {
    port: number;
    databaseURI: string;
    superAdminEmail: string;
    superAdminPassword: string;
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

if (!process.env.MONGOOSE_STRING_URI) {
    throw new Error("MONGOOSE_STRING_URI is required in environment variables");
}
const databaseURI = process.env.MONGOOSE_STRING_URI;

if (!process.env.SUPER_ADMIN_EMAIL) {
    throw new Error("SUPER ADMIN EMAIL is required in environment variables");
}
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

if (!process.env.SUPER_ADMIN_PASSWORD) {
    throw new Error("SUPER ADMIN PASSWORD is required in environment variables");
}
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;


const _config: IConfig = { port, databaseURI, superAdminEmail, superAdminPassword };

// freeze to prevent accidental modification
export const config = Object.freeze(_config);
