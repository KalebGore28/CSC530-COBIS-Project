import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swaggerConfig'; // Adjusted path

// Use __dirname from CommonJS
const app = express()

    // Middleware
    .use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    .use(cors())
    .use(express.json({ limit: "10mb" }))
    .use(express.urlencoded({ extended: true, limit: "10mb" }))
    .use(cookieParser())

    // Serve static files from dist/public
    .use(express.static(path.join(__dirname, 'public')))

// Routes
import importRoutes from "./routes/imports";
import authRoutes from "./routes/auth";
import testRoute from "./routes/instructors";
import { customQuery } from "./routes/customQueries";

app.use("/api/import", importRoutes)
   .use("/api/auth", authRoutes)
   .use("/api/instructor", testRoute)
   .use('/api/custom-query', customQuery);

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;