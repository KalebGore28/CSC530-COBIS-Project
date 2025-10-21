import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { isEnabled } from '@/middleware/is-enabled'
import { csvConfig } from '@/db/mapping-config'
import { findMatchingTables } from '@/utils/csv-importer'

export const Route = createFileRoute('/api/import/match')({
    server: {
        middleware: [loadUser, isEnabled],
        handlers: {
            GET: ({ request }) => {
                const url = new URL(request.url)
                const filename = url.searchParams.get('filename') || ''
                const tables = findMatchingTables(filename, csvConfig)

                return new Response(JSON.stringify({ tables }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                )
            }
        }
    }
})