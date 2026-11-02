import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import * as z from "zod";
import { roleCapabilities, roles } from "@/db/schema";
import { CAPABILITIES, isCapabilityLockedForRole } from "@/types/access-checks";

const roleCapabilitySchema = z.object({
  role_id: z.number().int(),
  capability: z.enum(CAPABILITIES),
});

export const Route = createFileRoute("/api/__protected/data/role-capabilities")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const results = await context.db.select().from(roleCapabilities);

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

        const parsed = roleCapabilitySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid permission", { status: 400 });

        await context.db.insert(roleCapabilities).values(parsed.data);

        return new Response(null, { status: 201 });
      },
      DELETE: async ({ request, context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const parsed = roleCapabilitySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid permission", { status: 400 });

        const [role] = await context.db
          .select({ name: roles.name })
          .from(roles)
          .where(eq(roles.id, parsed.data.role_id));

        if (role && isCapabilityLockedForRole(role.name, parsed.data.capability)) {
          return new Response("Forbidden", { status: 403 });
        }

        await context.db
          .delete(roleCapabilities)
          .where(
            and(
              eq(roleCapabilities.role_id, parsed.data.role_id),
              eq(roleCapabilities.capability, parsed.data.capability),
            ),
          );

        return new Response(null, { status: 204 });
      },
    },
  },
});
