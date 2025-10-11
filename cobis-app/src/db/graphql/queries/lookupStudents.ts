// src/graphql/queries/lookupStudents.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInputObjectType, GraphQLFloat, GraphQLInt, GraphQLBoolean } from 'graphql'
import { or, eq, sql, SQLWrapper, and, ne, lt, lte, gt, gte } from 'drizzle-orm'
import type { ApolloContext } from '@/middleware/apollo-server-context'
import { students, studentAcademicInfo, studentPrograms, studentCourses } from '@/db/schema'

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
        program: { type: new GraphQLNonNull(GraphQLString) },
        is_major: { type: GraphQLBoolean },
        is_minor: { type: GraphQLBoolean },
    },
})

const CourseFilterInputType = new GraphQLInputObjectType({
    name: 'CourseFilterInput',
    fields: {
        course: { type: new GraphQLNonNull(GraphQLString) },
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
        programs: { type: new GraphQLList(ProgramFilterInputType) },
        courses: { type: new GraphQLList(CourseFilterInputType) },
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
    course: string;
    taken: boolean;
    operator?: ComparisonOperator;
    grade?: GradeValue;
}

type ProgramFilterInput = {
    program: string;
    is_major?: boolean;
    is_minor?: boolean;
}

type StudentLookupInput = {
    academicLevels?: string[];
    gpaMin?: number;
    gpaMax?: number;
    programs?: ProgramFilterInput[];
    courses?: CourseFilterInput[];
}

const parseCourseId = (cid: string) => {
    const m = /^([A-Za-z]+)(\d+)([A-Za-z]*)$/.exec(cid);
    if (!m) throw new Error(`Invalid course ID: ${cid}`);
    return { subject: m[1], number: +m[2], suffix: m[3] };
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
            programs,
            courses
        } = filters;

        const whereClauses: SQLWrapper[] = [];

        // 1) GPA filters (unchanged) …
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
                
                        -- only the latest snapshot:
                        AND NOT EXISTS (
                            SELECT 1
                            FROM ${studentAcademicInfo} AS sai2
                            WHERE sai2.mnumber = sai1.mnumber
                            AND (
                                sai2.year  > sai1.year
                                OR (sai2.year = sai1.year AND sai2.term > sai1.term)
                            )
                        )
                
                        -- apply the selected‐level ranges
                        AND (${or(...levelClauses)})
                    )
                `);
        }

        // 3) Program filters (new)
        programs?.forEach(({ program, is_major, is_minor }) => {
            if (is_major) {
                whereClauses.push(sql`
                      EXISTS (
                        SELECT 1
                        FROM ${studentPrograms} sp
                        WHERE sp.mnumber = ${students.mnumber}
                          AND sp.type    = 'MAJOR'
                          AND sp.program = ${program}
                      )
                    `);
            }
            if (is_minor) {
                whereClauses.push(sql`
                      EXISTS (
                        SELECT 1
                        FROM ${studentPrograms} sp
                        WHERE sp.mnumber = ${students.mnumber}
                          AND sp.type    = 'MINOR'
                          AND sp.program = ${program}
                      )
                    `);
            }
        });

        // 4) Course filters (new combined logic)
        courses?.forEach(({ course, taken, operator, grade }) => {
            const { subject, number, suffix = '' } = parseCourseId(course);

            if (taken) {
                // build base match clauses
                const base: SQLWrapper[] = [
                    eq(studentCourses.mnumber, students.mnumber),
                    eq(studentCourses.course_subject, subject),
                    eq(studentCourses.course_number, number),
                    sql`COALESCE(${studentCourses.course_suffix}, '') = ${suffix}`,
                ];

                // flip string comparisons so that "A" > "B" academically → invert operators
                if (operator && grade) {
                    const map: Record<ComparisonOperator, typeof eq> = {
                        EQ: eq,    // = 
                        NE: ne,    // !=

                        // flipped for academic order:
                        LT: gt,    // academically “<”  → string-wise “>=”
                        LTE: gte,   // academically “≤” → string-wise “>”
                        GT: lt,    // academically “>”  → string-wise “<=”
                        GTE: lte,   // academically “≥” → string-wise “<”
                    };
                    base.push(map[operator](studentCourses.final_grade, grade));
                }

                whereClauses.push(sql`
                      EXISTS (
                        SELECT 1
                        FROM ${studentCourses}
                        WHERE ${and(...base)}
                      )
                    `);
            } else {
                // not taken → NOT EXISTS
                whereClauses.push(sql`
                      NOT EXISTS (
                        SELECT 1
                        FROM ${studentCourses} sc
                        WHERE sc.mnumber        = ${students.mnumber}
                          AND sc.course_subject = ${subject}
                          AND sc.course_number  = ${number}
                          AND COALESCE(sc.course_suffix, '') = ${suffix}
                      )
                    `);
            }
        });

        // 5) Build base select to count total rows
        const [{ count: totalCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(students)
            .where(and(...whereClauses));

        // Build paginated fetch
        const studentRows = await db
            .select({
                mnumber: students.mnumber,
                first_name: students.first_name,
                last_name: students.last_name,
                email: students.email,
            })
            .from(students)
            .where(and(...whereClauses))
            .offset(offset)
            .limit(limit);

        return {
            students: studentRows,
            totalCount,
        };
    },
}