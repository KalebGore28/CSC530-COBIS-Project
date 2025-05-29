import express from "express";
import cors from "cors";
import http from "http";
import path from "path";

import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { restrictGoogleCallback } from "./middleware/restrict-google-callback";
import { authenticateAndLoadUser } from "./middleware/authenticate-user";

import { getDbConnection, DbConnection } from "./db/connection";
import type { AuthAndPermissionsRequest } from "./types/requests";

import importRoutes from "./routes/import-router";
import userRoute from "./routes/user-router";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { createLoaders, Loaders } from "./graphql/loaders";
import { typeDefs, resolvers } from "./graphql";

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
app.use(
    "/api/graphql",
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => buildContext(req as AuthAndPermissionsRequest),
    })
);

// 6. Static SPA assets
const staticDir = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(staticDir));

// 7. Protect your REST APIs
app.use("/api/user", userRoute);
app.use("/api/import", importRoutes);

// 8. SPA fallback
app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
});

export default httpServer;