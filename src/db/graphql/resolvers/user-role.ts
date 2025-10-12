import {userRoles} from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type UserRole = typeof userRoles.$inferSelect;

export const userRoleTypeExtension = /* GraphQL */ `
  extend type UserRolesSelectItem {
    user: UserSelectItem!
    role: RolesSelectItem!
  }
`;

export const UserRolesResolver = {
    user: (userRoles: UserRole, _args: any, { loaders }: ApolloContext) =>
        loaders.user.load(userRoles.user_id),
    role: (userRoles: UserRole, _args: any, { loaders }: ApolloContext) =>
        loaders.role.load(userRoles.role_id),
};