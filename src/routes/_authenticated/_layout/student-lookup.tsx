import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StudentFilters, FilterState } from "@/components/student-filter";
import { PaginatedTable, PaginatedTableSkeleton } from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCSV } from "@/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


const StudentLookupQuery = graphql(`
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
`);

export const Route = createFileRoute("/_authenticated/_layout/student-lookup")({
  component: StudentLookup,
});

export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  return (
    <Card className="w-full animate-pulse h-[600px] mt-6">
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
}

// ---------- Helpers ----------
const makePreHeader = (filters: FilterState): string[] => {
  const lines: string[] = [];

  if (filters.academicLevels && filters.academicLevels.length) {
    lines.push(`Academic Levels,${filters.academicLevels.join("|")}`);
  }
  if (filters.gpaMin !== undefined && filters.gpaMax !== undefined) {
    lines.push(`GPA,${filters.gpaMin}-${filters.gpaMax}`);
  }

  if (filters.program) {
    const programLine = `${filters.program.code} - ${filters.program.is_major ? " (major)" : ""
      }${filters.program.is_minor ? " (minor)" : ""}`;
    lines.push(`Programs,${programLine}`);
  }

  if (filters.course) {
    const courseLine = `${filters.course.course_id} - ${filters.course.taken ? "Taken" : "Not Taken"
      } ${filters.course.operator ? filters.course.operator : ""
      } ${filters.course.grade ? filters.course.grade : ""}`;
    lines.push(`Courses,${courseLine}`);
  }

  lines.push(`Exported At,${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`);
  return lines;
};

function StudentLookup() {
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['studentLookupQuery', currentFilters, offset],
    queryFn: async () => execute(StudentLookupQuery, {
      filters: currentFilters || {
        academicLevels: [],
        gpaMax: 4.0,
        gpaMin: 0,
        programFilter: undefined,
        courseFilter: undefined,
      },
      offset: offset,
      limit: 10,
    }),
    enabled: !!currentFilters, // only run query if filters are set
  });

  // If no filters applied, show prompt to apply filters
  if (!currentFilters) return (
    <div className="p-6">
      <StudentFilters
        onApplyFilters={(filters) => {
          setCurrentFilters(filters);
        }}
        onResetFilters={() => setCurrentFilters(null)}
        isLoading={isLoading}
      />
      <Card className="w-full mt-6 text-center p-10">
        <p className="text-sm text-muted-foreground">Please apply filters to see students.</p>
      </Card>
    </div>
  );

  // If loading, show loading state
  if (isLoading) return (
    <div className="p-6">
      <StudentFilters
        onApplyFilters={(filters) => {
          setCurrentFilters(filters);
        }}
        onResetFilters={() => setCurrentFilters(null)}
        isLoading={isLoading}
      />
      <SkeletonTable rows={10} />
    </div>
  );

  // If no data found, show no data state
  if (!data || !data.lookupStudents || data.lookupStudents.students.length === 0) {
    return (
      <div className="p-6">
        <StudentFilters
          onApplyFilters={(filters) => {
            setCurrentFilters(filters);
          }}
          onResetFilters={() => setCurrentFilters(null)}
          isLoading={isLoading}
        />
        <Card className="w-full mt-6 text-center p-10">
          <p className="text-sm text-muted-foreground">No students found.</p>
        </Card>
      </div>
    );
  }

  const handleExportClick = () => {
    if (!data?.lookupStudents?.students || data.lookupStudents.students.length === 0) {
      return;
    }
    exportToCSV<any>([...data.lookupStudents.students], {
      filename: `students_${format(new Date(), "yyyyMMdd_HHmmss")}`,
      fields: ["mnumber", "first_name", "last_name", "email"],
      headers: ["mnumber", "first_name", "last_name", "email"],
      preHeader: makePreHeader(currentFilters),
    });
  };

  return (
    <div className="p-6">
      <StudentFilters
        onApplyFilters={(filters) => {
          setCurrentFilters(filters);
        }}
        onResetFilters={() => setCurrentFilters(null)}
        isLoading={isLoading}
      />
      <Card className="w-full h-[600px] mt-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Student Lookup</h2>
          <Button variant="outline" onClick={handleExportClick}>
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </CardHeader>

        <CardContent>
          <PaginatedTable<any>
            className="border"
            data={[...data.lookupStudents.students]}
            columns={[
              { key: "mnumber", label: "MNumber" },
              { key: "first_name", label: "First Name" },
              { key: "last_name", label: "Last Name" },
              { key: "email", label: "Email", transform: (val) => (val ?? "").toLowerCase() },
            ]}
            rowsPerPage={10}
            totalRows={data.lookupStudents.totalCount}
            handlePreviousCallback={() => setOffset((o) => Math.max(0, o - 10))}
            handleNextCallback={() => setOffset((o) => o + 10)}
          />
        </CardContent>
      </Card>
    </div>
  );
};