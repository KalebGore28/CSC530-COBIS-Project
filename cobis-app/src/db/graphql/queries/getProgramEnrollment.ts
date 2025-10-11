// src/graphql/queries/getProgramEnrollment.ts
import { GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql'
import type { ApolloContext } from '@/middleware/apollo-server-context'
import { eq } from 'drizzle-orm'
import { programs } from '@/db/schema'
import { checkEnrollmentAccess } from '../middleware/checkEnrollmentAccess'

// Define return type
export const ProgramEnrollmentType = new GraphQLObjectType({
    name: 'ProgramEnrollment',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        cip_code: { type: GraphQLString },
        is_major: { type: GraphQLBoolean },
        is_minor: { type: GraphQLBoolean },
        has_concentration: { type: GraphQLBoolean },
        is_discontinued: { type: GraphQLBoolean },
        is_aacsb: { type: GraphQLBoolean },
        department_code: { type: GraphQLString },
        college_code: { type: GraphQLString },
        last_updated: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const getProgramEnrollment = {
    type: ProgramEnrollmentType,
    args: {
        code: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: checkEnrollmentAccess(async (_parent: any, args: { code: string }, { db }: ApolloContext) => {
        const [program] = await db
            .select()
            .from(programs)
            .where(eq(programs.code, args.code))
            .limit(1)
        return program || null
    }),
}