import {
  columnVisibilityFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ColumnDef, RowData } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = tableFeatures({ columnVisibilityFeature, rowSelectionFeature });

export type DataTableColumnDef<TData extends RowData> = ColumnDef<typeof features, TData>;

interface DataTableProps<TData extends RowData> {
  columns: Array<DataTableColumnDef<TData>>;
  data: Array<TData>;
  onRowSelect?: (row: TData) => void;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onRowSelect,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    enableRowSelection: true,
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={onRowSelect ? "cursor-pointer" : ""}
                onClick={() => {
                  row.toggleSelected();
                  onRowSelect?.(row.original);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
