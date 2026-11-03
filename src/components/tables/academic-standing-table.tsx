import { useDbClient } from "@tanstack/react-db";
import type { academicStanding } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";

type AcademicStanding = typeof academicStanding.$inferSelect;

const columns: Array<EditableColumnDef<AcademicStanding>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function AcademicStandingTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<AcademicStanding>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(academicStandingCollection);

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
