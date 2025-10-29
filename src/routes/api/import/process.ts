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
                const { filename, csvData } = await request.json()
                const { orm } = await getDbConnection()

                // Create a readable stream that will send progress events
                const stream = new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder()
                        const write = (msg: string) =>
                            controller.enqueue(encoder.encode(msg + '\n'))

                        try {
                            await importData(orm, csvData, filename, csvConfig, {
                                write,
                                end: () => controller.close(),
                            })

                            write(JSON.stringify({ type: 'complete' }))
                            controller.close()
                        } catch (error) {
                            write(JSON.stringify({ type: 'error', error: String(error) }))
                            controller.close()
                        }
                    },
                })

                return new Response(stream, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/event-stream; charset=utf-8',
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                    },
                })
            },
        },
    },
})
