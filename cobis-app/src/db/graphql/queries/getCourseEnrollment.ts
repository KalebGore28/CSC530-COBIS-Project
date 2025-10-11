// src/graphql/queries/getCourseEnrollment.ts
import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { eq, and } from 'drizzle-orm'
import { courses } from '@/db/schema'
import { checkEnrollmentAccess } from '../middleware/checkEnrollmentAccess'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type
export const CourseEnrollmentType = new GraphQLObjectType({
    name: 'CourseEnrollment',
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
export const getCourseEnrollment = {
    type: new GraphQLList(CourseEnrollmentType),
    args: {
        subject: { type: new GraphQLNonNull(GraphQLString) },
        number: { type: new GraphQLNonNull(GraphQLInt) },
        suffix: { type: GraphQLString },
    },
    resolve: checkEnrollmentAccess(async (
        _parent: any,
        args: {
            subject: string,
            number: number,
            suffix: string
        }, { db }: ApolloContext) => {
        const { subject, number, suffix = '' } = args;
        const [course] = await db
            .select()
            .from(courses)
            .where(
                and(
                    eq(courses.subject, subject),
                    eq(courses.number, number),
                    eq(courses.suffix, suffix),
                )
            )
            .limit(1);
        return course || null;
    }),
}