// src/routes/api/graphql.ts
import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { ApolloServer } from '@apollo/server'
import { loadUser } from '@/middleware/load-user'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

let apollo: ApolloServer | null = null
async function getApollo() {
    if (!apollo) {
        const schema = (await getDbConnection()).graphql_schema
        apollo = new ApolloServer({ schema })
        await apollo.start()
    }
    return apollo
}


export const Route = createFileRoute('/api/graphql')({
    server: {
        middleware: [loadUser],
        handlers: {
            // GET → optional GraphiQL playground or test query
            GET: async () => {
                const filePath = join(process.cwd(), 'public', 'graphql-playground.html')
                const html = await readFile(filePath, 'utf8')
                return new Response(html, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                })
            },

            // POST → actual GraphQL requests
            POST: async ({ request }) => {
                const server = await getApollo()

                // Parse incoming JSON body
                const { query, variables, operationName } = await request.json()

                // Execute GraphQL operation dynamically
                const result = await server.executeOperation(
                    { query, variables, operationName },
                    {
                        contextValue: {
                            // put your auth/session/db context here
                            userId: '123',
                        },
                    }
                )

                return new Response(JSON.stringify(result.body ?? result), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            },
        },
    },
})
