import { students } from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type Student = typeof students.$inferSelect;

export const studentTypeExtension = /* GraphQL */ `
  extend type StudentsSelectItem {
    addresses: [StudentAddressesSelectItem]
    advisors: [StudentAdvisorsSelectItem]
    programs: [StudentProgramsSelectItem]
    academic_info(term: String, year: Int): [StudentAcademicInfoSelectItem]
    courses(
      startTerm: String
      endTerm: String
      startYear: Int
      endYear: Int
    ): [StudentCoursesSelectItem]
  }
`;

const termMap = {
    '10': 'Spring',
    '50': 'Summer',
    '80': 'Fall',
    '90': 'Winter',
}

export const StudentResolver = {
    addresses: (student: Student, _args: any, { loaders }: ApolloContext) =>
        loaders.address.load(student.mnumber),
    advisors: (student: Student, _args: any, { loaders }: ApolloContext) =>
        loaders.advisor.load(student.mnumber),
    programs: (student: Student, _args: any, { loaders }: ApolloContext) =>
        loaders.studentProgram.load(student.mnumber),
    academic_info: async (student: Student, args: { term: string, year: number }, { loaders }: ApolloContext) => {
        const { term, year } = args;
        console.log(`Fetching academic info for student ${student.mnumber} with filters term=${term}, year=${year}`);

        // fetch all academic info for the student
        const allAcademicInfo = loaders.academicInfo.load(student.mnumber);

        // if no term or year is provided, return all academic info
        if (term == null && year == null) return allAcademicInfo;

        // if only a term is provided, return all academic info for that term
        if (term != null && year == null) {
            return allAcademicInfo.then((info) =>
                info.filter((ai) => ai.term_code === term)
            );
        }

        // if only a year is provided, return all academic info for that year
        if (term == null && year != null) {
            return allAcademicInfo.then((info) =>
                info.filter((ai) => ai.year === year)
            );
        }

        // if both term and year are provided, return all academic info for that term and year
        return allAcademicInfo.then((info) =>
            info.filter((ai) => ai.term_code === term && ai.year === year)
        );
    },
    courses: (
        student: Student,
        args: {
            startTerm?: string;
            endTerm?: string;
            startYear?: number;
            endYear?: number;
        },
        { loaders }: ApolloContext
    ) => {
        // fetch all courses for the student
        const allCourses = loaders.studentCourse.load(student.mnumber);

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

        // if no arguments are provided, return all courses
        if (args.startTerm == null && args.startYear == null && args.endTerm == null && args.endYear == null) {
            return allCourses;
        }

        // if only a start term and year are provided, return all courses for that term and year
        if (args.startTerm != null && args.startYear != null && args.endTerm == null && args.endYear == null) {
            return allCourses.then((courses) =>
                courses.filter((course) => course.term_code === args.startTerm && course.year === args.startYear)
            );
        }

        // if only an end term and year are provided, return all courses for that term and year
        if (args.startTerm == null && args.startYear == null && args.endTerm != null && args.endYear != null) {
            return allCourses.then((courses) =>
                courses.filter((course) => course.term_code === args.endTerm && course.year === args.endYear)
            );
        }

        // if both start and end terms and years are provided, return all courses for that range
        if (args.startTerm != null && args.startYear != null && args.endTerm != null && args.endYear != null) {
            return allCourses.then((courses) =>
                courses.filter((course) => {
                    const courseTerm = termMap[course.term_code as keyof typeof termMap];
                    const courseYear = course.year;

                    // check if the course is within the specified range
                    return (
                        (courseTerm >= args.startTerm! && courseYear >= args.startYear!) &&
                        (courseTerm <= args.endTerm! && courseYear <= args.endYear!)
                    );
                })
            );
        }
    },
};
