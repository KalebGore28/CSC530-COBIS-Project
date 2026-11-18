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
import { Link, useRouter, type AnyRouter, type LinkOptions } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "cn";

import {
  Table,
  TableBody,
  TableCaption,
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

export type SortableColumnDef<TData extends RowData> = ColumnDef<typeof features, TData> & {
  // Numbers line up on the right so they're easy to compare down a column
  meta?: { numeric?: boolean; hideOnMobile?: boolean };
};

interface SortableTableProps<TData extends RowData> {
  columns: Array<SortableColumnDef<TData>>;
  data: Array<TData>;
  initialSorting: SortingState;
  emptyMessage: string;
  // Names the table for screen readers, like a heading does for a section. Not shown on screen.
  caption: string;
  /**
   * Makes each row open a page. The cell in `column` becomes a real link, which keyboard, screen
   * reader, and "open in new tab" users get, and clicking anywhere else in the row follows it too.
   */
  rowLink?: {
    column: string;
    // Build it with linkOptions() so the route and its params are checked where it's written
    to: (row: TData) => LinkOptions<AnyRouter, string, string>;
  };
  // Extra classes for some rows, like fading ones that matter less
  rowClassName?: (row: TData) => string | undefined;
}

export function SortableTable<TData extends RowData>({
  columns,
  data,
  initialSorting,
  emptyMessage,
  caption,
  rowLink,
  rowClassName,
}: SortableTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const router = useRouter();

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
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = (header.column.columnDef as SortableColumnDef<TData>).meta;
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
            <TableRow
              key={row.id}
              className={cn(
                rowLink && "cursor-pointer has-[a:focus-visible]:bg-muted/50",
                rowClassName?.(row.original),
              )}
              // A mouse shortcut for the row's link, so the whole row can be clicked. Keyboard and
              // screen reader users get the real link in the row, so the row itself isn't focusable.
              // (A link stretched over the row with ::after was avoided: Safari long ignored
              // position: relative on <tr>, which made every row's link cover the whole table.)
              onClick={
                rowLink
                  ? (event) => {
                      // The link handles its own clicks, including Cmd/Ctrl-click
                      if ((event.target as Element).closest("a")) return;
                      // Selecting text in a row shouldn't open it
                      if (window.getSelection()?.toString()) return;
                      const options = rowLink.to(row.original);
                      if (event.metaKey || event.ctrlKey) {
                        window.open(router.buildLocation(options).href, "_blank", "noopener");
                      } else {
                        void router.navigate(options);
                      }
                    }
                  : undefined
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={columnClassName(
                    (cell.column.columnDef as SortableColumnDef<TData>).meta,
                  )}
                >
                  {rowLink?.column === cell.column.id ? (
                    <Link
                      {...rowLink.to(row.original)}
                      className="underline-offset-4 hover:underline focus-visible:underline"
                    >
                      <table.FlexRender cell={cell} />
                    </Link>
                  ) : (
                    <table.FlexRender cell={cell} />
                  )}
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
