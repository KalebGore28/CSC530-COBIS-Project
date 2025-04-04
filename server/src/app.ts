import express from "express";
import cors from "cors";
import { config } from "./utils/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { restrictGoogleCallback } from "./middleware/restrictGoogleCallback";

// Open API
import { apiReference } from '@scalar/express-api-reference'
import 'zod-openapi/extend';
import { createDocument } from 'zod-openapi';

// Middleware
import { authenticateUser } from './middleware/authenticateUser';
import { getUserInfo } from './middleware/getUserInfo';

// Import routes and API specs for OpenAPI Generation
import importRoutes, { importRoutesAPISpecs } from "./routes/imports";
import userRoute, { userSpecs } from "./routes/user";
// import reportingRoute, { reportingSpecs } from "./routes/reporting";
// import searchRoute, { searchSpecs } from "./routes/search";
// import studentLookup, { studentLookupSpec } from "./routes/studentLookup";
// import customQuery from "./routes/customQueries";
// import enrollmentRouter, { enrollmentRouterSpec } from "./routes/enrollment-router";
// import studentRouter, { studentRouterSpec } from "./routes/student-router";
import instructorRouter, { instructorRouterSpec } from "./routes/instructor-router";
import studentEnrollmentRouter from './routes/student-enrollment-router';


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
        ...importRoutesAPISpecs,
        ...userSpecs,
        // ...reportingSpecs,
        // ...searchSpecs,
        // ...studentLookupSpec,
        ...instructorRouterSpec,
        // ...enrollmentRouterSpec,
        // ...studentRouterSpec,
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
app.use('/api/auth/callback/google', restrictGoogleCallback) // Enforces only specific domains can sign in for google
app.all("/api/auth/*", toNodeHandler(auth)) // Must be declared before express.json(). Required for better-auth.
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(authenticateUser)
app.use(getUserInfo)
app.use("/api/user", userRoute)
app.use("/api/import", importRoutes)
// app.use("/api/reporting", reportingRoute)
// app.use("/api/search", searchRoute)
// app.use("/api", studentLookup)
// app.use('/api/custom-query', customQuery)
// app.use("/api/enrollment", enrollmentRouter)
// app.use("/api/students", studentRouter)
app.use("/api/instructor", instructorRouter)
app.use('/api/students', studentEnrollmentRouter);


// // In dev (ESM), we'll rely on process.cwd() as a fallback; in bundled CJS, __dirname is native
// const appDir = typeof __dirname === 'undefined' ? path.resolve() : __dirname;

// // Serve static files from dist/public
// app.use(express.static(path.join(appDir, 'public')))

// // Fallback for SPA routing
// app.get('*', (req, res) => {
//     res.sendFile(path.join(appDir, 'public', 'index.html'));
// });

export default app;