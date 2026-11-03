import * as React from "react";
import {
  columnVisibilityFeature,
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ColumnDef, RowData, SortingState } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "cn";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type EnrollmentColumnDef<TData extends RowData> = ColumnDef<typeof features, TData> & {
  // Numbers line up on the right so they're easy to compare down a column
  meta?: { numeric?: boolean; hideOnMobile?: boolean };
};

interface EnrollmentTableProps<TData extends RowData> {
  columns: Array<EnrollmentColumnDef<TData>>;
  data: Array<TData>;
  initialSorting: SortingState;
  emptyMessage: string;
}

export function EnrollmentTable<TData extends RowData>({
  columns,
  data,
  initialSorting,
  emptyMessage,
}: EnrollmentTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    state: { sorting },
  });

  const columnClassName = (meta?: { numeric?: boolean; hideOnMobile?: boolean }) =>
    cn(meta?.numeric && "text-right tabular-nums", meta?.hideOnMobile && "max-md:hidden");

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = (header.column.columnDef as EnrollmentColumnDef<TData>).meta;
              const sorted = header.column.getIsSorted();
              const SortIcon =
                sorted === "asc"
                  ? ArrowUpIcon
                  : sorted === "desc"
                    ? ArrowDownIcon
                    : ArrowUpDownIcon;

              return (
                <TableHead
                  key={header.id}
                  className={columnClassName(meta)}
                  aria-sort={
                    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "hover:text-foreground inline-flex h-(--control-height-sm) items-center gap-1",
                      meta?.numeric && "flex-row-reverse",
                    )}
                  >
                    <table.FlexRender header={header} />
                    <SortIcon
                      className={cn("size-3.5", !sorted && "text-muted-foreground opacity-50")}
                    />
                  </button>
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={columnClassName(
                    (cell.column.columnDef as EnrollmentColumnDef<TData>).meta,
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
