import { createFileRoute } from '@tanstack/react-router'
import { csvConfig } from '@/db/mapping-config'
import { importData, ImportStreamMessage } from '@/utils/csv-importer'

export const Route = createFileRoute('/api/__protected/import/process')({
    server: {
        handlers: {
            POST: async ({ request, context }) => {
                const { filename, csvData } = await request.json()

                // Create a readable stream that will send progress events
                const encoder = new TextEncoder()
                const stream = new ReadableStream({
                    async start(controller) {
                        const send = async (obj: ImportStreamMessage) => {
                            controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
                        }

                        try {
                            await importData(context.db, csvData, filename, csvConfig, {
                                send,
                                end: () => controller.close(),
                                batchSize: 10,
                            })
                        } catch (err) {
                            await send({ type: 'error', error: String(err) })
                        }
                        controller.close()
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
