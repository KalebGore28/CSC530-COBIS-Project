import { eq, useLiveQuery } from "@tanstack/react-db";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { termsCollection } from "@/integrations/tanstack-db/terms";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";

type CourseCardProps = {
  courseCode: string;
  startYear: number;
  startTerm: string;
  endYear: number;
  endTerm: string;
  setStartYear: (year: number) => void;
  setStartTerm: (term: string) => void;
  setEndYear: (year: number) => void;
  setEndTerm: (term: string) => void;
  exportData?: () => void;
};

export function CourseCard({
  courseCode,
  startYear,
  startTerm,
  endYear,
  endTerm,
  setStartYear,
  setStartTerm,
  setEndYear,
  setEndTerm,
  exportData,
}: CourseCardProps) {
  const { data: course } = useLiveQuery(
    (q) =>
      q
        .from({ courses: coursesCollection })
        .leftJoin({ departments: departmentsCollection }, ({ courses, departments }) =>
          eq(courses.department_id, departments.id),
        )
        .leftJoin({ colleges: collegesCollection }, ({ courses, colleges }) =>
          eq(courses.college_id, colleges.id),
        )
        .where(({ courses }) => eq(courses.id, courseCode))
        .select(({ courses, departments, colleges }) => ({
          code: courses.id,
          subject: courses.subject,
          number: courses.number,
          suffix: courses.suffix,
          title: courses.title,
          hours: courses.hours,
          last_updated: courses.last_updated,
          department_description: departments?.description,
          college_description: colleges?.description,
        }))
        .findOne(),
    [courseCode],
  );

  const { data: terms } = useLiveQuery((q) => q.from({ terms: termsCollection }));

  return (
    <Card className="mx-auto max-w-4xl overflow-hidden pt-0">
      <CardHeader className="bg-primary pb-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-sm font-semibold opacity-90">{course?.code || "N/A"}</div>
            <CardTitle className="text-2xl leading-tight font-bold">
              {course?.title || "Course Not Found"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        {course ? (
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                <span className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Department
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {course.department_description || "N/A"}
                </span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                <span className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  College
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {course.college_description || "N/A"}
                </span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                <span className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Hours
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {course.hours > 1 ? `${course.hours} hrs` : `${course.hours} hr`}
                </span>
              </div>
            </div>

            {/* Date Range Selectors */}
            <div className="border-primary/50 bg-primary/20 rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Date Range
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Start Date */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold tracking-wide uppercase">Start Period</div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="start-year" className="mb-1 text-xs">
                        Year
                      </Label>
                      <Select
                        onValueChange={(value) => setStartYear(parseInt(value))}
                        value={startYear.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 19 + i)
                            .sort((a, b) => b - a)
                            .map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="start-term" className="mb-1 text-xs">
                        Term
                      </Label>
                      <Select
                        onValueChange={(value) => setStartTerm(value)}
                        defaultValue={startTerm}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Term" />
                        </SelectTrigger>
                        <SelectContent>
                          {terms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold tracking-wide uppercase">End Period</div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="end-year" className="mb-1 text-xs">
                        Year
                      </Label>
                      <Select
                        onValueChange={(value) => setEndYear(parseInt(value))}
                        value={endYear.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 19 + i)
                            .sort((a, b) => b - a)
                            .map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="end-term" className="mb-1 text-xs">
                        Term
                      </Label>
                      <Select onValueChange={(value) => setEndTerm(value)} value={endTerm}>
                        <SelectTrigger>
                          <SelectValue placeholder="Term" />
                        </SelectTrigger>
                        <SelectContent>
                          {terms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No course details found for code: {courseCode}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {course?.last_updated && (
          <div className="pt-2 text-center text-xs">
            Last updated:{" "}
            {new Date(course.last_updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
        {exportData && (
          <div className="text-center">
            <Button onClick={exportData}>Export Data</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
