import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { partOfTerm } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/part-of-term')({
	server: {
		handlers: {
			GET: async () => {
				const { orm } = await getDbConnection()

				const partOfTermResults = await orm.select().from(partOfTerm)

				const json = JSON.stringify(partOfTermResults)
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