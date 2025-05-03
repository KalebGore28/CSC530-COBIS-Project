import express from "express";
import cors from "cors";
import { config } from "./utils/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { restrictGoogleCallback } from "./middleware/restrict-google-callback";
import path from "path";

import { createHandler } from 'graphql-http/lib/use/express'
//@ts-ignore
import { ruruHTML } from 'ruru/server'
import { schema } from './graphql'            // resolves src/graphql/index.ts
import { buildContext } from './graphql/context'

// Open API
import { apiReference } from '@scalar/express-api-reference'
import 'zod-openapi/extend';
import { createDocument } from 'zod-openapi';

// Middleware
import { authenticateUser } from './middleware/authenticate-user';
import { getUserInfo } from './middleware/get-user-info';

// Import Routes
import importRoutes from "./routes/import-router";
import userRoute from "./routes/user-router";
import instructorRouter from "./routes/instructor-router";
import studentRouter from "./routes/student-router";
import enrollmentRouter from "./routes/enrollment-router";
import searchRoute from "./routes/search-router";
import studentLookupRoute from "./routes/student-lookup-router";
import utilityRouter from "./routes/utility-router";
import advisorRouter from "./routes/advisor-router";
import lookupRouter from "./routes/lookup-router";
// import customQuery from "./routes/customQueries";

// Import OpenAPI specs
import { InstructorAPISpecs } from "./specs/instructor-specs";
import { StudentAPISpecs } from "./specs/student-specs";
import { EnrollmentAPISpecs } from "./specs/enrollment-specs";
import { SearchAPISpecs } from "./specs/search-specs";
import { UserAPISpecs } from "./specs/user-specs";
import { StudentLookupAPISpecs } from "./specs/student-lookup-specs";
import { ImportAPISpecs } from "./specs/import-specs";
import { UtilityAPISpecs } from "./specs/utility-specs";
import { AdvisorAPISpecs } from "./specs/advisor-specs";
import { LookupAPISpecs } from "./specs/lookup-spec";

const staticDir = path.resolve(process.cwd(), 'dist', 'public')


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
        ...UserAPISpecs,
        ...SearchAPISpecs,
        ...LookupAPISpecs,
        ...StudentLookupAPISpecs,
        ...StudentAPISpecs,
        ...InstructorAPISpecs,
        ...EnrollmentAPISpecs,
        ...ImportAPISpecs,
        ...UtilityAPISpecs,
        ...AdvisorAPISpecs,
    },
});

// Create an Express app
const app = express()

// Middleware
// @ts-ignore
app.use('/api/docs', apiReference({ theme: 'purple', spec: { content: document } })) //! Probably comment this out in production
app.use(
    cors({
        origin: config.frontend_origin,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)
app.use('/api/auth/callback/google', restrictGoogleCallback) // Enforces only specific domains can sign in for google
app.all("/api/auth/*", toNodeHandler(auth)) // Must be declared before express.json(). Required for better-auth.
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.all(
    '/graphql',
    async (req, res, next) => {
        const context = await buildContext()
        return createHandler({
            schema,
            context,
        })(req, res, next)
    }
)

app.get('/graphiql', (_req, res) => {
    res
        .type('html')
        .end(
            ruruHTML({
                endpoint: '/graphql',
                title: 'My API GraphiQL',
            })
        )
})

// now serve client:
app.use(express.static(staticDir))
app.use('/api', authenticateUser, getUserInfo)
app.use("/api/user", userRoute)
app.use("/api/import", importRoutes)
app.use("/api/instructor", instructorRouter)
app.use("/api/student", studentRouter)
app.use("/api/enrollment", enrollmentRouter)
app.use("/api/search", searchRoute)
app.use("/api/student-lookup", studentLookupRoute)
app.use("/api/utility", utilityRouter)
app.use("/api/advisor", advisorRouter)
app.use("/api/lookup", lookupRouter)
// app.use('/api/custom-query', customQuery)

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(staticDir, 'index.html'))
})

export default app;