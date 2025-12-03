import { createFileRoute } from '@tanstack/react-router'
import { csvConfig } from '@/db/mapping-config'
import { importData } from '@/utils/csv-importer'

export const Route = createFileRoute('/api/__protected/import/process')({
    server: {
        handlers: {
            POST: async ({ request, context }) => {
                const { filename, csvData } = await request.json()

                // Create a readable stream that will send progress events
                const stream = new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder()
                        const write = (msg: string) =>
                            controller.enqueue(encoder.encode(msg + '\n'))

                        try {
                            await importData(context.db, csvData, filename, csvConfig, {
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
