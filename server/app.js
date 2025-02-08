import express from "express";
import cors from "cors";

// Import Middleware

// Import Routes
import importRoutes from "./routes/imports.js";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/import", importRoutes);

export default app;
