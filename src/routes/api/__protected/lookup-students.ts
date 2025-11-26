import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { gzipSync } from 'node:zlib'
import {
    students,
    studentAcademicInfo,
    studentPrograms,
    studentCourses
} from '@/db/schema'
import { type SQLWrapper, eq, and, or, gte, lte, gt, lt, desc } from 'drizzle-orm'
import { z } from "zod";

const allowedGrades = ['A', 'B', 'C', 'D', 'E'] as const
const allowedAcademicLevels = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] as const;
const academicLevelHours: Record<typeof allowedAcademicLevels[number], number> = {
    Freshman: 30,
    Sophomore: 60,
    Junior: 90,
    Senior: 120,
    Graduate: 120,
};

export const searchParamsSchema = z.object({
    // GPA
    gpaMin: z.coerce.number().min(0).max(4).optional(),
    gpaMax: z.coerce.number().min(0).max(4).optional(),

    // string OR string[]
    academicLevel: z
        .union([
            z.enum(allowedAcademicLevels),
            z.array(z.enum(allowedAcademicLevels)),
        ])
        .optional(),

    // Program filters
    program_id: z.string().optional(),
    is_major: z.coerce.boolean().optional(),
    is_minor: z.coerce.boolean().optional(),

    // Course filters
    course_id: z.string().optional(),
    taken: z.coerce.boolean().optional(),
    grade: z.enum(allowedGrades).optional(),
    operator: z.string().optional(),

    offset: z.coerce.number().min(0).optional(),
    limit: z.coerce.number().min(1).max(1000).optional(),
}).superRefine((val, ctx) => {
    // Program filters validation
    if (val.program_id) {
        // Require exactly one of is_major or is_minor
        if (val.is_major === undefined && val.is_minor === undefined) {
            ctx.addIssue({
                path: ['is_major'],
                code: 'custom',
                message: 'Either is_major or is_minor must be provided when program_code is set',
            });
            ctx.addIssue({
                path: ['is_minor'],
                code: 'custom',
                message: 'Either is_major or is_minor must be provided when program_code is set',
            });
        } else if (val.is_major !== undefined && val.is_minor !== undefined) {
            ctx.addIssue({
                path: ['is_major'],
                code: 'custom',
                message: 'Cannot provide both is_major and is_minor',
            });
            ctx.addIssue({
                path: ['is_minor'],
                code: 'custom',
                message: 'Cannot provide both is_major and is_minor',
            });
        }
    }

    // Course filters validation
    if (val.course_id) {
        // taken is required if course_id is provided
        if (val.taken === undefined) {
            ctx.addIssue({
                path: ['taken'],
                code: 'custom',
                message: 'taken must be provided when course_id is set',
            });
        } else if (val.taken) {
            // If taken is true, grade and operator are required
            if (!val.grade) {
                ctx.addIssue({
                    path: ['grade'],
                    code: 'custom',
                    message: 'grade is required when taken is true',
                });
            }
            if (!val.operator) {
                ctx.addIssue({
                    path: ['operator'],
                    code: 'custom',
                    message: 'operator is required when taken is true',
                });
            }
        }
    }
})

export const Route = createFileRoute('/api/__protected/lookup-students')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { orm } = await getDbConnection()
                const params = new URL(request.url).searchParams

                const errors: string[] = [];

                // Convert URLSearchParams → object Zod can read
                const rawParams: Record<string, unknown> = {};
                for (const [key, value] of params.entries()) {
                    // If there are multiple entries for the same key,
                    // represent them as an array so Zod can match string | string[]
                    const allValues = params.getAll(key);
                    rawParams[key] = allValues.length > 1 ? allValues : value;
                }

                // Validate with Zod
                const parsed = searchParamsSchema.safeParse(rawParams);

                if (!parsed.success) {
                    return new Response(
                        JSON.stringify({ error: parsed.error }),
                        { status: 400 }
                    );
                }

                const whereClauses: SQLWrapper[] = [];

                // GPA filters
                if (parsed.data.gpaMin !== undefined) {
                    whereClauses.push(gte(studentAcademicInfo.overall_gpa, parsed.data.gpaMin));
                }

                if (parsed.data.gpaMax !== undefined) {
                    whereClauses.push(lte(studentAcademicInfo.overall_gpa, parsed.data.gpaMax));
                }

                // First get the latest year and term_code found in the student_academic_info table
                const [latestRecord] = await orm
                    .select({
                        max_year: studentAcademicInfo.year,
                        max_term: studentAcademicInfo.term_code,
                    })
                    .from(studentAcademicInfo)
                    .orderBy(
                        desc(studentAcademicInfo.year),
                        desc(studentAcademicInfo.term_code)
                    )
                    .limit(1)

                // If no records exist, we can't filter by academic level
                if (!latestRecord) {
                    errors.push('No academic records found to filter by academic level. Aborting academic level filters.');
                }

                // Academic level filters
                if (parsed.data.academicLevel && latestRecord) {
                    const levels = Array.isArray(parsed.data.academicLevel)
                        ? parsed.data.academicLevel
                        : [parsed.data.academicLevel];

                    const levelClauses = levels.map(level => {
                        const hours = academicLevelHours[level];
                        switch (level) {
                            case 'Freshman':
                                return lt(studentAcademicInfo.overall_earned_hours, academicLevelHours['Freshman']);
                            case 'Sophomore':
                                return and(
                                    gte(studentAcademicInfo.overall_earned_hours, academicLevelHours['Freshman']),
                                    lt(studentAcademicInfo.overall_earned_hours, hours)
                                );
                            case 'Junior':
                                return and(
                                    gte(studentAcademicInfo.overall_earned_hours, academicLevelHours['Sophomore']),
                                    lt(studentAcademicInfo.overall_earned_hours, hours)
                                );
                            case 'Senior':
                                return and(
                                    gte(studentAcademicInfo.overall_earned_hours, academicLevelHours['Junior']),
                                    lt(studentAcademicInfo.overall_earned_hours, hours)
                                );
                            case 'Graduate':
                                return gte(studentAcademicInfo.overall_earned_hours, hours);
                            default:
                                return undefined;
                        }
                    });

                    // Filter out any null clauses before combining with OR
                    const validLevelClauses = levelClauses.filter(clause => clause !== undefined);
                    if (validLevelClauses.length > 0) {
                        // Enfore the latest year and term data
                        // @ts-ignore ignore for now
                        whereClauses.push(and(
                            or(...validLevelClauses),
                            eq(studentAcademicInfo.year, latestRecord.max_year),
                            eq(studentAcademicInfo.term_code, latestRecord.max_term),
                        ));

                    }
                }

                const finalWhere = whereClauses.length ? and(...whereClauses) : undefined;

                const studentRows = await orm
                    .select({
                        mnumber: students.mnumber,
                        first_name: students.first_name,
                        last_name: students.last_name,
                        email: students.email,
                        overal_gpa: studentAcademicInfo.overall_gpa,
                    })
                    .from(students)
                    .leftJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber))
                    .where(finalWhere)
                    .offset(parsed.data.offset || 0)
                    .limit(parsed.data.limit || 100);


                const json = JSON.stringify({
                    students: studentRows,
                    errors: errors.length ? errors : undefined,
                });

                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            }
        }
    }
})