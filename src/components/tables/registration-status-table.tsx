import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { useDbClient } from "@tanstack/react-db";
import type { registrationStatus } from "@/db/schema";
import { Checkbox } from "@/components/ui/checkbox";

type RegistrationStatus = typeof registrationStatus.$inferSelect;

import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";

const columns: Array<EditableColumnDef<RegistrationStatus>> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function RegistrationStatusTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<RegistrationStatus>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(registrationStatusCollection);

  return (
    <EditableDataTable
      columns={columns}
      data={data}
      initialFilterColumn={filterColumn}
      initialFilterValue={filterValue}
      onBulkEdit={(selectedIds, _column, value) => {
        // Update all selected rows
        collection.update(selectedIds, (drafts) => {
          drafts.forEach((draft) => {
            draft.description = value;
          });
        });
      }}
    />
  );
}
