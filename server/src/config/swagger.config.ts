import { config } from "./config";
import path from "path";
const isProd = process.env.NODE_ENV === "production";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pharmaciano API",
      version: "1.0.0",
      description: `
Pharmaciano is a comprehensive pharmaceutical management platform that allows
administrators, organizations, and branch managers to manage users, roles,
organizations, branches, brands, and subscriptions seamlessly. It supports
feature-based access control, secure JWT authentication, and provides
APIs for managing all entities in the system.
      `,
    },
    servers: [
      {
        url: "http://localhost:5000", // Base URL for local development
        description: "Local server",
      },
      {
        url: `${config.backEndBaseUrl}`, // Replace with your production URL
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description:
            "JWT token WITHOUT 'Bearer ' prefix. Just the token itself.",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: isProd
    ? [path.resolve(__dirname, "../**/*.js")] // dist
    : [path.resolve(__dirname, "../../src/**/*.ts")], // local
};

export default options;
