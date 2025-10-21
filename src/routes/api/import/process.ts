import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { isEnabled } from '@/middleware/is-enabled'
import { csvConfig } from '@/db/mapping-config'
import { importData } from '@/utils/csv-importer'
import { getDbConnection } from '@/db'

export const Route = createFileRoute('/api/import/process')({
    server: {
        middleware: [loadUser, isEnabled],
        handlers: {
            POST: async ({ request }) => {
                const { filename, csvData } = await request.json();
                const { orm } = await getDbConnection();

                try {
                    await importData(orm, csvData, filename, csvConfig);
                } catch (error) {
                    console.error('Error during import:', error);
                    return new Response(JSON.stringify({ error: 'Import failed' }),
                        {
                            status: 500,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    )
                }

                return new Response(JSON.stringify({ success: true }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                )
            }
        }
    }
})
