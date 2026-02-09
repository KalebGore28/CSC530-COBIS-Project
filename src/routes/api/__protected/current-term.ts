import { createFileRoute } from '@tanstack/react-router'
import { desc, eq, max } from 'drizzle-orm'
import { studentCourses } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/current-term')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // First, find the maximum year in the instructorCourses table
                const latestTerms = await context.db
                    .select({
                        year: studentCourses.year,
                        term_id: studentCourses.term_id,
                    })
                    .from(studentCourses)
                    .where(
                        eq(
                            studentCourses.year,
                            context.db
                                .select({ max: max(studentCourses.year) })
                                .from(studentCourses),
                        ),
                    )
                    .orderBy(desc(studentCourses.term_id))
                    .limit(1)

                /**
                 * Here we are correcting the type of latestTerm to be possibly undefined.
                 * Drizzle is not inferring the type correctly.
                 * If the table is empty, latestTerms[0] will be undefined.
                 */
                const latestTerm = latestTerms[0] as
                    | { year: number; term_id: string }
                    | undefined

                if (!latestTerm) {
                    return new Response(
                        JSON.stringify([{ year: 1970, term_id: '10' }]),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    )
                }

                return new Response(JSON.stringify(latestTerm), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            },
        },
    },
})
