import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle, TriangleAlert, Download } from "lucide-react";
import type { ProgressMessage, IssueMessage } from "@/routes/_authenticated/_layout/cobis-tools/_layout.import";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";


interface TableSummary {
    table: string;
    totalRows: number;
    currentRow: number;
    completed: boolean;
    message: string;
    warnings: IssueMessage[];
    errors: IssueMessage[];
}

interface ImportSummaryProps {
    progressMessages: ProgressMessage[];
    warnings: IssueMessage[];
    errors: IssueMessage[];
    isImporting: boolean;
}

/**
 * Summarizes import progress by table, showing progress, warnings, and errors.
 */
export function ImportSummary({
    progressMessages,
    warnings,
    errors,
    isImporting,
}: ImportSummaryProps) {
    // Reduce messages into latest state per table
    const tableSummaries: TableSummary[] = Object.values(
        progressMessages.reduce((acc, msg) => {
            if (!acc[msg.table]) {
                acc[msg.table] = {
                    table: msg.table,
                    totalRows: msg.totalRows,
                    currentRow: msg.currentRow,
                    completed: false,
                    message: msg.message,
                    warnings: [],
                    errors: [],
                };
            } else {
                acc[msg.table].currentRow = msg.currentRow;
                acc[msg.table].message = msg.message;
                acc[msg.table].completed = msg.currentRow >= msg.totalRows;
            }
            return acc;
        }, {} as Record<string, TableSummary>)
    );

    // Try to attach warnings/errors to the right table (best effort)
    // If no table context, attach to the last active one
    if (warnings.length > 0 || errors.length > 0) {
        const lastTable = tableSummaries[tableSummaries.length - 1]?.table;
        warnings.forEach((w) => {
            const target = tableSummaries.find((t) => w.message.includes(t.table)) ??
                tableSummaries.find((t) => t.table === lastTable);
            if (target) target.warnings.push(w);
        });
        errors.forEach((e) => {
            const target = tableSummaries.find((t) => e.message.includes(t.table)) ??
                tableSummaries.find((t) => t.table === lastTable);
            if (target) target.errors.push(e);
        });
    }


    return (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
            <ScrollArea className="flex-1 rounded-md border p-4 w-full h-full">
                <span className="mb-4 block text-sm font-medium">Import Progress by Table</span>
                <div className="space-y-4">
                    {tableSummaries.map((table) => {
                        const progress =
                            table.totalRows > 0
                                ? Math.min((table.currentRow / table.totalRows) * 100, 100)
                                : 0;
                        const Icon =
                            table.completed && table.errors.length === 0
                                ? CheckCircle2
                                : table.errors.length > 0
                                    ? AlertCircle
                                    : isImporting
                                        ? Loader2
                                        : TriangleAlert;

                        return (
                            <Card key={table.table} className="relative">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-semibold">
                                        {table.table}
                                    </CardTitle>
                                    <Icon
                                        className={`h-5 w-5 ${table.errors.length > 0
                                            ? "text-red-600"
                                            : table.warnings.length > 0
                                                ? "text-yellow-600"
                                                : table.completed
                                                    ? "text-green-600"
                                                    : isImporting
                                                        ? "text-blue-500 animate-spin"
                                                        : "text-muted-foreground"
                                            }`}
                                    />
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <Progress value={progress} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>
                                            {table.currentRow.toLocaleString()} /{" "}
                                            {table.totalRows.toLocaleString()} rows
                                        </span>
                                        <span>{table.message}</span>
                                    </div>

                                    {(table.warnings.length > 0 ||
                                        table.errors.length > 0) && (
                                            <div className="flex text-xs space-x-4">
                                                {table.warnings.length > 0 && (
                                                    <div className="text-yellow-700">
                                                        ⚠️ {table.warnings.length} warning
                                                        {table.warnings.length > 1 ? "s" : ""}
                                                    </div>
                                                )}
                                                {table.errors.length > 0 && (
                                                    <div className="text-red-700">
                                                        ❌ {table.errors.length} error
                                                        {table.errors.length > 1 ? "s" : ""}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {tableSummaries.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            Waiting for import data…
                        </p>
                    )}
                </div>
            </ScrollArea>

            {/* Right column: overall summary & issue stream */}
            <div className="flex flex-col h-full space-y-4">
                {/* Overall Summary */}
                <Card className="border border-muted bg-muted/30 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Progress
                            value={
                                tableSummaries.length > 0
                                    ? (tableSummaries.filter((t) => t.completed).length /
                                        tableSummaries.length) *
                                    100
                                    : 0
                            }
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                {tableSummaries.filter((t) => t.completed).length}/
                                {tableSummaries.length} tables completed
                            </span>
                            <span>
                                ⚠️{" "}
                                {tableSummaries.reduce(
                                    (sum, t) => sum + t.warnings.length,
                                    0
                                )}{" "}
                                · ❌{" "}
                                {tableSummaries.reduce(
                                    (sum, t) => sum + t.errors.length,
                                    0
                                )}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full flex items-center gap-2"
                            onClick={() => {
                                const logData = {
                                    warnings: warnings.slice(0, 5000),
                                    errors: errors.slice(0, 5000),
                                    summary: {
                                        tablesCompleted: tableSummaries.filter((t) => t.completed).length,
                                        totalTables: tableSummaries.length,
                                        totalWarnings: warnings.length,
                                        totalErrors: errors.length,
                                    },
                                };
                                const blob = new Blob([JSON.stringify(logData, null, 2)], {
                                    type: "application/json",
                                });
                                saveAs(blob, `import-logs-${new Date().toISOString()}.json`);
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Download Logs
                        </Button>
                    </CardFooter>
                </Card>

                {/* Live stream of issues */}
                <Card className="flex-1 border border-muted bg-background/60 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Issues Stream</CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100%-2rem)] px-4">
                            {warnings.length === 0 && errors.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">
                                    No warnings or errors yet.
                                </p>
                            )}

                            {/* Combine + limit issue entries */}
                            {[...errors, ...warnings]
                                .slice(-100)
                                .reverse()
                                .map((issue, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-2 border-b py-2 text-xs ${issue.error
                                            ? "text-red-700 border-red-200/50"
                                            : "text-yellow-700 border-yellow-100/40"
                                            }`}
                                    >
                                        {issue.error ? (
                                            <AlertCircle className="h-4 w-4 text-red-500 mt-[1px]" />
                                        ) : (
                                            <TriangleAlert className="h-4 w-4 text-yellow-500 mt-[1px]" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{issue.message}</p>
                                            {issue.error && (
                                                <p className="text-[11px] text-muted-foreground">
                                                    {issue.error.slice(0, 300)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
