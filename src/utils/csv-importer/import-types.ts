export type ImportStreamMessage =
  | StartMessage
  | TableStartMessage
  | TableProgressMessage
  | TableCompleteMessage
  | RowProgressMessage
  | RowFailureMessage
  | CompleteMessage
  | LogMessage
  | ErrorMessage
  | WarningMessage;

type StartMessage = {
  type: "start";
  data: {
    message: string;
    totalTables: number;
  };
};

type TableStartMessage = {
  type: "table-start";
  data: {
    message: string;
    table: string;
    tableIndex: number;
    totalTables: number;
    totalRows?: number; // available if known early
  };
};

type TableProgressMessage = {
  type: "table-progress";
  data: {
    message: string;
    table: string;
    tableIndex: number;
    totalTables: number;
  };
};

type TableCompleteMessage = {
  type: "table-complete";
  data: {
    message: string;
    table: string;
    tableIndex: number;
    totalTables: number;
    totalRows: number;
  };
};

type RowProgressMessage = {
  type: "row-progress";
  data: {
    message: string;
    table: string;
    rowIndex: number;
    totalRows: number;
    tableIndex: number;
    totalTables: number;
  };
};

type RowFailureMessage = {
  type: "row-failure";
  data: {
    message: string;
    table: string;
    rowIndex: number;
    totalRows: number;
    tableIndex: number;
    totalTables: number;
  };
  error: string;
};

type CompleteMessage = {
  type: "complete";
  data: {
    message: string;
    totalTables: number;
  };
};

type LogMessage = {
  type: "log";
  data: {
    table: string;
    rowIndex: number;
    message: string;
    meta?: Record<string, unknown>;
  };
};

type WarningMessage = {
  type: "warning";
  data: {
    message: string;
    table: string;
    rowIndex: number;
    meta?: Record<string, unknown>;
  };
};

type ErrorMessage = {
  type: "error";
  error: string;
  data: {
    table: string;
    rowIndex: number;
    meta?: Record<string, unknown>;
  };
};
