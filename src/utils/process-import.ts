import { createWriteStream } from "fs";
import { unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { DrizzleQueryError, eq } from "drizzle-orm";

import { importJobs } from "@/db/schema";
import { importMySqlCSVFile } from "@/utils/csv-importer/import-csv-file";
import { describeDatabaseError } from "@/utils/csv-importer/describe-database-error";
import { csvConfig } from "@/db/mapping-config";
import {
  initializeImportState,
  updateImportState,
  completeImportState,
  failImportState,
  getImportState,
} from "@/utils/import-state";

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
  const csvPath = join(tmpdir(), `${importId}.csv`);
  const logPath = join(tmpdir(), `${importId}.log`);

  let logStream: ReturnType<typeof createWriteStream> | null = null;
  const startedAt = Date.now();

  // One readable line per entry, like "2026-11-03T05:09:20.338Z  INFO   programs: wrote 1,028 rows in 0.4s"
  const writeLogLine = (level: "info" | "error", message: string) => {
    logStream?.write(`${new Date().toISOString()}  ${level.toUpperCase().padEnd(5)}  ${message}\n`);
  };

  // Set up before the first await, so the state exists by the time the upload responds and the client asks for progress
  initializeImportState(importId);

  try {
    // Verify CSV exists
    await access(csvPath);

    // Update job status to processing
    await db.update(importJobs).set({ status: "processing" }).where(eq(importJobs.id, importId));

    // Create log file stream
    logStream = createWriteStream(logPath, { flags: "a" });

    // Progress only goes to the page watching the import, and the log keeps what's worth reading afterwards
    await importMySqlCSVFile(
      db,
      csvPath,
      fileName,
      csvConfig,
      (progress) => {
        updateImportState(importId, {
          processed: progress.processed,
          totalRows: progress.totalRows,
          percent: progress.percent,
          currentStep: progress.currentStep,
        });
      },
      (entry) => writeLogLine(entry.level, entry.message),
    );

    // Delete CSV file (keep logs for download)
    await unlink(csvPath).catch(() => {
      /* ignore if already deleted */
    });

    // Get final metrics from in-memory state
    const finalState = getImportState(importId);
    const totalRows = finalState?.totalRows || 0;

    writeLogLine(
      "info",
      `Import complete: ${totalRows.toLocaleString()} rows in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
    );
    logStream?.end();

    // Update database with final status
    await db
      .update(importJobs)
      .set({
        status: "done",
        totalRows,
        completedAt: new Date(),
      })
      .where(eq(importJobs.id, importId));

    // Mark import as complete in memory
    completeImportState(importId);
  } catch (error) {
    // A database error the importer didn't catch is still drizzle's whole "Failed query" text, so show its reason instead
    const errorMsg =
      error instanceof DrizzleQueryError
        ? describeDatabaseError(error).reason
        : error instanceof Error
          ? error.message
          : String(error);

    writeLogLine("error", `Import failed: ${errorMsg}`);
    logStream?.end();

    // Update database with full error
    await db
      .update(importJobs)
      .set({
        status: "failed",
        error: errorMsg,
        completedAt: new Date(),
      })
      .where(eq(importJobs.id, importId));

    // Mark as failed in memory
    failImportState(importId, errorMsg);

    // Clean up CSV
    await unlink(csvPath).catch(() => {
      /* ignore */
    });

    console.error(`Import ${importId} failed:`, error);
  }
}
