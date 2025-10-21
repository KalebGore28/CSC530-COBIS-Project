// src/graphql/queries/getInstructor.ts
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { eq } from 'drizzle-orm'
import { faculty } from '@/db/schema'
import { checkInstructorAccess } from '../middleware/checkInstructorAccess'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type
export const InstructorType = new GraphQLObjectType({
    name: 'Instructor',
    fields: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        last_name: { type: new GraphQLNonNull(GraphQLString) },
        college_code: { type: GraphQLString },
        department_code: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const getInstructor = {
    type: InstructorType,
    args: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: checkInstructorAccess(async (_parent: any, args: { mnumber: string }, { db }: ApolloContext) => {
        const [fac] = await db
            .select()
            .from(faculty)
            .where(eq(faculty.mnumber, args.mnumber))
            .limit(1)
        return fac || null
    }),
}