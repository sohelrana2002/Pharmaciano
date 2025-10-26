import express, { Application, Request, Response } from "express";

const app: Application = express();

// Middleware example
app.use(express.json());

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend is running!"
  });
});

export default app;
