export type ImportState = {
  // Progress metrics (sent to client)
  processed: number;
  total: number;
  totalRows: number;
  percent: number; // Across every table the file updates, so it never passes 100
  errorCount: number;
  warningCount: number;
  currentStep: string; // Latest human-readable message
  error?: string; // Error message (only set when status is 'failed')

  // Internal streaming
  controller: ReadableStreamDefaultController | null;
  status: "processing" | "done" | "failed";
};

export type ProgressChunk = Omit<ImportState, "controller" | "status"> & { done?: boolean };

// Global in-memory store for active imports
const activeImports = new Map<string, ImportState>();

/**
 * The part of the state that gets streamed to the client
 */
export function toProgressChunk(state: ImportState): ProgressChunk {
  return {
    processed: state.processed,
    total: state.total,
    totalRows: state.totalRows,
    percent: state.percent,
    errorCount: state.errorCount,
    warningCount: state.warningCount,
    currentStep: state.currentStep,
    error: state.error,
    done: state.status === "done" || state.status === "failed",
  };
}

/**
 * Send a chunk to the connected client, if there still is one.
 * A client that left the page has cancelled its stream, and writing to it would throw inside the import,
 * so the import keeps going and only the stream is dropped.
 */
function sendToClient(state: ImportState, close: boolean): void {
  if (!state.controller) return;
  try {
    state.controller.enqueue(JSON.stringify(toProgressChunk(state)) + "\n");
    if (close) state.controller.close();
  } catch {
    state.controller = null;
  }
}

/**
 * Initialize an import state when processing starts
 */
export function initializeImportState(importId: string): ImportState {
  const state: ImportState = {
    processed: 0,
    total: 0,
    totalRows: 0,
    percent: 0,
    errorCount: 0,
    warningCount: 0,
    currentStep: "Starting import...",
    controller: null,
    status: "processing",
  };
  activeImports.set(importId, state);
  return state;
}

/**
 * Update import state and send to connected client
 */
export function updateImportState(
  importId: string,
  updates: Partial<Omit<ImportState, "controller" | "status">>,
): void {
  const state = activeImports.get(importId);
  if (!state) return;

  Object.assign(state, updates);
  sendToClient(state, false);
}

/**
 * Mark import as complete and clean up after delay
 */
export function completeImportState(importId: string): void {
  const state = activeImports.get(importId);
  if (!state) return;

  state.status = "done";
  state.currentStep = "Import complete";
  state.percent = 100;
  sendToClient(state, true);

  // Clean up after 5 minutes
  setTimeout(
    () => {
      activeImports.delete(importId);
    },
    5 * 60 * 1000,
  );
}

/**
 * Mark import as failed
 */
export function failImportState(importId: string, error: string): void {
  const state = activeImports.get(importId);
  if (!state) return;

  state.status = "failed";
  state.currentStep = "Import failed"; // Generic message, full error in error field
  state.error = error; // Store full error message
  sendToClient(state, true);

  // Clean up after 5 minutes
  setTimeout(
    () => {
      activeImports.delete(importId);
    },
    5 * 60 * 1000,
  );
}

/**
 * Get current state for an import
 */
export function getImportState(importId: string): ImportState | undefined {
  return activeImports.get(importId);
}

/**
 * Attach a ReadableStream controller to an import state
 */
export function attachStreamController(
  importId: string,
  controller: ReadableStreamDefaultController,
): void {
  const state = activeImports.get(importId);
  if (state) {
    state.controller = controller;
  }
}

/**
 * Forget the stream once its client disconnects
 */
export function detachStreamController(
  importId: string,
  controller: ReadableStreamDefaultController,
): void {
  const state = activeImports.get(importId);
  // Only if it's still this client's stream, since a newer tab may have attached its own since
  if (state?.controller === controller) {
    state.controller = null;
  }
}
