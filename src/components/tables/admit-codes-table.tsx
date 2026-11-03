import { useDbClient } from "@tanstack/react-db";
import type { admitCodes } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";

type AdmitCodes = typeof admitCodes.$inferSelect;

const columns: Array<EditableColumnDef<AdmitCodes>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function AdmitCodesTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<AdmitCodes>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(admitCodesCollection);

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
