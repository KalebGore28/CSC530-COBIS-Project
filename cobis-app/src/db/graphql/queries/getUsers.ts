// src/graphql/queries/getUsers.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { user } from '@/db/schema'
import { requireRoles } from '../middleware/requireRoles'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type
export const UserType = new GraphQLObjectType({
    name: 'Users',
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
export const getUsers = {
    type: new GraphQLList(UserType),
    args: {},
    resolve: requireRoles(['cobis_administrator'], async (_parent: any, _args: any, { db }: ApolloContext) => {
        return db
            .select()
            .from(user)
            .orderBy(user.email);
    }),
}