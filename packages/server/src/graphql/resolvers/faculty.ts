import type { Faculty, InstructorCourse, Term } from "../../db/schema";
import { ApolloContext } from "../../app";

const termMap = {
    '10': 'Spring',
    '50': 'Summer',
    '80': 'Fall',
    '90': 'Winter',
}

export const FacultyResolver = {
    college: (faculty: Faculty, _args: any, { loaders }: ApolloContext) =>
        faculty.college ? loaders.college.load(faculty.college) : null,
    department: (faculty: Faculty, _args: any, { loaders }: ApolloContext) =>
        faculty.department ? loaders.department.load(faculty.department) : null,
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

        // fetch ALL courses for this instructor (cached per request)
        const all = await loaders.instructorCourses.load(fac.mnumber);

        // simple compare helper
        const termYearGE = (
            course: InstructorCourse,
            term: string,
            year: number
        ) =>
            course.year > year ||
            (course.year === year && course.term >= term);

        const termYearLE = (
            course: InstructorCourse,
            term: string,
            year: number
        ) =>
            course.year < year ||
            (course.year === year && course.term <= term);

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
                course.year > y || (course.year === y && course.term >= t);
            const le = (t: string, y: number) =>
                course.year < y || (course.year === y && course.term <= t);

            if (args.startTerm && args.startYear && !ge(args.startTerm, args.startYear)) return false;
            if (args.endTerm && args.endYear && !le(args.endTerm, args.endYear)) return false;
            return true;
        };
        const filtered = allCourses.filter(inRange);

        // 4. group by term+year
        const groups = new Map<string, { term: Term; year: number; courses: typeof allCourses }>();
        for (const course of filtered) {
            const key = [course.term, course.year].join('|');
            if (!groups.has(key)) {
                groups.set(key, {
                    term: { code: course.term, description: termMap[course.term as keyof typeof termMap] || '' },
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
                            [c.term, c.year, c.course_subject, c.course_number, c.course_suffix].join('|')
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
        // fetch all students for this faculty member (cached per request)
        const all = await loaders.facultyAdvisees.load(faculty.mnumber);

        // if no filters, return all
        if (!args.term && !args.year) return all;

        // otherwise, filter by term/year
        return all.filter((student) => {
            if (args.term && args.year) {
                return student.term === args.term && student.year === args.year;
            }
            if (args.term) {
                return student.term === args.term;
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
