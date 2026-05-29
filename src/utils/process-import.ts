import { createWriteStream } from 'fs'
import { unlink, access } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import { eq } from 'drizzle-orm'

import { importJobs } from '@/db/schema'
import { importMySqlCSVFile } from '@/utils/csv-importer/import-csv-file'
import type { ImportStreamMessage } from '@/utils/csv-importer/import-types'
import { csvConfig } from '@/db/mapping-config'
import {
    initializeImportState,
    updateImportState,
    completeImportState,
    failImportState,
} from '@/utils/import-state'

/**
 * Process a CSV import job
 * Runs asynchronously in background
 * Updates in-memory state and log file as it progresses
 */
export async function processImport(
    importId: string,
    fileName: string,
    db: MySql2Database<any>,
): Promise<void> {
    const csvPath = join(tmpdir(), `${importId}.csv`)
    const logPath = join(tmpdir(), `${importId}.log`)

    let logStream: ReturnType<typeof createWriteStream> | null = null
    let totalRows = 0
    let errorCount = 0
    let warningCount = 0

    try {
        // Verify CSV exists
        await access(csvPath)

        // Initialize in-memory state
        initializeImportState(importId)

        // Update job status to processing
        await db
            .update(importJobs)
            .set({ status: 'processing' })
            .where(eq(importJobs.id, importId))

        // Create log file stream
        logStream = createWriteStream(logPath, { flags: 'a' })

        // Process the import with progress callbacks
        await importMySqlCSVFile(db, csvPath, fileName, csvConfig, {
            send: (msg: ImportStreamMessage) => {
                // Write every message to log file
                logStream?.write(JSON.stringify(msg) + '\n')

                // Update metrics
                if (msg.type === 'row-progress') {
                    totalRows = msg.data.totalRows
                } else if (msg.type === 'error') {
                    errorCount++
                } else if (msg.type === 'warning') {
                    warningCount++
                }

                // Determine current step message
                let currentStep = 'Processing...'
                if (msg.type === 'table-start') {
                    currentStep = `Processing ${msg.data.table}...`
                } else if (msg.type === 'table-complete') {
                    currentStep = `Completed ${msg.data.table} (${msg.data.totalRows} rows)`
                } else if (msg.type === 'error') {
                    currentStep = `Error: ${msg.error.substring(0, 100)}`
                } else if (msg.type === 'complete') {
                    currentStep = 'Import complete'
                }

                // Update in-memory state for streaming
                updateImportState(importId, {
                    currentStep,
                    totalRows,
                    errorCount,
                    warningCount,
                })
            },
            end: () => {
                // Close log stream when done
                logStream?.end()
            },
        })

        // Delete CSV file (keep logs for download)
        await unlink(csvPath).catch(() => {
            /* ignore if already deleted */
        })

        // Update database with final status
        await db
            .update(importJobs)
            .set({
                status: 'done',
                totalRows,
                errorCount,
                warningCount,
                completedAt: new Date(),
            })
            .where(eq(importJobs.id, importId))

        // Mark import as complete in memory
        completeImportState(importId)
    } catch (error) {
        // Log error
        const errorMsg = error instanceof Error ? error.message : String(error)
        logStream?.write(
            JSON.stringify({
                type: 'error',
                error: errorMsg,
                data: { table: '', rowIndex: 0 },
            }) + '\n',
        )
        logStream?.end()

        // Update database
        await db
            .update(importJobs)
            .set({
                status: 'failed',
                error: errorMsg,
                completedAt: new Date(),
            })
            .where(eq(importJobs.id, importId))

        // Mark as failed in memory
        failImportState(importId, errorMsg)

        // Clean up CSV
        await unlink(csvPath).catch(() => {
            /* ignore */
        })

        console.error(`Import ${importId} failed:`, error)
    }
}
