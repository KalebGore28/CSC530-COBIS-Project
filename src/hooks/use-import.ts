import {
    queryOptions,
    experimental_streamedQuery as streamedQuery,
} from '@tanstack/react-query'
import type { ParseResult } from 'papaparse'
import type { ImportStreamMessage } from '@/utils/csv-importer'

interface ImportProps {
    filename: string
    csvData: ParseResult<Record<string, string>>
}

async function importFetch({
    filename,
    csvData,
}: ImportProps): Promise<AsyncIterable<ImportStreamMessage>> {
    const response = await fetch('/api/import/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, csvData }),
    })

    if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
        throw new Error('No response body')
    }

    return {
        async *[Symbol.asyncIterator]() {
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })

                for (const line of chunk.split('\n')) {
                    if (!line.trim()) continue
                    yield JSON.parse(line) as ImportStreamMessage
                }
            }
        },
    }
}

export const importQueryOptions = ({ filename, csvData }: ImportProps) =>
    queryOptions({
        queryKey: ['import', filename, csvData],
        queryFn: streamedQuery({
            streamFn: () => importFetch({ filename, csvData }),
            refetchMode: 'append',
        }),
        staleTime: Infinity,
        enabled: false,
    })
