// src/routes/api/graphql.ts
import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { ApolloServer } from '@apollo/server'
import { loadUser } from '@/middleware/load-user'

let apollo: ApolloServer | null = null
async function getApollo() {
    if (!apollo) {
        const schema = (await getDbConnection()).graphql_schema
        apollo = new ApolloServer({
            schema,
            introspection: true,
        })
        await apollo.start()
    }
    return apollo
}

export const Route = createFileRoute('/api/graphql')({
    server: {
        middleware: [loadUser],
        handlers: {
            // POST → actual GraphQL requests
            POST: async ({ request }) => {
                const server = await getApollo()

                // Parse incoming JSON body
                const { query, variables, operationName } = await request.json()

                // Execute GraphQL operation dynamically
                const result = await server.executeOperation({
                    query, variables, operationName
                })

                const { body } = result;

                if (body?.kind === 'single' && body.singleResult) {
                    return new Response(JSON.stringify(body.singleResult), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            },
        },
    },
})
