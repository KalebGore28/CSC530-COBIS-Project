import { createWriteStream } from 'fs'
import { unlink, access } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import { eq } from 'drizzle-orm'

import { importJobs } from '@/db/schema'
import { importMySqlCSVFile } from '@/utils/csv-importer/import-csv-file'
import { csvConfig } from '@/db/mapping-config'
import {
    initializeImportState,
    updateImportState,
    completeImportState,
    failImportState,
    getImportState,
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

        // Process the import with simple progress callback
        await importMySqlCSVFile(db, csvPath, fileName, csvConfig, (progress) => {
            // Write progress to log file
            const timestamp = new Date().toISOString()
            logStream?.write(
                JSON.stringify({
                    timestamp,
                    ...progress,
                }) + '\n',
            )

            // Update in-memory state for streaming to client
            updateImportState(importId, {
                processed: progress.processed,
                totalRows: progress.totalRows,
                currentStep: progress.currentStep,
            })
        })

        // Close log stream
        logStream?.end()

        // Delete CSV file (keep logs for download)
        await unlink(csvPath).catch(() => {
            /* ignore if already deleted */
        })

        // Get final metrics from in-memory state
        const finalState = getImportState(importId)
        const totalRows = finalState?.totalRows || 0

        // Update database with final status
        await db
            .update(importJobs)
            .set({
                status: 'done',
                totalRows,
                completedAt: new Date(),
            })
            .where(eq(importJobs.id, importId))

        // Mark import as complete in memory
        completeImportState(importId)
    } catch (error) {
        // Log full error to file and database
        const errorMsg = error instanceof Error ? error.message : String(error)
        const timestamp = new Date().toISOString()

        logStream?.write(
            JSON.stringify({
                timestamp,
                error: errorMsg,
                currentStep: 'Import failed',
            }) + '\n',
        )
        logStream?.end()

        // Update database with full error
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
