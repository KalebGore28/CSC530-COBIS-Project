import { useDbClient } from "@tanstack/react-db";
import type { colleges } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";

type College = typeof colleges.$inferSelect;

const columns: Array<EditableColumnDef<College>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function CollegeTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<College>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(collegesCollection);

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
