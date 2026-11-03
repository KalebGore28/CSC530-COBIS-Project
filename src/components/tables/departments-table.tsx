import { useDbClient } from "@tanstack/react-db";
import type { departments } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";

type Departments = typeof departments.$inferSelect;

const columns: Array<EditableColumnDef<Departments>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "college_id",
    header: "College ID",
    cell: ({ getValue }) => getValue() ?? "—",
  },
];

export function DepartmentsTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<Departments>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(departmentsCollection);

  return (
    <EditableDataTable
      columns={columns}
      data={data}
      editableColumns={{ description: "text", college_id: "college" }}
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
