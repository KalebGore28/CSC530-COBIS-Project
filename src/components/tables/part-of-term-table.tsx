import { useDbClient } from "@tanstack/react-db";
import type { partOfTerm } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";

type PartOfTerm = typeof partOfTerm.$inferSelect;

const columns: Array<EditableColumnDef<PartOfTerm>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function PartOfTermTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<PartOfTerm>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(partOfTermCollection);

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
