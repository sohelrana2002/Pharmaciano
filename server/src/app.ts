/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

const app: Application = express();

// Import routes
import authRoutes from "./routers/auth.router";
import userRoutes from "./routers/user.router";
import roleRoutes from "./routers/role.router";
import brandRouters from "./routers/brand.router";
import organizationRouter from "./routers/organization.router";

const allowedOrigins = [
  "http://localhost:3000",
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

// Routes
const apiVersion: any = "v1";

app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/roles`, roleRoutes);
app.use(`/api/${apiVersion}/brands`, brandRouters);
app.use(`/api/${apiVersion}/organizations`, organizationRouter);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend is running!",
  });
});

export default app;
