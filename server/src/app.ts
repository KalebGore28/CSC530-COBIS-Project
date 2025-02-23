import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "/api";


// Import Routes
import importRoutes from "./routes/imports";
// import authRoutes from "./routes/auth.js";
// import homeRoutes from "./routes/home.js";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static files from the Vite-built dist folder.
// app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use(BASE_URL + "/import", importRoutes);
// app.use(BASE_URL + "/auth", authRoutes);
// app.use(BASE_URL + "/", homeRoutes);


// Example home route
app.get(BASE_URL + '/home', (req, res) => {
  res.send(`<h1>Home Page</h1>
    <p>You are ${req.cookies.jwt ? "logged in" : "not logged in"}</p>
    <a href="/api/auth/google">Sign in with Google</a>
    <br/>
    <a href="/api/auth/logout">Logout</a>
    `);
});

// The catch-all handler: for any request that doesn't match /api, send back index.html.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
// });

// Export the Express app
export default app;
