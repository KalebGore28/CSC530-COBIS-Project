import { useDbClient } from "@tanstack/react-db";
import type { registrationStatus } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";

type RegistrationStatus = typeof registrationStatus.$inferSelect;

const columns: Array<EditableColumnDef<RegistrationStatus>> = [
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
      editableColumns={{ description: "text" }}
      onSave={(ids, changes) => {
        collection.update(ids, (drafts) => {
          drafts.forEach((draft) => Object.assign(draft, changes));
        });
      }}
      initialFilterColumn={filterColumn}
      initialFilterValue={filterValue}
    />
  );
}
