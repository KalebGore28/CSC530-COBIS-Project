import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { isEnabled } from '@/middleware/is-enabled'

// This route is used as a parent route for all protected API routes
export const Route = createFileRoute('/api/__protected')({
    server: {
        middleware: [loadUser, isEnabled],
    }
})