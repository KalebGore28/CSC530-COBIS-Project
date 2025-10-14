import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql'
import { sql } from 'drizzle-orm'
import { courses } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// 1️⃣ Define a return type for Course search
export const CourseType = new GraphQLObjectType({
  name: 'Course',
  fields: {
    subject: { type: new GraphQLNonNull(GraphQLString) },
    number: { type: new GraphQLNonNull(GraphQLInt) },
    suffix: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    hours: { type: new GraphQLNonNull(GraphQLInt) },
    department_code: { type: GraphQLString },
    college_code: { type: GraphQLString },
    last_updated: { type: GraphQLString },
  },
})

// 2️⃣ Define the actual query resolver
export const searchCourses = {
  type: new GraphQLList(CourseType),
  args: {
    query: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
    const up = args.query.toUpperCase()

    // NOTE: Drizzle’s MySQL driver uses CONCAT instead of "||"
    // So we can use SQL interpolation with CONCAT safely.
    return await db
      .select()
      .from(courses)
      .where(sql`
        UPPER(CONCAT(${courses.subject}, CAST(${courses.number} AS CHAR), ${courses.suffix})) LIKE ${up + '%'}
        OR UPPER(${courses.title}) LIKE ${'%' + up + '%'}
      `)
      .limit(10)
  },
}
