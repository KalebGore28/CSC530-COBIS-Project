import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import * as z from "zod";
import { roleDataAccess, roles } from "@/db/schema";
import {
  DATA_CATEGORIES,
  DATA_RELATIONSHIPS,
  isCategoryLockedForRole,
} from "@/types/access-checks";

const roleDataAccessSchema = z.object({
  role_id: z.number().int(),
  relationship: z.enum(DATA_RELATIONSHIPS),
  category: z.enum(DATA_CATEGORIES),
});

export const Route = createFileRoute("/api/__protected/data/role-data-access")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const results = await context.db.select().from(roleDataAccess);

        const json = JSON.stringify(results);
        const compressed = gzipSync(Buffer.from(json));

        return new Response(compressed, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
      POST: async ({ request, context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const parsed = roleDataAccessSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid permission", { status: 400 });

        const [role] = await context.db
          .select({ name: roles.name })
          .from(roles)
          .where(eq(roles.id, parsed.data.role_id));
        if (!role) return new Response("Unknown role", { status: 400 });

        if (isCategoryLockedForRole(role.name, parsed.data.category)) {
          return new Response("Forbidden", { status: 403 });
        }

        await context.db.insert(roleDataAccess).values(parsed.data);

        return new Response(null, { status: 201 });
      },
      DELETE: async ({ request, context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const parsed = roleDataAccessSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid permission", { status: 400 });

        await context.db
          .delete(roleDataAccess)
          .where(
            and(
              eq(roleDataAccess.role_id, parsed.data.role_id),
              eq(roleDataAccess.relationship, parsed.data.relationship),
              eq(roleDataAccess.category, parsed.data.category),
            ),
          );

        return new Response(null, { status: 204 });
      },
    },
  },
});
