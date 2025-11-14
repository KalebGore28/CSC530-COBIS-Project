import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { programs } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/programs')({
  server: {
    handlers: {
      GET: async () => {
        const { orm } = await getDbConnection()

        const programResults = await orm.select().from(programs)

        return new Response(JSON.stringify(programResults), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    }
  }
})
