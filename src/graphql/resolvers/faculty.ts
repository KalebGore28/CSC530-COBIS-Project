// src/graphql/resolvers/faculty.ts
import { faculty, instructorCourses, terms } from "../../db/schema";
import type { ApolloContext } from "@/middleware/apollo-server-context";

type Faculty = typeof faculty.$inferSelect;
type InstructorCourse = typeof instructorCourses.$inferSelect;
type Term = typeof terms.$inferSelect;

export const facultyTypeExtension = /* GraphQL */ `
  extend type FacultySelectItem {
    department: DepartmentsSelectItem
    college: CollegesSelectItem
    courses_taught(
      startTerm: String
      endTerm: String
      startYear: Int
      endYear: Int
      subject: String
      number: Int
      suffix: String
      section: String
    ): [InstructorCoursesSelectItem]

    grade_distribution_trend(
      startTerm: String!
      startYear: Int!
      endTerm: String
      endYear: Int
    ): [FacultyGradeDistributionTrendItem]

    advisees(
      term: String
      year: Int
    ): [StudentAdvisorsSelectItem!]

    user: UserSelectItem
  }

  type FacultyGradeDistributionTrendItem {
    term: Term!
    year: Int!
    distributions: [FacultyGradeDistributionItem!]!
  }

  type FacultyGradeDistributionItem {
    grade: String!
    count: Int!
    percentage: Float!
  }
`;

const termMap = {
    '10': 'Spring',
    '50': 'Summer',
    '80': 'Fall',
    '90': 'Winter',
}

export const FacultyResolver = {
    department: (faculty: Faculty, _args: any, { loaders }: ApolloContext) =>
        loaders.department.load(faculty.department_code || ''),
    college: (faculty: Faculty, _args: any, { loaders }: ApolloContext) =>
        loaders.college.load(faculty.college_code || ''),
    courses_taught: async (
        fac: Faculty,
        args: {
            startTerm?: string
            endTerm?: string
            startYear?: number
            endYear?: number
            subject?: string
            number?: number
            suffix?: string
        },
        { loaders }: ApolloContext
    ) => {
        // enforce “both or neither” for start‐range and end‐range
        if ((args.startTerm != null) !== (args.startYear != null)) {
            throw new Error(
                'If you filter by startTerm you must also supply startYear, and vice versa.'
            );
        }
        if ((args.endTerm != null) !== (args.endYear != null)) {
            throw new Error(
                'If you filter by endTerm you must also supply endYear, and vice versa.'
            );
        }

        const all = await loaders.instructorCourses.load(fac.mnumber);

        const termYearGE = (
            course: InstructorCourse,
            term: string,
            year: number
        ) =>
            course.year > year ||
            (course.year === year && course.term_code >= term);

        const termYearLE = (
            course: InstructorCourse,
            term: string,
            year: number
        ) =>
            course.year < year ||
            (course.year === year && course.term_code <= term);

        return all.filter((course) => {
            if (args.startTerm && args.startYear) {
                if (!termYearGE(course, args.startTerm, args.startYear)) return false;
            }
            if (args.endTerm && args.endYear) {
                if (!termYearLE(course, args.endTerm, args.endYear)) return false;
            }
            if (args.subject && course.course_subject !== args.subject) return false;
            if (args.number && course.course_number !== args.number) return false;
            if (args.suffix && course.course_suffix !== args.suffix) return false;
            return true;
        });
    },
    grade_distribution_trend: async (
        faculty: Faculty,
        args: {
            startTerm: string;
            startYear: number;
            endTerm?: string;
            endYear?: number;
        },
        { loaders }: ApolloContext
    ): Promise<Array<{
        term: Term;
        year: number;
        distributions: Array<{ grade: string; count: number; percentage: number }>;
    }>> => {
        // 1. validate “both or neither” for start/end filters
        if ((args.startTerm != null) !== (args.startYear != null)) {
            throw new Error(
                'If you filter by startTerm you must also supply startYear, and vice versa.'
            );
        }
        if ((args.endTerm != null) !== (args.endYear != null)) {
            throw new Error(
                'If you filter by endTerm you must also supply endYear, and vice versa.'
            );
        }

        // 2. pull in all instructor‐course rows (cached per request)
        const allCourses = await loaders.instructorCourses.load(faculty.mnumber);

        // 3. apply the exact same filtering logic you used for courses_taught
        const inRange = (course: typeof allCourses[number]) => {
            const ge = (t: string, y: number) =>
                course.year > y || (course.year === y && course.term_code >= t);
            const le = (t: string, y: number) =>
                course.year < y || (course.year === y && course.term_code <= t);

            if (args.startTerm && args.startYear && !ge(args.startTerm, args.startYear)) return false;
            if (args.endTerm && args.endYear && !le(args.endTerm, args.endYear)) return false;
            return true;
        };
        const filtered = allCourses.filter(inRange);

        // 4. group by term+year
        const groups = new Map<string, { term: Term; year: number; courses: typeof allCourses }>();
        for (const course of filtered) {
            const key = [course.term_code, course.year].join('|');
            if (!groups.has(key)) {
                groups.set(key, {
                    term: { code: course.term_code, description: termMap[course.term_code as keyof typeof termMap] || '' },
                    year: course.year,
                    courses: [],
                });
            }
            groups.get(key)!.courses.push(course);
        }

        // 5. for each group: pull each course’s final distribution, sum counts, compute percentages
        const trend = await Promise.all(
            Array.from(groups.values()).map(async ({ term, year, courses }) => {
                // load all distributions in parallel
                const allDists = await Promise.all(
                    courses.map((c) =>
                        loaders.finalGradeDistributionByCourse.load(
                            [c.term_code, c.year, c.course_subject, c.course_number, c.course_suffix].join('|')
                        )
                    )
                );

                // flatten and aggregate counts by grade
                const countMap = new Map<string, number>();
                for (const dist of allDists.flat()) {
                    countMap.set(dist.grade, (countMap.get(dist.grade) || 0) + dist.count);
                }

                const total = Array.from(countMap.values()).reduce((a, b) => a + b, 0) || 1;
                const distributions = Array.from(countMap.entries()).map(([grade, count]) => {
                    const rawPercent = (count / total) * 100;
                    return {
                        grade,
                        count,
                        percentage: parseFloat(rawPercent.toFixed(2)),
                    };
                });

                return { term, year, distributions };
            })
        );

        // 6. (optional) sort by year, then term code
        trend.sort((a, b) =>
            a.year !== b.year ? a.year - b.year : a.term.code.localeCompare(b.term.code)
        );

        return trend;
    },
    advisees: async (
        faculty: Faculty,
        args: {
            term?: string;
            year?: number;
        },
        { loaders }: ApolloContext
    ) => {
        console.log('FacultyAdvisees loader:', loaders.facultyAdvisees);
        console.log('Faculty:', faculty);
        // fetch all students for this faculty member (cached per request)
        const all = await loaders.facultyAdvisees.load(faculty.mnumber);
        console.log('All advisees:', all);

        // if no filters, return all
        if (!args.term && !args.year) return all;

        // otherwise, filter by term/year
        return all.filter((student) => {
            if (args.term && args.year) {
                return student.term_code === args.term && student.year === args.year;
            }
            if (args.term) {
                return student.term_code === args.term;
            }
            if (args.year) {
                return student.year === args.year;
            }
            return true;
        });
    },
    user: (faculty: Faculty, _args: any, { loaders }: ApolloContext) =>
        loaders.user.load(faculty.mnumber),
};
