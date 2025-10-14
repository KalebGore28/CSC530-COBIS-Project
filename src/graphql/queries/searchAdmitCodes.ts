// src/graphql/queries/searchAdmitCodes.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { admitCodes } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const AdmitCodeType = new GraphQLObjectType({
    name: 'AdmitCode',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchAdmitCodes = {
    type: new GraphQLList(AdmitCodeType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(admitCodes)
            .where(
                or(
                    sql`UPPER(${admitCodes.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${admitCodes.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}