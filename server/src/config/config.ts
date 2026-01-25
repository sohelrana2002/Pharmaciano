import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { StringValue } from "ms";

interface IConfig {
  port: number;
  databaseURI: string;
  jwtSecret: string;
  superAdminEmail: string;
  superAdminPassword: string;
  tokenExpireIn: StringValue;
  apiVersion: string;
  backEndBaseUrl: string;
}

// define port
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

// define mongoose string uri
if (!process.env.MONGOOSE_STRING_URI) {
  throw new Error("MONGOOSE_STRING_URI is required in environment variables");
}
const databaseURI = process.env.MONGOOSE_STRING_URI;

// define jwt secret
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in environment variables");
}
const jwtSecret = process.env.JWT_SECRET;

// define super admin email
if (!process.env.SUPER_ADMIN_EMAIL) {
  throw new Error("SUPER ADMIN EMAIL is required in environment variables");
}
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

// define super admin password
if (!process.env.SUPER_ADMIN_PASSWORD) {
  throw new Error("SUPER ADMIN PASSWORD is required in environment variables");
}
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

// define jwt expire in
if (!process.env.TOKEN_EXPIRE_IN) {
  throw new Error("TOKEN EXPIRE IN is required in environment variables");
}
const tokenExpireIn = process.env.TOKEN_EXPIRE_IN as StringValue;

// define api version
if (!process.env.API_VERSION) {
  throw new Error("API VERSION is required in environment variables");
}
const apiVersion = process.env.API_VERSION;

// define back End Base Url
if (!process.env.BACK_END_BASE_URL) {
  throw new Error("Back End Base Url is required in environment variables");
}
const backEndBaseUrl = process.env.BACK_END_BASE_URL;

const _config: IConfig = {
  port,
  databaseURI,
  jwtSecret,
  superAdminEmail,
  superAdminPassword,
  tokenExpireIn,
  apiVersion,
  backEndBaseUrl,
};

// freeze to prevent accidental modification
export const config = Object.freeze(_config);
