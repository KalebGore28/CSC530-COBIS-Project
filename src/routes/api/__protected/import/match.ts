import { createFileRoute } from '@tanstack/react-router'
import { csvConfig } from '@/db/mapping-config'
import { findMatchingTables } from '@/utils/csv-importer'

export const Route = createFileRoute('/api/__protected/import/match')({
    server: {
        handlers: {
            GET: ({ request }) => {
                const url = new URL(request.url)
                const filename = url.searchParams.get('filename') || ''
                const tables = findMatchingTables(filename, csvConfig)
                const tableNames = Array.from(tables.keys());

                return new Response(JSON.stringify({ tableNames }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                )
            }
        }
    }
})