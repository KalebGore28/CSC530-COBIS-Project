import express from "express";
import cors from "cors";
import http from "http";
import path from "path";

import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { restrictGoogleCallback } from "./middleware/restrict-google-callback";
import { authenticateAndLoadUser } from "./middleware/authenticate-user";
import { loadQueryMap } from "./utils/query-map-loader";

import { getDbConnection, DbConnection } from "./db/connection";
import type { AuthAndPermissionsRequest } from "./types/requests";

import importRoutes from "./routes/import-router";
import userRoute from "./routes/user-router";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { createLoaders, Loaders } from "./graphql/loaders";
import { typeDefs, resolvers } from "./graphql";
import { requireEnabled } from "./middleware/require-enabled";

type Role = {
    role_id: number;
    role_name: string;
};

export interface ApolloContext {
    db: DbConnection["orm"];
    loaders: Loaders;
    user: any;
    roles: Role[];
    mnumber: string | null;
    department: string | null;
    college: string | null;
}

export async function buildContext(req: AuthAndPermissionsRequest): Promise<ApolloContext> {
    const db = (await getDbConnection()).orm;
    return {
        db,
        loaders: createLoaders(db),
        user: req.user,
        roles: req.roles,
        mnumber: req.mnumber,
        department: req.department,
        college: req.college,
    };
}

const queryMap = await loadQueryMap();

const app = express();
const httpServer = http.createServer(app);

// 1. Create & start ApolloServer
const server = new ApolloServer<ApolloContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

// 2. (Dev only) CORS for REST and GraphQL
if (process.env.NODE_ENV !== "production") {
    console.log("CORS enabled");
    app.use(
        cors({
            origin: [process.env.FRONTEND_ORIGIN!],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        })
    );
}

// 3. Auth callback routes
app.use("/api/auth/callback/google", restrictGoogleCallback);
app.all("/api/auth/*splat", toNodeHandler(auth));

// 4. Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 5. Mount your GraphQL endpoint
app.use("/api", authenticateAndLoadUser);

// 6. REST APIs
app.use("/api/user", userRoute);
app.use(requireEnabled); // INTENTIONAL PLACEMENT: Ensure user is enabled before accessing any further routes
app.use("/api/import", importRoutes);

// 7. GraphQL endpoint with persisted queries
app.use(
    "/api/graphql",
    express.json(), // parse JSON bodies first

    // Prevent users from getting access to the raw graphql api for security reasons.
    // This middleware will only allow persisted queries to be executed.
    (req, res, next) => {
        // Relay’s runtime will send { id: "<md5-hash>", variables: { … } }
        // so look for `req.body.id` (you could also check `req.body.queryID` if your client uses that key).

        try {
            const id = typeof req.body.doc_id === "string" ? req.body.doc_id : null;

            if (id) {
                const fullText = queryMap[id];
                if (!fullText) {
                    // If this hash isn’t in our map, reject immediately
                    res
                        .status(400)
                        .json({ errors: [{ message: `Unknown persisted query ID: "${id}"` }] });
                    return;
                }
                // Overwrite the body so Apollo sees it as a "normal" GraphQL query
                req.body = {
                    query: fullText,
                    variables: req.body.variables || {},
                    operationName: req.body.operationName || null,
                };
                // (If you want, you can also remove `id` at this point: delete req.body.id)
            }
            // If no `id` was sent, you can choose to:
            //  – reject everything that isn’t persisted, or
            //  – allow raw queries in dev (by calling next() without touching req.body).
            //
            // For a fully locked‐down persisted‐queries mode, you could do:
            // if (!id) {
            //   return res.status(400).json({ errors:[{ message: "Must provide persisted query ID." }] });
            // }
            //
            // But here we simply “fall through” so Apollo will decide if `req.body.query` is missing.
            next();
        } catch (error) {
            res.status(500).json({ errors: [{ message: "Internal server error" }] });
        }
    },
    // Finally, hand off to Apollo’s Express integration:
    expressMiddleware(server, {
        context: async ({ req }) => buildContext(req as AuthAndPermissionsRequest),
    })
);

// 8. Static SPA assets
const staticDir = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(staticDir));

// 9. Serve index.html for all non-API routes
app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
});

export default httpServer;