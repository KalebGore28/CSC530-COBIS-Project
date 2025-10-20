// src/hooks/use-import.ts
import { useMutation } from '@tanstack/react-query'
import type { ParseResult } from 'papaparse'

interface ImportPayload {
    filename: string
    csvData: ParseResult<Record<string, string>> // full PapaParse result
}

interface ImportResponse {
    success?: boolean
    error?: string
}

export function useImport() {
    return useMutation<ImportResponse, Error, ImportPayload>({
        mutationFn: async ({ filename, csvData }) => {
            const response = await fetch('/api/import/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, csvData }),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Import failed: ${text}`)
            }

            return response.json() as Promise<ImportResponse>
        },
    })
}
