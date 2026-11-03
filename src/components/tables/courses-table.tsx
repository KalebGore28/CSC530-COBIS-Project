import { useDbClient } from "@tanstack/react-db";
import type { courses } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { coursesCollection } from "@/integrations/tanstack-db/courses";

type Courses = typeof courses.$inferSelect;

const columns: Array<EditableColumnDef<Courses>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    accessorKey: "suffix",
    header: "Suffix",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "hours",
    header: "Hours",
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
  {
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? new Date(value as string | number | Date).toLocaleDateString() : "—";
    },
  },
];

export function CoursesTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<Courses>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(coursesCollection);

  return (
    <EditableDataTable
      columns={columns}
      data={data}
      editableColumns={{ title: "text", department_id: "department", college_id: "college" }}
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
