// src/routes/api/graphql.ts
import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { ApolloServer } from '@apollo/server'
import { loadUser } from '@/middleware/load-user'

export const Route = createFileRoute('/api/graphql')({
    server: {
        middleware: [loadUser],
        handlers: {
            // GET → optional GraphiQL playground or test query
            GET: async () => {
                const html = /* GraphiQL-like minimal UI */
                    `<!DOCTYPE html>
          <html>
            <head><title>GraphQL Endpoint</title></head>
            <body>
              <h2>GraphQL endpoint</h2>
              <p>Send a POST request to this URL with <code>{ "query": "...", "variables": {...} }</code>.</p>
            </body>
          </html>`
                return new Response(html, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' },
                })
            },

            // POST → actual GraphQL requests
            POST: async ({ request }) => {
                const graphql_schema = (await getDbConnection()).graphql_schema

                const server = new ApolloServer({
                    schema: graphql_schema,
                })
                await server.start()

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
