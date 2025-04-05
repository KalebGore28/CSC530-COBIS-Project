import express from "express";
import cors from "cors";
import { config } from "./utils/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { restrictGoogleCallback } from "./middleware/restrict-google-callback";

// Open API
import { apiReference } from '@scalar/express-api-reference'
import 'zod-openapi/extend';
import { createDocument } from 'zod-openapi';

// Middleware
import { authenticateUser } from './middleware/authenticate-user';
import { getUserInfo } from './middleware/get-user-info';

// Import Routes
import importRoutes from "./routes/imports";
import userRoute from "./routes/user";
import instructorRouter from "./routes/instructor-router";
import studentRouter from "./routes/student-router";
import enrollmentRouter from "./routes/enrollment-router";
import searchRoute from "./routes/search";
import reportingRoute from "./routes/reporting";
// import studentLookup, { studentLookupSpec } from "./routes/studentLookup";
// import customQuery from "./routes/customQueries";
// import studentEnrollmentRouter from './routes/student-enrollment-router';

// Import OpenAPI specs
import { InstructorAPISpecs } from "./specs/instructor-specs";
import { StudentAPISpecs } from "./specs/student-specs";
import { EnrollmentAPISpecs } from "./specs/enrollment-specs";
import { SearchAPISpecs } from "./specs/search-specs";
import { ReportingAPISpecs } from "./specs/reporting-specs";

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
        ...InstructorAPISpecs,
        ...StudentAPISpecs,
        ...EnrollmentAPISpecs,
        ...SearchAPISpecs,
        ...ReportingAPISpecs,
        // ...importRoutesAPISpecs,
        // ...userSpecs,
        // ...reportingSpecs,
        // ...studentLookupSpec,
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
app.use("/api/instructor", instructorRouter)
app.use("/api/student", studentRouter)
app.use("/api/enrollment", enrollmentRouter)
app.use("/api/search", searchRoute)
app.use("/api/reporting", reportingRoute)
// app.use("/api", studentLookup)
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