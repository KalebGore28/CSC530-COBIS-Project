import { createFileRoute } from "@tanstack/react-router";
import { StudentFilters, FilterState } from "@/components/student-filter";
import {
  PaginatedTable,
  PaginatedTableSkeleton,
} from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCSV } from "@/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import React, { useState, Suspense, useEffect, useMemo } from "react";

// Relay imports
import type { studentLookupQuery, studentLookupQuery$data, StudentLookupInput } from "./__generated__/studentLookupQuery.graphql";
import {
  graphql,
  useLazyLoadQuery,
  useQueryLoader,
  usePreloadedQuery,
} from "react-relay";

type queryResponse = NonNullable<NonNullable<NonNullable<studentLookupQuery$data["lookupStudents"]>["students"]>[number]>;

const StudentLookupQuery = graphql`
  query studentLookupQuery(
    $filters: StudentLookupInput!
    $offset: Int!
    $limit: Int!
  ) {
    lookupStudents(filters: $filters, offset: $offset, limit: $limit) {
      students {
        mnumber
        first_name
        last_name
        email
      }
      totalCount
    }
  }
`;

const PAGE_LIMIT = 10;

export const Route = createFileRoute(
  "/_authenticated/_layout/student-lookup"
)({
  component: StudentLookup,
});

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 10 }) => (
  <Card className="w-full animate-pulse h-[600px]">
    <CardHeader className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-8 w-24" />
    </CardHeader>
    <CardContent>
      <PaginatedTableSkeleton
        columns={[
          { key: "mnumber", label: "MNumber" },
          { key: "first_name", label: "First Name" },
          { key: "last_name", label: "Last Name" },
          { key: "email", label: "Email" },
        ]}
        rowCount={rows}
        className="border"
      />
    </CardContent>
  </Card>
);

// ---------- Helpers ----------
const makePreHeader = (filters: FilterState): string[] => {
  const lines: string[] = [];

  if (filters.academicLevels.length) {
    lines.push(`Academic Levels,${filters.academicLevels.join("|")}`);
  }
  if (filters.gpaRange) {
    lines.push(`GPA,${filters.gpaRange[0]}-${filters.gpaRange[1]}`);
  }

  if (Object.keys(filters.programFilter).length) {
    const programLines = Object.entries(filters.programFilter)
      .map(([program, flags]) => {
        const flagsStr = [];
        if (flags.is_major) flagsStr.push("major");
        if (flags.is_minor) flagsStr.push("minor");
        return `${program} (${flagsStr.join(",")})`;
      })
      .join("|");
    lines.push(`Programs,${programLines}`);
  }

  if (Object.keys(filters.courseFilters).length) {
    const courseLines = Object.entries(filters.courseFilters)
      .map(([course, cf]) => {
        const flagsStr = [];
        if (cf.taken) flagsStr.push("taken");
        if (cf.gradeOperator) flagsStr.push(`grade ${cf.gradeOperator}`);
        if (cf.grade) flagsStr.push(`grade ${cf.grade}`);
        return `${course} (${flagsStr.join(",")})`;
      })
      .join("|");
    lines.push(`Courses,${courseLines}`);
  }

  lines.push(`Exported At,${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`);
  return lines;
};

// ---------- Main Route ----------
function StudentLookup() {
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);

  return (
    <div className="p-6">
      <StudentFilters
        onApplyFilters={setCurrentFilters}
        onResetFilters={() => setCurrentFilters(null)}
      />

      <div className="mt-6">
        <Suspense fallback={<SkeletonTable rows={PAGE_LIMIT} />}>
          {currentFilters ? (
            <StudentLookupContent filters={currentFilters} />
          ) : (
            <Card className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Select filters and click "Run Search" to view students.
              </p>
            </Card>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function StudentLookupContent({ filters }: { filters: FilterState }) {
  const filterInput: StudentLookupInput = {
    academicLevels: filters.academicLevels,
    gpaMin: filters.gpaRange ? filters.gpaRange[0] : undefined,
    gpaMax: filters.gpaRange ? filters.gpaRange[1] : undefined,
    program: filters.programFilter,
    course: filters.courseFilter
  }

  const data = useLazyLoadQuery<studentLookupQuery>(
    StudentLookupQuery,
    { filters: filterInput, offset: 0, limit: PAGE_LIMIT },
    { fetchPolicy: "store-or-network" }
  );

  // for export
  const [queryRef, loadQuery, _] =
    useQueryLoader<studentLookupQuery>(StudentLookupQuery);

  if (!data.lookupStudents?.students?.length) {
    return (
      <Card className="w-full text-center">
        <p className="text-sm text-muted-foreground">No students found.</p>
      </Card>
    );
  }

  const handleExportClick = () => {
    const total = data.lookupStudents?.totalCount ?? 0;
    loadQuery({
      filters: gqlFilters,
      offset: 0,
      limit: total,
    });
  };

  return (
    <Card className="w-full h-[600px]">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Student Lookup</h2>
        <Button variant="outline" onClick={handleExportClick}>
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </Button>
      </CardHeader>

      <CardContent>
        <PaginatedTable<queryResponse>
          className="border"
          data={[...data.lookupStudents.students]}
          columns={[
            { key: "mnumber", label: "MNumber" },
            { key: "first_name", label: "First Name" },
            { key: "last_name", label: "Last Name" },
            { key: "email", label: "Email", transform: (val) => val.toLowerCase() },
          ]}
          rowsPerPage={PAGE_LIMIT}
          totalRows={data.lookupStudents.totalCount}
          handlePreviousCallback={() =>
            setOffset((prev) => Math.max(prev - PAGE_LIMIT, 0))
          }
          handleNextCallback={() =>
            setOffset((prev) =>
              prev + PAGE_LIMIT < (data.lookupStudents?.totalCount ?? 0)
                ? prev + PAGE_LIMIT
                : prev
            )
          }
        />
      </CardContent>

      {/* when export query loads */}
      {queryRef && (
        <Suspense
          fallback={
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </Button>
          }
        >
          <ExportContent queryRef={queryRef} filters={filters} />
        </Suspense>
      )}
    </Card>
  );
};

// ---------- ExportContent ----------
function ExportContent({
  queryRef,
  filters,
}: {
  queryRef: any;
  filters: FilterState;
}) {
  const data = usePreloadedQuery<studentLookupQuery>(StudentLookupQuery, queryRef);

  useEffect(() => {
    if (!data?.lookupStudents?.students) return;

    exportToCSV<queryResponse>([...data.lookupStudents.students], {
      filename: `students_${format(new Date(), "yyyyMMdd_HHmmss")}`,
      fields: ["mnumber", "first_name", "last_name", "email"],
      headers: ["mnumber", "first_name", "last_name", "email"],
      // preHeader: makePreHeader(filters),
    });
  }, [data]);

  return null; // invisible component that performs side effect
}
