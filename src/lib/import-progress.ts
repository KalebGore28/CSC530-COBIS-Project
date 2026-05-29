import {
    experimental_streamedQuery as streamedQuery,
    queryOptions,
} from '@tanstack/react-query'

export type ProgressChunk = {
    processed: number
    total: number
    totalRows: number
    errorCount: number
    warningCount: number
    currentStep: string
    done?: boolean
    error?: string
}

async function* fetchImportProgress(
    importId: string,
): AsyncIterable<ProgressChunk> {
    const response = await fetch(`/api/import/${importId}/progress`)
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Server sends newline-delimited JSON chunks
        const lines = decoder.decode(value).split('\n').filter(Boolean)
        for (const line of lines) {
            yield JSON.parse(line) as ProgressChunk
        }
    }
}

export const importProgressQuery = (importId: string) =>
    queryOptions({
        queryKey: ['import-progress', importId],
        queryFn: streamedQuery({
            streamFn: () => fetchImportProgress(importId),
            // Keep a single "latest" chunk instead of accumulating all of them
            reducer: (_, chunk) => chunk,
            initialValue: {
                processed: 0,
                total: 0,
                totalRows: 0,
                errorCount: 0,
                warningCount: 0,
                currentStep: 'Starting...',
            } as ProgressChunk,
        }),
        enabled: !!importId,
    })
