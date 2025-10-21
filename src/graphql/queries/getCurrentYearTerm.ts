// src/graphql/queries/getCurrentYearTerm.ts
import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, eq } from 'drizzle-orm'
import { terms, instructorCourses } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (year + term description)
export const CurrentYearTermType = new GraphQLObjectType({
    name: 'CurrentYearTerm',
    fields: {
        year: { type: GraphQLInt },
        term_code: { type: GraphQLString },
        term: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const getCurrentYearTerm = {
    type: CurrentYearTermType,
    resolve: async (_parent: any, _args: any, { db }: ApolloContext) => {
        // Single query to find the latest year + term description
        const [result] = await db
            .select({
                year: instructorCourses.year,
                term: terms.description, // get the readable term description
                term_code: instructorCourses.term_code,
            })
            .from(instructorCourses)
            .leftJoin(terms, eq(instructorCourses.term_code, terms.code))
            .where(sql`${instructorCourses.year} = (SELECT MAX(year) FROM ${instructorCourses})`)
            .orderBy(sql`${instructorCourses.term_code} DESC`)
            .limit(1)

        // fallback for when database is empty
        if (!result) {
            return {
                year: 1970,
                term: 'Spring',
                term_code: '10',
            }
        }

        return result
    },
}
