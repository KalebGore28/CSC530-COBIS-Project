import type { UserRole } from "../../db/schema";
import { ApolloContext } from "../../app";

export const UserRoleResolver = {
    user: (userRoles: UserRole, _args: any, { loaders }: ApolloContext) =>
        loaders.user.load(userRoles.user_id),
    role: (userRoles: UserRole, _args: any, { loaders }: ApolloContext) =>
        loaders.role.load(userRoles.role_id),
};