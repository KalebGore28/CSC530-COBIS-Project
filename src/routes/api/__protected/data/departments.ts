import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { departments } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/departments')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const departmentResults = await orm.select().from(departments)

                const json = JSON.stringify(departmentResults)
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