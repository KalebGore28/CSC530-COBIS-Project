import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { SQLWrapper, eq, ilike, and } from 'drizzle-orm'
import { students } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/students')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { orm } = await getDbConnection()

                const url = new URL(request.url)
                const params = url.searchParams

                const whereConditions: SQLWrapper[] = []
                params.forEach((value, key) => {
                    if (key.endsWith('_eq')) {
                        const field = key.slice(0, -3)
                        const col = (students as any)[field]
                        if (!col) return
                        whereConditions.push(eq(col, value))
                    } else if (key.endsWith('_like')) {
                        const field = key.slice(0, -5)
                        const col = (students as any)[field]
                        if (!col) return
                        whereConditions.push(ilike(col, `%${value}%`))
                    }
                })

                const results = whereConditions.length
                    ? await orm.select().from(students).where(and(...whereConditions))
                    : await orm.select().from(students)

                return new Response(JSON.stringify(results), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})