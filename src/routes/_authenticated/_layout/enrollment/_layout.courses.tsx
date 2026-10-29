import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { eq, ilike, or, useLiveQuery } from "@tanstack/react-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthentication } from "@/lib/auth-client";

import { coursesCollection } from "@/integrations/tanstack-db/courses";

export const Route = createFileRoute("/_authenticated/_layout/enrollment/_layout/courses")({
  beforeLoad: () => {
    void coursesCollection.preload();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { userSession } = useAuthentication();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: courseData, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ courses: coursesCollection })
        .where(({ courses }) =>
          or(ilike(courses.id, `%${search}%`), ilike(courses.title, `%${search}%`)),
        )
        .where(({ courses }) => eq(courses.department_id, userSession?.faculty.department_id))
        .limit(100)
        .orderBy(({ courses }) => courses.subject, "asc"),
    [search], // Re-run when search changes
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Search Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by subject, number, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : courseData.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No courses found.</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-2 text-xs">
              Limited to courses within your department. Results limited to 100 entries. Refine your
              search to narrow results.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {courseData.map((course) => (
                <div
                  key={course.id}
                  onClick={() =>
                    navigate({
                      to: "/enrollment/courses/$courseId",
                      params: {
                        courseId: course.id,
                      },
                    })
                  }
                  className="hover:bg-accent cursor-pointer rounded-md border p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.id}</p>
                      <p className="text-muted-foreground text-sm">{course.title}</p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 text-right">
                      <Badge variant="outline">
                        {course.hours} hr
                        {course.hours > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-1 text-[10px]">
                    Last updated: {new Date(course.last_updated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
