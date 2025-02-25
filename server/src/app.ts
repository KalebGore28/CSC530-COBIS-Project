import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../src/utils/swaggerConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Routes
import importRoutes from "./routes/imports";
import authRoutes from "./routes/auth";
import testRoute from "./routes/test";

// Create Express app
const app = express()

  // Middleware
  .use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  .use(cors())
  .use(express.json({ limit: "10mb" }))
  .use(express.urlencoded({ extended: true, limit: "10mb" }))
  .use(cookieParser())

  // Serve static files from the Vite-built dist folder.
  .use(express.static(path.join(__dirname, '../../client/dist')))

  // Routes
  .use("/api/import", importRoutes)
  .use("/api/auth", authRoutes)
  .use("/api", testRoute)


export default app;
