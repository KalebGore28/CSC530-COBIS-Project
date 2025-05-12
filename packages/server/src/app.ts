import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { restrictGoogleCallback } from "./middleware/restrict-google-callback";
import path from "path";

import { createHandler } from 'graphql-http/lib/use/express'
//@ts-ignore
import { ruruHTML } from 'ruru/server'
import { schema } from './graphql'            // resolves src/graphql/index.ts
import { buildContext } from './graphql/context'

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

import { AuthAndPermissionsRequest } from "./types/requests";

const staticDir = path.resolve(process.cwd(), 'dist', 'public')


// Create an Express app
const app = express()

// Middleware
// @ts-ignore
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN as string,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)
app.use('/api/auth/callback/google', restrictGoogleCallback) // Enforces only specific domains can sign in for google
app.all("/api/auth/*", toNodeHandler(auth)) // Must be declared before express.json(). Required for better-auth.
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// now serve client:
app.use(express.static(staticDir))
app.use('/api', authenticateUser, getUserInfo)

app.all(
    '/api/graphql',
    authenticateUser,
    getUserInfo,
    async (req, res, next) => {
        const { db, loaders } = await buildContext()
        // ← make sure you actually pull roles off of req here!
        const ctx = {
            db,
            loaders,
            user: (req as AuthAndPermissionsRequest).user,
            roles: (req as AuthAndPermissionsRequest).roles.map(r => r.role_name),
            mnumber: (req as AuthAndPermissionsRequest).mnumber,
            department: (req as AuthAndPermissionsRequest).department,
            college: (req as AuthAndPermissionsRequest).college,
        }
        return createHandler({ schema, context: ctx })(req, res, next)
    }
)

app.get('/api/graphiql', (_req, res) => {
    res
        .type('html')
        .end(
            ruruHTML({
                endpoint: '/api/graphql',
                title: 'My API GraphiQL',
            })
        )
})

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