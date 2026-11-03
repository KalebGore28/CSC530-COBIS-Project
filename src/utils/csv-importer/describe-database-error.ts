/**
 * Pulls the database's own reason out of an error.
 * Drizzle wraps MySQL errors in "Failed query: <the whole statement> params: <every value>",
 * and the actual reason (like "Incorrect integer value: 'NULL' for column 'is_aacsb'") is on the cause.
 * @param error
 * @returns The reason, and which row of the insert it was about when MySQL says ("at row 2")
 */
export function describeDatabaseError(error: unknown): { reason: string; rowInBatch?: number } {
  const cause = error instanceof Error && error.cause !== undefined ? error.cause : error;
  const sqlMessage = (cause as { sqlMessage?: unknown } | null)?.sqlMessage;
  const reason =
    typeof sqlMessage === "string"
      ? sqlMessage
      : cause instanceof Error
        ? cause.message
        : String(cause);

  const rowMatch = / at row (\d+)$/.exec(reason);
  if (!rowMatch) return { reason };
  return { reason: reason.slice(0, rowMatch.index), rowInBatch: Number(rowMatch[1]) };
}
