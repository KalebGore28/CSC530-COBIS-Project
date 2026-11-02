import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";

type User = typeof user.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/users")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        let userResults = await context.db.select().from(user);

        // Only the instructor pages and the user management tools need every user
        if (
          !context.capabilities.has("instructors.view") &&
          !context.capabilities.has("tools.manage")
        ) {
          // Filter to only the current user
          userResults = userResults.filter((u) => u.id === context.user.id);
        }

        const json = JSON.stringify(userResults);
        const compressed = gzipSync(Buffer.from(json));

        return new Response(compressed, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
      PUT: async ({ request, context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const updatedUser: User = await request.json();

        const { id, ...updateData } = updatedUser;

        await context.db
          .update(user)
          .set({
            ...updateData,
            isEnabled: context.user.mnumber === updatedUser.mnumber ? true : updateData.isEnabled, // prevent disabling self
            name: undefined, // prevent updating
            email: undefined, // prevent updating
            emailVerified: undefined, // prevent updating
            image: undefined, // prevent updating
            createdAt: undefined, // prevent updating
            lastLogin: undefined, // prevent updating
            updatedAt: new Date(), // update value to current time
          })
          .where(eq(user.id, id))
          .execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
