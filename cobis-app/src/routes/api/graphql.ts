// src/routes/api/graphql.ts
import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { ApolloServer } from '@apollo/server'
import { loadUser } from '@/middleware/load-user'
import { type ApolloContext, apolloServerContextMiddleware } from '@/middleware/apollo-server-context'

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
        middleware: [loadUser, apolloServerContextMiddleware],
        handlers: {
            // GET → GraphQL Playground IDE
            GET: async () => {
                // redirect to Apollo Sandbox
                return new Response(null, {
                    status: 302,
                    headers: { Location: '/graphql-playground.html' },
                })
            },
            // POST → actual GraphQL requests
            POST: async ({ request, context }) => {
                const server = await getApollo()

                // Parse incoming JSON body
                const { query, variables, operationName } = await request.json()

                // Execute GraphQL operation dynamically
                const result = await server.executeOperation({
                    query, variables, operationName
                }, {
                    contextValue: {
                        db: context.db,
                        loaders: context.loaders,
                        userContext: {
                            session: context.session,
                            user: context.user,
                            roles: context.roles,
                            mnumber: context.mnumber,
                            isEnabled: context.isEnabled,
                            faculty: context.faculty,
                        }
                    } as ApolloContext
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
