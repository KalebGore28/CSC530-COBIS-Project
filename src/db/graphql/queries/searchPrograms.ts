// src/graphql/queries/searchPrograms.ts
import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { programs } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const ProgramType = new GraphQLObjectType({
    name: 'Program',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        cip_code: { type: GraphQLString },
        is_major: { type: new GraphQLNonNull(GraphQLBoolean) },
        is_minor: { type: new GraphQLNonNull(GraphQLBoolean) },
        has_concentration: { type: new GraphQLNonNull(GraphQLBoolean) },
        is_discontinued: { type: new GraphQLNonNull(GraphQLBoolean) },
        is_aacsb: { type: new GraphQLNonNull(GraphQLBoolean) },
        department_code: { type: GraphQLString },
        college_code: { type: GraphQLString },
        last_updated: { type: GraphQLString },
        department: {
            type: new GraphQLObjectType({
                name: 'ProgramDepartment',
                fields: {
                    code: { type: new GraphQLNonNull(GraphQLString) },
                    description: { type: new GraphQLNonNull(GraphQLString) },
                },
            }),
        },
    },
})

// Export GraphQL field config
export const searchPrograms = {
    type: new GraphQLList(ProgramType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(programs)
            .where(
                or(
                    sql`UPPER(${programs.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${programs.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}