import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/__protected/import/$id/progress')({
    server: {
        handlers: {
            GET: ({ request }) => {},
        },
    },
})
