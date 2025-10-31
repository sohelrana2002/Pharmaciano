/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();

// Import routes
import authRoutes from "./routers/authRouter";
import userRoutes from "./routers/userRouter"
import roleRoutes from './routers/roleRouter';



// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);



// // 404 handler - FIXED: Use proper route handling
// app.use('/api/*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API route not found'
//   });
// });

// // Global 404 handler for all other routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });


// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend is running!"
  });
});

export default app;
