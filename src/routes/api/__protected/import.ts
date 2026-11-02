import { createFileRoute } from "@tanstack/react-router";
import { requireCapability } from "@/middleware/require-capability";

// This route is used as a parent route for all import API routes, as they write directly to the database
export const Route = createFileRoute("/api/__protected/import")({
  server: {
    middleware: [requireCapability("tools.manage")],
  },
});
