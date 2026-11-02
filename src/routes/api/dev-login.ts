import { createFileRoute } from "@tanstack/react-router";
import { makeSignature } from "better-auth/crypto";
import { eq, isNull } from "drizzle-orm";
import { faculty, roles, user, userRoles } from "@/db/schema";

const DEV_USER_ID = "dev-user";
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

// Signs in without Google, so it must never work outside of a local dev server.
// import.meta.env.DEV is false in every production build.
export const Route = createFileRoute("/api/dev-login")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const { hostname } = new URL(request.url);
        if (!import.meta.env.DEV || !LOCAL_HOSTNAMES.includes(hostname)) {
          return new Response(null, { status: 404 });
        }

        const [devUser] = await context.db.select().from(user).where(eq(user.id, DEV_USER_ID));

        if (!devUser) {
          // Pages look up the signed in user's faculty record, so borrow one no user has claimed
          const [unclaimedFaculty] = await context.db
            .select({ mnumber: faculty.mnumber })
            .from(faculty)
            .leftJoin(user, eq(user.mnumber, faculty.mnumber))
            .where(isNull(user.id))
            .orderBy(faculty.mnumber)
            .limit(1);
          const allRoles = await context.db.select({ id: roles.id }).from(roles);
          const now = new Date();

          await context.db.insert(user).values({
            id: DEV_USER_ID,
            mnumber: unclaimedFaculty?.mnumber,
            name: "Dev User",
            email: "dev-user@localhost.test",
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
            isEnabled: true,
          });
          await context.db
            .insert(userRoles)
            .values(allRoles.map((role) => ({ user_id: DEV_USER_ID, role_id: role.id })));
        }

        const authContext = await context.auth.$context;
        const session = await authContext.internalAdapter.createSession(DEV_USER_ID);
        const signature = await makeSignature(session.token, authContext.secret);
        const { name } = authContext.authCookies.sessionToken;
        const value = encodeURIComponent(`${session.token}.${signature}`);

        return new Response(null, {
          status: 204,
          headers: { "Set-Cookie": `${name}=${value}; Path=/; HttpOnly; SameSite=Lax` },
        });
      },
    },
  },
});
