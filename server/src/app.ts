/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerDocument from "../public/swagger.json";

dotenv.config();

const app: Application = express();
const apiRouter = express.Router();

// swagger ui setup
// const swaggerDocs = swaggerJsdoc(options);
// console.log("swaggerDocs", swaggerDocs);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get("/api-docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pharmaciano API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerDocument)},
        dom_id: '#swagger-ui',
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>
  `);
});

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
app.use(helmet());

// base url
app.use("/api/v1", apiRouter);

// Routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/brands", brandRouters);
apiRouter.use("/organizations", organizationRouter);
apiRouter.use("/branches", branchRouter);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend is running!",
  });
});

export default app;
