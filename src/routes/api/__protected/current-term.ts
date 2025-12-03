import { createFileRoute } from '@tanstack/react-router'
import { studentCourses } from '@/db/schema'
import { max, desc, eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/__protected/current-term')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // First, find the maximum year in the instructorCourses table
                const [result] = await context.db
                    .select({
                        year: studentCourses.year,
                        term_code: studentCourses.term_code,
                    })
                    .from(studentCourses)
                    .where(
                        eq(studentCourses.year,
                            context.db.select({ max: max(studentCourses.year) }).from(studentCourses)
                        )
                    )
                    .orderBy(desc(studentCourses.term_code))
                    .limit(1)

                if (!result || result.year === null || result.year === undefined) {
                    return new Response(JSON.stringify([{ year: 1970, term_code: "10" }]), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                }

                return new Response(JSON.stringify([result]), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            }
        }
    }
})