import { useDbClient } from "@tanstack/react-db";
import type { coursePrefixes } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { coursePrefixesCollection } from "@/integrations/tanstack-db/course-prefixes";

type CoursePrefixes = typeof coursePrefixes.$inferSelect;

const columns: Array<EditableColumnDef<CoursePrefixes>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "department_id",
    header: "Department ID",
    cell: ({ getValue }) => getValue() ?? "—",
  },
  {
    accessorKey: "college_id",
    header: "College ID",
    cell: ({ getValue }) => getValue() ?? "—",
  },
];

export function CoursePrefixesTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<CoursePrefixes>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(coursePrefixesCollection);

  return (
    <EditableDataTable
      columns={columns}
      data={data}
      editableColumns={{ department_id: "department", college_id: "college" }}
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
