// src/routes/api/graphql.ts
import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { ApolloServer } from '@apollo/server'
import { loadUser } from '@/middleware/load-user'
import { isEnabled } from '@/middleware/is-enabled'
import { type ApolloContext, apolloServerContextMiddleware } from '@/middleware/apollo-server-context'
import persistedQueries from 'persisted_queries.json'

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
        middleware: [loadUser, isEnabled, apolloServerContextMiddleware],
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

                const { doc_id, variables, operationName, query: incomingQuery } = await request.json()
                // console.log("GraphQL doc_id:", doc_id, "operationName:", operationName, "variables:", variables, "incomingQuery:", incomingQuery);

                const query = doc_id ? persistedQueries[doc_id as keyof typeof persistedQueries] : incomingQuery
                if (!query) {
                    return new Response(JSON.stringify({ errors: [{ message: 'Unknown doc_id' }] }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

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
