import type { Role } from "../../db/schema";
import { ApolloContext } from "../../app";

export const RoleResolver = {
    id: (role: Role, _args: any, _context: ApolloContext) => role.id.toString(),
};