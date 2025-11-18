import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { instructorCourses } from '@/db/schema'
import { max, desc, eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/__protected/current-term')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                // First, find the maximum year in the instructorCourses table
                const [result] = await orm
                    .select({
                        year: instructorCourses.year,
                        term_code: instructorCourses.term_code,
                    })
                    .from(instructorCourses)
                    .where(
                        eq(instructorCourses.year,
                            orm.select({ max: max(instructorCourses.year) }).from(instructorCourses)
                        )
                    )
                    .orderBy(desc(instructorCourses.term_code))
                    .limit(1)


                if (result.year === null || result.year === undefined) {
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