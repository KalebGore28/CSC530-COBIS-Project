import { Button } from "../ui/button";
import type { ImportStreamMessage } from "@/utils/csv-importer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  messages: Array<ImportStreamMessage>;
};

type LogMessage = {
  type: "log" | "warning" | "error";
  message: string;
};

export function ImportProgressList({ messages }: Props) {
  const tables = buildTableProgress(messages);

  const allLogs = Object.entries(tables).flatMap(([tableName, table]) =>
    (table.logMessages || []).map((logMsg) => ({
      ...logMsg,
      tableName,
    })),
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <span className="text-lg font-medium">Table Import Progress</span>
        {Object.entries(tables).map(([tableName, table]) => (
          <Card key={tableName} className="border">
            <CardHeader>
              <CardTitle>{table.tableName}</CardTitle>
              <CardDescription className="space-x-2">
                {/* Is Table Import Finished? */}
                {table.rowIndex >= table.totalRows ? (
                  <span className="font-medium text-green-600">Import Finished</span>
                ) : (
                  <span className="font-medium text-blue-600">Import In Progress</span>
                )}

                {/* Total rows imported minus failures */}
                <span>
                  {table.rowIndex - table.failureCount}/{table.totalRows} rows imported
                </span>

                {/* Percentage */}
                <span>
                  ({Math.round(((table.rowIndex - table.failureCount) / table.totalRows) * 100)}
                  %)
                </span>

                {/* Failures */}
                {table.failureCount > 0 && (
                  <span className="text-red-600"> {table.failureCount} failures</span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <span className="text-lg font-medium">Logs & Issues</span>

        <Card className="border p-0">
          <CardContent className="p-1">
            <Button
              onClick={() => {
                const logContent =
                  allLogs.length > 0
                    ? allLogs
                        .map(
                          (log) => `[${log.type.toUpperCase()}] ${log.tableName}: ${log.message}`,
                        )
                        .join("\n")
                    : "No logs or issues.";

                const blob = new Blob([logContent], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `logs_${new Date().toISOString().replace(/[:.]/g, "-")}.log`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="w-full"
            >
              Download All Logs
            </Button>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {(() => {
                return allLogs.length > 0 ? (
                  allLogs.map((logMsg, index) => (
                    <div
                      key={index}
                      className={
                        logMsg.type === "error"
                          ? "text-red-600"
                          : logMsg.type === "warning"
                            ? "text-yellow-600"
                            : "text-gray-800"
                      }
                    >
                      [{logMsg.type.toUpperCase()}] {logMsg.tableName}: {logMsg.message}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No logs or issues.</div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function buildTableProgress(messages: Array<ImportStreamMessage>) {
  const tables: Record<
    string,
    {
      tableName: string;
      rowIndex: number;
      totalRows: number;
      tableIndex: number;
      totalTables: number;
      logMessages?: Array<LogMessage>;
      failureCount: number;
    }
  > = {};

  for (const msg of messages) {
    switch (msg.type) {
      case "table-start":
        tables[msg.data.table] = {
          tableName: msg.data.table,
          rowIndex: 0,
          totalRows: msg.data.totalRows ?? 0,
          tableIndex: msg.data.tableIndex,
          totalTables: msg.data.totalTables,
          failureCount: 0,
        };
        break;

      case "row-progress":
        // Initialize table entry if it doesn't exist
        if (!tables[msg.data.table]) {
          tables[msg.data.table] = {
            tableName: msg.data.table,
            rowIndex: 0,
            totalRows: msg.data.totalRows,
            tableIndex: msg.data.tableIndex,
            totalTables: msg.data.totalTables,
            failureCount: 0,
          };
        }

        tables[msg.data.table].rowIndex = msg.data.rowIndex;
        tables[msg.data.table].totalRows = msg.data.totalRows;
        break;
      case "row-failure":
        // Initialize table entry if it doesn't exist
        if (!tables[msg.data.table]) {
          tables[msg.data.table] = {
            tableName: msg.data.table,
            rowIndex: 0,
            totalRows: msg.data.totalRows,
            tableIndex: msg.data.tableIndex,
            totalTables: msg.data.totalTables,
            failureCount: 0,
          };
        }

        tables[msg.data.table].rowIndex = msg.data.rowIndex;
        tables[msg.data.table].totalRows = msg.data.totalRows;

        if (!tables[msg.data.table].logMessages) {
          tables[msg.data.table].logMessages = [];
        }

        tables[msg.data.table].logMessages?.push({
          type: "error",
          message: msg.error,
        });
        tables[msg.data.table].failureCount++;
        break;

      case "table-complete":
        if (!tables[msg.data.table]) break;

        tables[msg.data.table].rowIndex = msg.data.totalRows;
        tables[msg.data.table].totalRows = msg.data.totalRows;
        break;

      case "warning":
        if (!tables[msg.data.table]) break;

        if (!tables[msg.data.table].logMessages) {
          tables[msg.data.table].logMessages = [];
        }

        tables[msg.data.table].rowIndex = msg.data.rowIndex;
        tables[msg.data.table].logMessages?.push({
          type: "warning",
          message: msg.data.message,
        });
        break;

      case "error":
        if (!tables[msg.data.table]) break;

        if (!tables[msg.data.table].logMessages) {
          tables[msg.data.table].logMessages = [];
        }

        tables[msg.data.table].rowIndex = msg.data.rowIndex;
        tables[msg.data.table].logMessages?.push({
          type: "error",
          message: msg.error,
        });
        break;

      case "log":
        if (!tables[msg.data.table]) break;

        if (!tables[msg.data.table].logMessages) {
          tables[msg.data.table].logMessages = [];
        }

        tables[msg.data.table].rowIndex = msg.data.rowIndex;
        tables[msg.data.table].logMessages?.push({
          type: "log",
          message: msg.data.message,
        });
        break;

      default:
        return {};
    }
  }

  return tables;
}
