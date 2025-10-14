// src/graphql/queries/lookupStudents.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInputObjectType, GraphQLFloat, GraphQLInt, GraphQLBoolean } from 'graphql'
import { or, eq, sql, SQLWrapper, and, ne, lt, lte, gt, gte, not, exists } from 'drizzle-orm'
import type { ApolloContext } from '@/middleware/apollo-server-context'
import { students, studentAcademicInfo, studentCourses, studentPrograms } from '@/db/schema'

// Define return type
export const StudentBasicType = new GraphQLObjectType({
    name: 'StudentBasic',
    fields: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        last_name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
    },
})

// Define GraphQL input types to match your TS shapes
const ProgramFilterInputType = new GraphQLInputObjectType({
    name: 'ProgramFilterInput',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        is_major: { type: GraphQLBoolean },
        is_minor: { type: GraphQLBoolean },
    },
})

const CourseFilterInputType = new GraphQLInputObjectType({
    name: 'CourseFilterInput',
    fields: {
        course_id: { type: new GraphQLNonNull(GraphQLString) },
        taken: { type: new GraphQLNonNull(GraphQLBoolean) },
        operator: { type: GraphQLString },
        grade: { type: GraphQLString },
    },
})

const StudentLookupInputType = new GraphQLInputObjectType({
    name: 'StudentLookupInput',
    fields: {
        academicLevels: { type: new GraphQLList(GraphQLString) },
        gpaMin: { type: GraphQLFloat },
        gpaMax: { type: GraphQLFloat },
        program: { type: ProgramFilterInputType },
        course: { type: CourseFilterInputType },
    },
})

const LookupStudentsResultType = new GraphQLObjectType({
    name: 'LookupStudentsResult',
    fields: {
        students: { type: new GraphQLNonNull(new GraphQLList(StudentBasicType)) },
        totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    },
})

type ComparisonOperator = 'EQ' | 'NE' | 'LT' | 'LTE' | 'GT' | 'GTE';
type GradeValue = 'A' | 'B' | 'C' | 'D' | 'E';

type CourseFilterInput = {
    course_id: string;
    taken: boolean;
    operator?: ComparisonOperator;
    grade?: GradeValue;
}

type ProgramFilterInput = {
    code: string;
    is_major?: boolean;
    is_minor?: boolean;
}

type StudentLookupInput = {
    academicLevels?: string[];
    gpaMin?: number;
    gpaMax?: number;
    program?: ProgramFilterInput;
    course?: CourseFilterInput;
}

const parseCourseId = (cid: string) => {
    const m = /^([A-Za-z]+)(\d+)([A-Za-z]*)$/.exec(cid);
    if (!m) throw new Error(`Invalid course ID: ${cid}`);
    return { subject: m[1], number: +m[2], suffix: m[3] || "" };
};

// Export GraphQL field config
export const lookupStudents = {
    type: LookupStudentsResultType,
    args: {
        filters: { type: new GraphQLNonNull(StudentLookupInputType) },
        offset: { type: GraphQLInt },
        limit: { type: GraphQLInt },
    },

    resolve: async (
        _parent: any,
        { filters, offset = 0, limit = 10 }: {
            filters: StudentLookupInput;
            offset?: number;
            limit?: number;
        },
        { db }: ApolloContext
    ) => {
        const {
            academicLevels,
            gpaMin,
            gpaMax,
            program,
            course,
        } = filters;

        const whereClauses: SQLWrapper[] = [];

        // 1) GPA filters
        if (gpaMin != null) {
            whereClauses.push(sql`
                    EXISTS (
                      SELECT 1 FROM ${studentAcademicInfo} sai
                      WHERE sai.mnumber = ${students.mnumber}
                        AND sai.overall_gpa >= ${gpaMin}
                    )
                `);
        }
        if (gpaMax != null) {
            whereClauses.push(sql`
                    EXISTS (
                      SELECT 1 FROM ${studentAcademicInfo} sai
                      WHERE sai.mnumber = ${students.mnumber}
                        AND sai.overall_gpa <= ${gpaMax}
                    )
                `);
        }

        // 2) Academic‐level filters (latest‐row + correct ranges)
        if (academicLevels?.length) {
            const levelClauses: SQLWrapper[] = academicLevels.map(level => {
                switch (level) {
                    case 'Freshman':
                        // < 30
                        return sql`sai1.overall_earned_hours < 30`;
                    case 'Sophomore':
                        // ≥ 30 AND < 60
                        return sql`(sai1.overall_earned_hours >= 30 AND sai1.overall_earned_hours < 60)`;
                    case 'Junior':
                        // ≥ 60 AND < 90
                        return sql`(sai1.overall_earned_hours >= 60 AND sai1.overall_earned_hours < 90)`;
                    case 'Senior':
                        // ≥ 90 AND < 120
                        return sql`(sai1.overall_earned_hours >= 90 AND sai1.overall_earned_hours < 120)`;
                    case 'Graduate':
                        // ≥ 120
                        return sql`sai1.overall_earned_hours >= 120`;
                    default:
                        throw new Error(`Unknown academic level: ${level}`);
                }
            });

            whereClauses.push(sql`
                    EXISTS (
                        SELECT 1
                        FROM ${studentAcademicInfo} AS sai1
                        WHERE sai1.mnumber = ${students.mnumber}
                
                        AND NOT EXISTS (
                            SELECT 1
                            FROM ${studentAcademicInfo} AS sai2
                            WHERE sai2.mnumber = sai1.mnumber
                            AND (
                                sai2.year  > sai1.year
                                OR (sai2.year = sai1.year AND sai2.term_code > sai1.term_code)
                            )
                        )
            
                        AND (${or(...levelClauses)})
                    )
                `);
        }

        // 3) Single Program filter
        if (program && (program.is_major || program.is_minor)) {
            const progWhere: SQLWrapper[] = [
                eq(studentPrograms.mnumber, students.mnumber),
                eq(studentPrograms.program_code, program.code),
            ];

            // Filter by major/minor if specified
            if (program.is_major) {
                progWhere.push(eq(studentPrograms.type, "MAJOR"));
            } 
            if (program.is_minor) {
                progWhere.push(eq(studentPrograms.type, "MINOR"));
            }

            // ✅ EXISTS subquery → student is in the program
            whereClauses.push(
                exists(
                    db
                        .select({ one: sql`1` })
                        .from(studentPrograms)
                        .where(and(...progWhere)),
                ),
            );
        }

        // 4) Course filter (new combined logic)
        if (course && (course.course_id && course.taken !== undefined)) {
            const { subject, number, suffix } = parseCourseId(course.course_id);

            // Base relation between students and studentCourses
            const baseCourseMatch = and(
                eq(studentCourses.mnumber, students.mnumber),
                eq(studentCourses.course_subject, subject),
                eq(studentCourses.course_number, number),
                eq(studentCourses.course_suffix, suffix),
            );

            if (course.taken) {
                // Student *must* have taken the course
                let gradeCondition: SQLWrapper | undefined;

                if (course.operator && course.grade) {
                    switch (course.operator) {
                        case "EQ":
                            gradeCondition = eq(studentCourses.final_grade, course.grade);
                            break;
                        case "NE":
                            gradeCondition = ne(studentCourses.final_grade, course.grade);
                            break;
                        case "LT":
                            gradeCondition = gt(studentCourses.final_grade, course.grade); // academically “<”  → string-wise “>”
                            break;
                        case "LTE":
                            gradeCondition = gte(studentCourses.final_grade, course.grade); // academically “<=” → string-wise “>=”
                            break;
                        case "GT":
                            gradeCondition = lt(studentCourses.final_grade, course.grade); // academically “>” → string-wise “<”
                            break;
                        case "GTE":
                            gradeCondition = lte(studentCourses.final_grade, course.grade); // academically “>=” → string-wise “<=”
                            break;
                        default:
                            throw new Error(`Unknown comparison operator: ${course.operator}`);
                    }
                }

                // EXISTS subquery ensures the student has the course record
                const takenSubquery = db
                    .select({ one: sql`1` })
                    .from(studentCourses)
                    .where(gradeCondition ? and(baseCourseMatch, gradeCondition) : baseCourseMatch);

                whereClauses.push(exists(takenSubquery));
            } else {
                // Student *must NOT* have taken the course
                const notTakenSubquery = db
                    .select({ one: sql`1` })
                    .from(studentCourses)
                    .where(baseCourseMatch);

                whereClauses.push(not(exists(notTakenSubquery)));
            }
        }

        // 5) Build base select to count total rows
        const whereExpr = whereClauses.length ? and(...whereClauses) : undefined;

        // Count total rows
        const [{ count: totalCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(students)
            .where(whereExpr);

        // Fetch paginated rows
        const studentRows = await db
            .select({
                mnumber: students.mnumber,
                first_name: students.first_name,
                last_name: students.last_name,
                email: students.email,
            })
            .from(students)
            .where(whereExpr)
            .offset(offset)
            .limit(limit);


        return {
            students: studentRows,
            totalCount,
        };
    },
}