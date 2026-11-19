import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { savedReports } from "@/db/schema";
import { REPORT_NAME_MAX_LENGTH, REPORT_PAGES } from "@/lib/saved-reports";

// Filters are a handful of short values, so anything bigger than this isn't a real report
const MAX_SEARCH_LENGTH = 10_000;

const nameSchema = z.string().trim().min(1).max(REPORT_NAME_MAX_LENGTH);

const newReportSchema = z.object({
  id: z.uuid(),
  name: nameSchema,
  page: z.enum(Object.keys(REPORT_PAGES) as [keyof typeof REPORT_PAGES]),
  search: z
    .record(z.string(), z.unknown())
    .refine((search) => JSON.stringify(search).length <= MAX_SEARCH_LENGTH),
  is_favorite: z.boolean().default(false),
});

const changesSchema = z.object({
  id: z.uuid(),
  name: nameSchema.optional(),
  is_favorite: z.boolean().optional(),
});

const deleteSchema = z.object({ id: z.uuid() });

function isDuplicateName(error: unknown) {
  const cause = error instanceof Error && error.cause !== undefined ? error.cause : error;
  return (cause as { code?: unknown } | null)?.code === "ER_DUP_ENTRY";
}

const duplicateName = () =>
  Response.json({ error: "You already have a report with that name" }, { status: 409 });

// Everyone can only see and change their own saved reports
export const Route = createFileRoute("/api/__protected/data/saved-reports")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const reports = await context.db
          .select()
          .from(savedReports)
          .where(eq(savedReports.user_id, context.user.id))
          .orderBy(asc(savedReports.name));

        return new Response(gzipSync(Buffer.from(JSON.stringify(reports))), {
          status: 200,
          headers: { "Content-Type": "application/json", "Content-Encoding": "gzip" },
        });
      },
      POST: async ({ request, context }) => {
        const parsed = newReportSchema.safeParse(await request.json());
        if (!parsed.success) return new Response("Bad Request", { status: 400 });

        try {
          await context.db
            .insert(savedReports)
            .values({ ...parsed.data, user_id: context.user.id });
        } catch (error) {
          if (isDuplicateName(error)) return duplicateName();
          throw error;
        }
        return new Response(null, { status: 201 });
      },
      PUT: async ({ request, context }) => {
        const parsed = changesSchema.safeParse(await request.json());
        if (!parsed.success) return new Response("Bad Request", { status: 400 });

        const { id, ...changes } = parsed.data;
        if (changes.name === undefined && changes.is_favorite === undefined) {
          return new Response(null, { status: 204 });
        }

        try {
          await context.db
            .update(savedReports)
            .set(changes)
            .where(and(eq(savedReports.id, id), eq(savedReports.user_id, context.user.id)));
        } catch (error) {
          if (isDuplicateName(error)) return duplicateName();
          throw error;
        }
        return new Response(null, { status: 204 });
      },
      DELETE: async ({ request, context }) => {
        const parsed = deleteSchema.safeParse(await request.json());
        if (!parsed.success) return new Response("Bad Request", { status: 400 });

        await context.db
          .delete(savedReports)
          .where(
            and(eq(savedReports.id, parsed.data.id), eq(savedReports.user_id, context.user.id)),
          );
        return new Response(null, { status: 204 });
      },
    },
  },
});
