import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { importJobs } from '@/db/schema'
import { getImportState, attachStreamController } from '@/utils/import-state'

export const Route = createFileRoute(
    '/api/__protected/import/$importId/progress',
)({
    server: {
        handlers: {
            GET: async ({ params, context }) => {
                const { importId } = params

                // Check if import is active in memory
                const state = getImportState(importId)

                if (state) {
                    // Check if import is already complete
                    if (state.status === 'done' || state.status === 'failed') {
                        // Send final status and close immediately
                        const finalChunk = {
                            processed: state.processed,
                            total: state.total,
                            totalRows: state.totalRows,
                            errorCount: state.errorCount,
                            warningCount: state.warningCount,
                            currentStep: state.currentStep,
                            done: true,
                            error: state.error, // Use stored error message
                        }

                        const stream = new ReadableStream({
                            start(controller) {
                                controller.enqueue(
                                    JSON.stringify(finalChunk) + '\n',
                                )
                                controller.close()
                            },
                        })

                        return new Response(stream, {
                            headers: {
                                'Content-Type': 'text/plain',
                                'Cache-Control': 'no-cache',
                            },
                        })
                    }

                    // Import is actively processing - stream live updates
                    const stream = new ReadableStream({
                        start(controller) {
                            // Attach controller to state so updates can be sent
                            attachStreamController(importId, controller)

                            // Send current state immediately
                            const chunk = JSON.stringify({
                                processed: state.processed,
                                total: state.total,
                                totalRows: state.totalRows,
                                errorCount: state.errorCount,
                                warningCount: state.warningCount,
                                currentStep: state.currentStep,
                            })
                            controller.enqueue(chunk + '\n')

                            // Stream will be updated by processImport callbacks
                        },
                        cancel() {
                            // Client disconnected - controller will be cleaned up
                        },
                    })

                    return new Response(stream, {
                        headers: {
                            'Content-Type': 'text/plain',
                            'Cache-Control': 'no-cache',
                            Connection: 'keep-alive',
                        },
                    })
                }

                // Not in memory - check database for final status
                const [job] = await context.db
                    .select()
                    .from(importJobs)
                    .where(eq(importJobs.id, importId))
                    .limit(1)

                if (!job) {
                    return new Response(
                        JSON.stringify({ error: 'Import not found' }),
                        {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                // Job exists but not in memory - send final status
                const finalStatus = {
                    processed: job.totalRows || 0,
                    total: job.totalRows || 0,
                    totalRows: job.totalRows || 0,
                    errorCount: job.errorCount || 0,
                    warningCount: job.warningCount || 0,
                    currentStep:
                        job.status === 'done'
                            ? 'Import complete'
                            : job.status === 'failed'
                              ? 'Import failed' // Generic message, full error in error field
                              : 'Waiting to start...',
                    done: job.status === 'done' || job.status === 'failed',
                    error: job.status === 'failed' ? job.error : undefined,
                }

                // Return single chunk with final status
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(JSON.stringify(finalStatus) + '\n')
                        controller.close()
                    },
                })

                return new Response(stream, {
                    headers: {
                        'Content-Type': 'text/plain',
                        'Cache-Control': 'no-cache',
                    },
                })
            },
        },
    },
})
