import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { faculty } from "@/db/schema";

type Faculty = typeof faculty.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/faculty")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Used by the instructor pages and the user management tools
        if (
          !context.capabilities.has("instructors.view") &&
          !context.capabilities.has("tools.manage")
        ) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        const facultyResults = await context.db.select().from(faculty);

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
