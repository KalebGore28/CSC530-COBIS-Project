import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { programs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { gzipSync } from 'node:zlib'

type Program = typeof programs.$inferSelect

export const Route = createFileRoute('/api/__protected/data/programs')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const programResults = await orm.select().from(programs)

                const json = JSON.stringify(programResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
            PUT: async ({ request }) => {
                const { orm } = await getDbConnection()

                const updatedProgram: Program = await request.json()

                const { code, ...updateData } = updatedProgram

                await orm
                    .update(programs)
                    .set(updateData)
                    .where(eq(programs.code, code))
                    .execute()

                return new Response(null, { status: 204 })
            }
        }
    }
})
