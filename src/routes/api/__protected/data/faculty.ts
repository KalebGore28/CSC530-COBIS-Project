import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { faculty } from "@/db/schema";

type Faculty = typeof faculty.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/faculty")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // The instructor pages and the user management tools need everyone. Anyone else, like faculty
        // opening their own teaching page, only gets their own record.
        const canSeeAll =
          context.capabilities.has("instructors.view") || context.capabilities.has("tools.manage");

        const facultyResults = canSeeAll
          ? await context.db.select().from(faculty)
          : await context.db
              .select()
              .from(faculty)
              .where(eq(faculty.mnumber, context.user.mnumber ?? ""));

        const json = JSON.stringify(facultyResults);
        const compressed = gzipSync(Buffer.from(json));

        return new Response(compressed, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
      PUT: async ({ context, request }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const updatedFaculty: Faculty = await request.json();

        const { mnumber, ...updateData } = updatedFaculty;

        await context.db
          .update(faculty)
          .set({
            ...updateData,
            first_name: undefined, // prevent updating first_name
            last_name: undefined, // prevent updating last_name
          })
          .where(eq(faculty.mnumber, updatedFaculty.mnumber))
          .execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
