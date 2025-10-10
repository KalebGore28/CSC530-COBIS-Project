import { createFileRoute } from "@tanstack/react-router"
import { loadUser } from "@/middleware/load-user"

export const Route = createFileRoute("/api/")({
  server: {
    middleware: [loadUser],
    handlers: {
      GET: async ({ request }) => {
        return new Response("Hello, World!")
      },
    },
  },
})
