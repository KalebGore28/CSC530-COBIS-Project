import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'

// This route is used as a parent route for all protected API routes
export const Route = createFileRoute('/api/__protected')({
    server: {
        middleware: [loadUser],
    }
})