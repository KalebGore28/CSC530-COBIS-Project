// src/graphql/queries/getCoursesEnrollment.ts
import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { courses } from '@/db/schema'
import { checkEnrollmentAccess } from '../middleware/checkEnrollmentAccess'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type
export const CoursesEnrollmentType = new GraphQLObjectType({
    name: 'CoursesEnrollment',
    fields: {
        subject: { type: new GraphQLNonNull(GraphQLString) },
        number: { type: new GraphQLNonNull(GraphQLString) },
        suffix: { type: GraphQLString },
        title: { type: new GraphQLNonNull(GraphQLString) },
        hours: { type: GraphQLInt },
        last_updated: { type: new GraphQLNonNull(GraphQLString) },
        department: { type: GraphQLString },
        college: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const getCoursesEnrollment = {
    type: new GraphQLList(CoursesEnrollmentType),
    resolve: checkEnrollmentAccess(async (_parent: any, _args: any, { db }: ApolloContext) => {
        return db
            .select()
            .from(courses)
            .orderBy(courses.subject, courses.number, courses.suffix);
    }),
}
