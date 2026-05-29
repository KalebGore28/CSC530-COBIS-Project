export type ImportState = {
    // Progress metrics (sent to client)
    processed: number
    total: number
    errorCount: number
    warningCount: number
    currentStep: string // Latest human-readable message

    // Internal streaming
    controller: ReadableStreamDefaultController | null
    status: 'processing' | 'done' | 'failed'
}
