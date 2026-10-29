import { useState } from "react";
import { ilike, or, useLiveQuery } from "@tanstack/react-db";
import type { ProvisionState } from "../user-modal";
import type { departments } from "@/db/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { departmentsCollection } from "@/integrations/tanstack-db/departments";

type Department = typeof departments.$inferSelect;

interface DepartmentSelectorProps {
  provisionParams?: ProvisionState;
  setProvisionParams?: (params: ProvisionState) => void;
}
export function DepartmentSelector({
  provisionParams,
  setProvisionParams,
}: DepartmentSelectorProps) {
  const [query, setQuery] = useState("");

  const selected = provisionParams?.department;

  const { data: filteredDepartments, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ departments: departmentsCollection })
        .where(({ departments }) =>
          or(ilike(departments.id, `%${query}%`), ilike(departments.description, `%${query}%`)),
        )
        .orderBy(({ departments }) => departments.id, "asc")
        .limit(query !== "" ? 10 : 0),
    [query], // Re-run when query changes
  );

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  if (selected) {
    return (
      <div className="bg-muted/30 flex items-center justify-between gap-2 rounded-md border px-3 py-2">
        <div>
          <strong>{selected.id}</strong> — {selected.description}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setProvisionParams &&
              setProvisionParams({
                ...provisionParams,
                department: null,
              });
            setQuery("");
          }}
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="align-center flex space-x-2">
        <Input
          placeholder="Search departments..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        {/* {!selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setProvisionParams && setProvisionParams({
                                ...provisionParams!,
                                department: null,
                            });
                            setQuery("");
                        }}
                    >
                        Undo
                    </Button>
                )} */}
      </div>
      <DepartmentResults
        filteredDepartments={filteredDepartments}
        onSelect={(dept) => {
          setProvisionParams &&
            setProvisionParams({
              ...provisionParams!,
              department: dept,
            });
          setQuery("");
        }}
      />
    </div>
  );
}

function DepartmentResults({
  filteredDepartments,
  onSelect,
}: {
  filteredDepartments: Array<Department>;
  onSelect: (dept: Department) => void;
}) {
  if (filteredDepartments.length === 0) return null;

  return (
    <ul className="divide-y rounded-md border">
      {filteredDepartments.map((dept) => (
        <li
          key={dept.id}
          className="hover:bg-accent/30 cursor-pointer px-3 py-1 transition-colors"
          onClick={() =>
            onSelect({
              id: dept.id,
              description: dept.description,
              college_id: null,
            })
          }
        >
          <strong>{dept.id}</strong> — {dept.description}
        </li>
      ))}
    </ul>
  );
}
