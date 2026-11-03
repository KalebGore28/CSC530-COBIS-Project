import { useDbClient } from "@tanstack/react-db";
import type { instructionalMethods } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { instructionalMethodsCollection } from "@/integrations/tanstack-db/instructional-methods";

type InstructionalMethods = typeof instructionalMethods.$inferSelect;

const columns: Array<EditableColumnDef<InstructionalMethods>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function InstructionalMethodsTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<InstructionalMethods>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(instructionalMethodsCollection);

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
