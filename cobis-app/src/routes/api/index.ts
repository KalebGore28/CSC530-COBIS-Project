import { createFileRoute } from "@tanstack/react-router"
import { requireAuth } from "@/middleware/load-user"

export const Route = createFileRoute("/api/")({
  server: {
    middleware: [requireAuth],
    handlers: {
      GET: async ({ request }) => {
        return new Response("Hello, World!")
      },
    },
  },
})
