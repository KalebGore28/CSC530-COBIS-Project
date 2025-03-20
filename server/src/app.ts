import express from "express";
import cors from "cors";
import { config } from "./utils/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

// Open API
import { apiReference } from '@scalar/express-api-reference'
import 'zod-openapi/extend';
import { createDocument } from 'zod-openapi';

// Import routes and API specs for OpenAPI Generation
import importRoutes, { importAPISpecs } from "./routes/imports";

// Create an OpenAPI document
const document = createDocument({
    openapi: '3.1.0',
    info: {
        title: 'My API',
        version: '1.0.0',
    },
    tags: [
        { name: 'Imports', description: 'Importing data' },
    ],
    paths: {
        ...importAPISpecs,
    },
});

// Create an Express app
const app = express()

// Middleware
// @ts-ignore
app.use('/api/docs', apiReference({ theme: 'purple', spec: { content: document } }))
app.use(
    cors({
        origin: config.frontend_origin, // Replace with your frontend's origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
)
app.all("/api/auth/*", toNodeHandler(auth)) // Must be declared before express.json(). Required for better-auth.
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// app.use("/api", testRoute)
app.use("/api/import", importRoutes)
// app.use("/api/instructor", testRoute)
// app.use('/api/custom-query', customQuery)

// // In dev (ESM), we'll rely on process.cwd() as a fallback; in bundled CJS, __dirname is native
// const appDir = typeof __dirname === 'undefined' ? path.resolve() : __dirname;

// // Serve static files from dist/public
// app.use(express.static(path.join(appDir, 'public')))

// // Fallback for SPA routing
// app.get('*', (req, res) => {
//     res.sendFile(path.join(appDir, 'public', 'index.html'));
// });

export default app;