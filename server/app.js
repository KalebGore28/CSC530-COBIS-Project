import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./middleware/passport-config.js";

// Import Routes
import importRoutes from "./routes/imports/index.js";
import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/import", importRoutes);
app.use("/auth", authRoutes);
app.use("/", homeRoutes);


// Example home route
app.get('/', (req, res) => {
  res.send(`<h1>Home Page</h1>
    <p>You are ${req.cookies.jwt ? "logged in" : "not logged in"}</p>
    <a href="/auth/google">Sign in with Google</a>
    <br/>
    <a href="/auth/logout">Logout</a>
  `);
});

export default app;
