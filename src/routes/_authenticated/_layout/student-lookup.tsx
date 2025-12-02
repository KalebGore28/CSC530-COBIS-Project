import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Papa from 'papaparse';

import { useInView } from "react-intersection-observer";

import { StudentFilters, FilterState } from "@/components/student-filter";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";

import { StudentLookupTable, type StudentLookup } from "@/components/tables/student-lookup-table";

export const Route = createFileRoute("/_authenticated/_layout/student-lookup")({
  component: StudentLookup,
});

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

  const fetchStudents = async ({ pageParam, filters }: { pageParam: number, filters: FilterState | null }) => {
    const params = new URLSearchParams();
    params.append("offset", pageParam?.toString());
    params.append("limit", "10");
    if (filters) {
      if (filters.academicLevels && filters.academicLevels.length) {
        params.append("academicLevel", filters.academicLevels.join(","));
      }
      if (filters.gpaMin !== undefined) {
        params.append("gpaMin", filters.gpaMin.toString());
      }
      if (filters.gpaMax !== undefined) {
        params.append("gpaMax", filters.gpaMax.toString());
      }
      if (filters.program) {
        params.append("program_id", filters.program.code);
        params.append("isMajor", String(!!filters.program.is_major));
        params.append("isMinor", String(!!filters.program.is_minor));
      }
      if (filters.course) {
        params.append("course_id", filters.course.course_id);
        params.append("taken", String(!!filters.course.taken));
        if (filters.course.operator) {
          params.append("operator", filters.course.operator);
        }
        if (filters.course.grade) {
          params.append("grade", filters.course.grade);
        }
      }
    }

    return fetch(`/api/lookup-students?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json() as Promise<{ students: StudentLookup[], errors?: string[], nextCursor: number }>;
    });
  }

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['student-lookup', currentFilters],
    queryFn: ({ pageParam = 0 }) => fetchStudents({ pageParam, filters: currentFilters }),
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => lastPage.nextCursor,
    enabled: !!currentFilters,
  });

  // sentinel hook
  const { ref: sentinelRef, inView } = useInView({
    threshold: 1,
    rootMargin: "0px 0px 200px 0px", // trigger point
  });

  // trigger fetch automatically
  if (inView && hasNextPage && !isFetching) {
    fetchNextPage();
  }

  const exportToCSV = () => {
    if (!data || data.pages.flatMap(page => page.students).length === 0 || !currentFilters) {
      toast.error("No data to export. Try adjusting the filters.");
      return;
    }

    // const preHeader = makePreHeader(currentFilters); // TODO: Come back to this later 
    const studentData = data.pages.flatMap(page => page.students).map((student) => [
      student.mnumber,
      student.first_name,
      student.last_name,
      student.email,
    ])
    const csv = Papa.unparse({
      fields: ["MNumber", "First Name", "Last Name", "Email"],
      data: studentData,
    });

    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', 'student-lookup-' + format(new Date(), 'yyyyMMddHHmmss') + '.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 gap-6 flex flex-col">
      <StudentFilters
        onApplyFilters={(filters) => setCurrentFilters(filters)}
        onResetFilters={() => setCurrentFilters(null)}
        isLoading={isLoading}
      />

      {/* If no filters applied */}
      {!isLoading && !currentFilters && (
        <Card className="w-full mt-6 text-center p-10">
          <p className="text-sm text-muted-foreground">Please apply filters to see students.</p>
        </Card>
      )}

      {/* If data is available */}
      {data && currentFilters && (
        <Card className="w-full">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Student Lookup</h2>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
          </CardHeader>
          <CardContent>
            <StudentLookupTable data={data.pages.flatMap(page => page.students)}
            />
          </CardContent>
          <CardFooter>
            <div
              ref={sentinelRef}
              className="h-6 w-full flex justify-center items-center"
            >
              {isFetching && <Skeleton className="h-4 w-20" />}
              {!isFetching && !hasNextPage && (
                <span className="text-sm text-muted-foreground">No more students to load.</span>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};