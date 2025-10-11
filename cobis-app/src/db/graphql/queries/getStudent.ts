// src/graphql/queries/getStudent.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { eq } from 'drizzle-orm'
import { students } from '@/db/schema'
import { checkStudentAccess } from '../middleware/checkStudentAccess'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type
export const StudentType = new GraphQLObjectType({
    name: 'Student',
    fields: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        middle_name: { type: GraphQLString },
        last_name: { type: new GraphQLNonNull(GraphQLString) },
        suffix: { type: GraphQLString },
        gender: { type: GraphQLString },
        birth_date: { type: GraphQLString },
        citizenship: { type: GraphQLString },
        race: { type: GraphQLString },
        residency: { type: GraphQLString },
        cell_phone: { type: GraphQLString },
        email: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const getStudent = {
    type: new GraphQLList(StudentType),
    args: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: checkStudentAccess(async (_parent: any, args: { mnumber: string }, { db }: ApolloContext) => {
        const [stud] = await db
            .select()
            .from(students)
            .where(eq(students.mnumber, args.mnumber))
            .limit(1)
        return stud || null
    }),
}