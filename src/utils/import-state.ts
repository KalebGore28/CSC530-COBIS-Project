export type ImportState = {
    // Progress metrics (sent to client)
    processed: number
    total: number
    totalRows: number
    errorCount: number
    warningCount: number
    currentStep: string // Latest human-readable message

    // Internal streaming
    controller: ReadableStreamDefaultController | null
    status: 'processing' | 'done' | 'failed'
}

// Global in-memory store for active imports
const activeImports = new Map<string, ImportState>()

/**
 * Initialize an import state when processing starts
 */
export function initializeImportState(importId: string): ImportState {
    const state: ImportState = {
        processed: 0,
        total: 0,
        totalRows: 0,
        errorCount: 0,
        warningCount: 0,
        currentStep: 'Starting import...',
        controller: null,
        status: 'processing',
    }
    activeImports.set(importId, state)
    return state
}

/**
 * Update import state and send to connected client
 */
export function updateImportState(
    importId: string,
    updates: Partial<Omit<ImportState, 'controller' | 'status'>>,
): void {
    const state = activeImports.get(importId)
    if (!state) return

    // Apply updates
    Object.assign(state, updates)

    // Stream to client if connected
    if (state.controller) {
        const chunk = JSON.stringify({
            processed: state.processed,
            total: state.total,
            totalRows: state.totalRows,
            errorCount: state.errorCount,
            warningCount: state.warningCount,
            currentStep: state.currentStep,
        })
        state.controller.enqueue(chunk + '\n')
    }
}

/**
 * Mark import as complete and clean up after delay
 */
export function completeImportState(importId: string): void {
    const state = activeImports.get(importId)
    if (!state) return

    state.status = 'done'
    state.currentStep = 'Import complete'

    // Send final update
    if (state.controller) {
        const chunk = JSON.stringify({
            processed: state.processed,
            total: state.total,
            totalRows: state.totalRows,
            errorCount: state.errorCount,
            warningCount: state.warningCount,
            currentStep: state.currentStep,
            done: true,
        })
        state.controller.enqueue(chunk + '\n')
        state.controller.close()
    }

    // Clean up after 5 minutes
    setTimeout(() => {
        activeImports.delete(importId)
    }, 5 * 60 * 1000)
}

/**
 * Mark import as failed
 */
export function failImportState(importId: string, error: string): void {
    const state = activeImports.get(importId)
    if (!state) return

    state.status = 'failed'
    state.currentStep = `Failed: ${error}`

    // Send error to client
    if (state.controller) {
        const chunk = JSON.stringify({
            processed: state.processed,
            total: state.total,
            totalRows: state.totalRows,
            errorCount: state.errorCount,
            warningCount: state.warningCount,
            currentStep: state.currentStep,
            error,
            done: true,
        })
        state.controller.enqueue(chunk + '\n')
        state.controller.close()
    }

    // Clean up after 5 minutes
    setTimeout(() => {
        activeImports.delete(importId)
    }, 5 * 60 * 1000)
}

/**
 * Get current state for an import
 */
export function getImportState(importId: string): ImportState | undefined {
    return activeImports.get(importId)
}

/**
 * Attach a ReadableStream controller to an import state
 */
export function attachStreamController(
    importId: string,
    controller: ReadableStreamDefaultController,
): void {
    const state = activeImports.get(importId)
    if (state) {
        state.controller = controller
    }
}
