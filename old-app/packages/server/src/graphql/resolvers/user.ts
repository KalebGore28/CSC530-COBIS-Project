import type { User } from "../../db/schema";
import { ApolloContext } from "../../app";

export const UserResolver = {
    updatedAt(user: User, _args: any, _context: ApolloContext) {
        // if user.updatedAt is a JS Date or number in ms
        const ms = typeof user.updatedAt === 'number'
            ? user.updatedAt
            : user.updatedAt.getTime();
        return Math.floor(ms / 1000);
    },
    createdAt(user: User, _args: any, _context: ApolloContext) {
        // if user.createdAt is a JS Date or number in ms
        const ms = typeof user.createdAt === 'number'
            ? user.createdAt
            : user.createdAt.getTime();
        return Math.floor(ms / 1000);
    },
    lastLogin(user: User, _args: any, _context: ApolloContext) {
        // if user.lastLogin is a JS Date or number in ms
        const ms = typeof user.lastLogin === 'number'
            ? user.lastLogin
            : user.lastLogin
                ? user.lastLogin.getTime()
                : 0;
        return Math.floor(ms / 1000);
    },
    roles: (user: User, _args: any, { loaders }: ApolloContext) =>
        loaders.userRoles.load(user.id),
    faculty: (user: User, _args: any, { loaders }: ApolloContext) =>
        loaders.faculty.load(user.mnumber || ''),
};