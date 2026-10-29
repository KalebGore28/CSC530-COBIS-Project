import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentCourses } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type StudentCourse = typeof studentCourses.$inferSelect;

export const studentCoursesCollection = collectionOptions(
  "studentCourses",
  (client) =>
    queryCollectionOptions({
      queryKey: ["studentCourses"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/student-courses`);
        return (await response.json()) as Array<StudentCourse>;
      },
      autoIndex: "eager",
      syncMode: "on-demand",
      getKey: (studentCourse) =>
        `${studentCourse.mnumber}-${studentCourse.term_id}-${studentCourse.year}-${studentCourse.course_id}-${studentCourse.course_section}`,
    }),
);
