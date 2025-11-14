import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { partOfTerm } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/part-of-term')({
  server: {
    handlers: {
      GET: async () => {
        const { orm } = await getDbConnection()

        const partOfTermResults = await orm.select().from(partOfTerm)

        return new Response(JSON.stringify(partOfTermResults), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    }
  }
})