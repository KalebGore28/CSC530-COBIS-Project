import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { ImportStreamMessage } from "@/utils/csv-importer";

type Props = {
    messages: ImportStreamMessage[];
};

type LogMessage = {
    type: 'log' | 'warning' | 'error';
    message: string;
}

export function ImportProgressList({ messages }: Props) {
    const tables = buildTableProgress(messages);

    return (
        <div className="space-y-4">
            {Object.entries(tables).map(([tableName, table]) => (
                <Card key={tableName}>
                    <CardHeader>
                        <CardTitle>{table.tableName}</CardTitle>
                        <CardDescription>
                            {table.rowIndex}/{table.totalRows} rows imported
                            ({Math.round((table.rowIndex / table.totalRows) * 100)}%)
                        </CardDescription>
                        <CardContent>
                            <div className="space-y-2">
                                {table.logMessages?.map((logMsg, index) => (
                                    <div key={index} className={
                                        logMsg.type === 'error' ? 'text-red-600' :
                                        logMsg.type === 'warning' ? 'text-yellow-600' :
                                        'text-gray-800'
                                    }>
                                        [{logMsg.type.toUpperCase()}] {logMsg.message}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

function buildTableProgress(messages: ImportStreamMessage[]) {
    const tables: Record<
        string,
        {
            tableName: string;
            rowIndex: number;
            totalRows: number;
            tableIndex: number;
            totalTables: number;
            logMessages?: LogMessage[];
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
                    };
                }

                tables[msg.data.table].rowIndex = msg.data.rowIndex;
                tables[msg.data.table].totalRows = msg.data.totalRows;
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
                    type: 'warning',
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
                    type: 'error',
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
                    type: 'log',
                    message: msg.data.message,
                });
                break;

            default:
                break;
        }
    }

    return tables;
}

