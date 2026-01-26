/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "../swagger-output.json";
import swaggerJsdoc from "swagger-jsdoc";
import options from "./config/swagger.config";

dotenv.config();
// import { config as envConfig } from "./config/config";

const app: Application = express();
const apiRouter = express.Router();

// swagger ui setup
const swaggerDocs = swaggerJsdoc(options);
// console.log("swaggerDocs", swaggerDocs);

// Define the CDN assets to avoid local file path issues on Vercel
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";

app.use(
  "/api-docs",
  swaggerUi.serve, // Note: Use .serve instead of .serveFiles for simpler setup
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCssUrl: CSS_URL,
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
  }),
);

// Import routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import roleRoutes from "./routes/role.route";
import brandRouters from "./routes/brand.route";
import organizationRouter from "./routes/organization.route";
import branchRouter from "./routes/branch.route";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://pharmaciano.vercel.app",
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  // optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  helmet({
    contentSecurityPolicy: false, // Required so the browser allows the CDN CSS/JS
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// base url
app.use("/api/v1", apiRouter);

// Routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/brands", brandRouters);
apiRouter.use("/organizations", organizationRouter);
apiRouter.use("/branchs", branchRouter);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend is running!",
  });
});

export default app;
