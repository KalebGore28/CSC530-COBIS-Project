import { user } from "@/db/schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type User = typeof user.$inferSelect;

export const userTypeExtension = /* GraphQL */ `
  extend type UserSelectItem {
    faculty: FacultySelectItem
    roles: [UserRolesSelectItem!]!
  }
`;

export const UserResolver = {
  faculty: (user: User, _args: any, { loaders }: ApolloContext) =>
    loaders.faculty.load(user.mnumber || ''),
    roles: (user: User, _args: any, { loaders }: ApolloContext) =>
    loaders.userRoles.load(user.id),
};