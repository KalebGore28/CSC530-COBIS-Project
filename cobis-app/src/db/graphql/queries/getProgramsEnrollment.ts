// src/graphql/queries/getProgramsEnrollment.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql'
import type { ApolloContext } from '@/middleware/apollo-server-context'
import { programs } from '@/db/schema'
import { checkEnrollmentAccess } from '../middleware/checkEnrollmentAccess'

// Define return type
export const ProgramEnrollmentType = new GraphQLObjectType({
    name: 'ProgramsEnrollment',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        cip_code: { type: GraphQLString },
        is_major: { type: GraphQLBoolean },
        is_minor: { type: GraphQLBoolean },
        has_concentration: { type: GraphQLBoolean },
        is_discontinued: { type: GraphQLBoolean },
        is_ascsb: { type: GraphQLBoolean },
        department: { type: GraphQLString },
        college: { type: GraphQLString },
        last_updated: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const getProgramsEnrollment = {
    type: new GraphQLList(ProgramEnrollmentType),
    resolve: checkEnrollmentAccess(async (_parent: any, _args: any, { db }: ApolloContext) => {
        return db
            .select()
            .from(programs)
            .orderBy(programs.code);
    }),
}