// src/graphql/queries/getUser.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { user } from '@/db/schema'
import { requireRoles } from '../middleware/requireRoles'
import type { ApolloContext } from '@/middleware/apollo-server-context'
import { eq } from 'drizzle-orm'

// Define return type
export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        mnumber: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: new GraphQLNonNull(GraphQLString) },
        emailVerified: { type: new GraphQLNonNull(GraphQLString) },
        image: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: new GraphQLNonNull(GraphQLString) },
        isEnabled: { type: new GraphQLNonNull(GraphQLString) },
        lastLogin: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const getUser = {
    type: new GraphQLList(UserType),
    args: {
        mnumber: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: requireRoles(['cobis_administrator'], async (_parent: any, args: { mnumber: string }, { db }: ApolloContext) => {
        const [dbUser] = await db
            .select()
            .from(user)
            .where(eq(user.mnumber, args.mnumber))
            .limit(1);
        return dbUser || null;
    }),
}