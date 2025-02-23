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
// import authRoutes from "./routes/auth.js";
// import homeRoutes from "./routes/home.js";

// Create Express app
const app = express()

  // Middleware
  .use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  .use(cors())
  .use(express.json({ limit: "10mb" }))
  .use(express.urlencoded({ extended: true, limit: "10mb" }))
  .use(cookieParser())

  // Serve static files from the Vite-built dist folder.
  // app.use(express.static(path.join(__dirname, '../client/dist')));

  // Routes
  .use("/api/import", importRoutes)
  // app.use(BASE_URL + "/auth", authRoutes);
  // app.use(BASE_URL + "/", homeRoutes);


  // Example home route
  .get("/api/home", (req, res) => {
    res.send(`<h1>Home Page</h1>
    <p>You are ${req.cookies.jwt ? "logged in" : "not logged in"}</p>
    <a href="/api/auth/google">Sign in with Google</a>
    <br/>
    <a href="/api/auth/logout">Logout</a>
    `);
  })

// The catch-all handler: for any request that doesn't match /api, send back index.html.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
// });

// Export the Express app
export default app;
