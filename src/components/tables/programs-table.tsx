import { useDbClient } from "@tanstack/react-db";
import type { programs } from "@/db/schema";
import { EditableDataTable } from "./editable-data-table";
import type { EditableColumnDef } from "./editable-data-table";
import { programsCollection } from "@/integrations/tanstack-db/programs";

type Programs = typeof programs.$inferSelect;

const columns: Array<EditableColumnDef<Programs>> = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "is_major",
    header: "Major",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "is_minor",
    header: "Minor",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "has_concentration",
    header: "Has Concentration",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "is_discontinued",
    header: "Is Discontinued",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "is_aacsb",
    header: "AACSB",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
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
    accessorKey: "coordinator",
    header: "Coordinator M#",
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

export function ProgramsTable({
  data,
  filterColumn,
  filterValue,
}: {
  data: Array<Programs>;
  filterColumn: string | undefined;
  filterValue: string | undefined;
}) {
  const collection = useDbClient().collection(programsCollection);

  return (
    <EditableDataTable
      columns={columns}
      data={data}
      editableColumns={{
        description: "text",
        is_major: "boolean",
        is_minor: "boolean",
        has_concentration: "boolean",
        is_discontinued: "boolean",
        is_aacsb: "boolean",
        department_id: "department",
        college_id: "college",
        coordinator: "text",
      }}
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
