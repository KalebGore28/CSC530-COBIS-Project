import { createMiddleware } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import { getAuthUser } from "@/functions/get-auth-user";

export const loadUser = createMiddleware().server(async ({ next, request, context }) => {
  const session = await getAuthUser();

  if (!session?.user) {
    return {
      response: new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "User not signed in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      ),
      request,
      pathname: new URL(request.url).pathname,
      context: {
        ...context, // carry over existing context
        session: {
          id: "",
          createdAt: new Date(0),
          updatedAt: new Date(0),
          userId: "",
          expiresAt: new Date(0),
          token: "",
          ipAddress: null,
          userAgent: null,
        },
        user: {
          id: "",
          createdAt: new Date(0),
          updatedAt: new Date(0),
          email: "",
          emailVerified: false,
          name: "",
          image: null,
          mnumber: "",
          isEnabled: false,
          lastLogin: new Date(0),
        },
        faculty: {
          firstName: "",
          lastName: "",
          department_id: "",
          college_id: "",
        },
        roles: new Set<string>(),
      },
    };
  }

  // Update last login timestamp
  await context.db.update(user).set({ lastLogin: new Date() }).where(eq(user.id, session.user.id));

  return next({
    context: {
      ...context,
      session: session.session,
      user: session.user,
      faculty: session.faculty,
      roles: session.roles,
    },
  });
});
