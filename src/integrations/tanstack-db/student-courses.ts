import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentCourses } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";

type StudentCourse = typeof studentCourses.$inferSelect & {
  // Tells a hidden grade apart from one that hasn't been entered, as both are null
  grades_visible: boolean;
};

export const studentCoursesCollection = collectionOptions("studentCourses", (client) =>
  queryCollectionOptions({
    queryKey: ["studentCourses"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: (context) => fetchCollectionSubset<StudentCourse>("student-courses", context),
    syncMode: "on-demand",
    getKey: (studentCourse) =>
      `${studentCourse.mnumber}-${studentCourse.term_id}-${studentCourse.year}-${studentCourse.course_id}-${studentCourse.course_section}`,
  }),
);
