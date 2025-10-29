import { useMutation } from '@tanstack/react-query'
import type { ParseResult } from 'papaparse'

interface ImportPayload {
    filename: string
    csvData: ParseResult<Record<string, string>>
}

interface ImportProgress {
    type: string
    data?: any
    error?: string
}

interface ImportResult {
    success?: boolean
    error?: string
}

export function useImport(onProgress?: (event: ImportProgress) => void) {
    return useMutation<ImportResult, Error, ImportPayload>({
        mutationFn: async ({ filename, csvData }) => {
            const response = await fetch('/api/import/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, csvData }),
            })

            if (!response.ok) {
                throw new Error(`Import failed: ${response.statusText}`)
            }

            // --- Stream the progress ---
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No readable stream in response')

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })

                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // keep incomplete chunk

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const event: ImportProgress = JSON.parse(line)
                        onProgress?.(event)
                    } catch {
                        console.warn('Bad JSON line:', line)
                    }
                }
            }

            // Wait for a final completion event (optional)
            return { success: true }
        },
    })
}
