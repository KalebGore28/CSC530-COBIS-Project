import { eq, gt, gte, inArray, lt, lte } from "drizzle-orm";
import * as z from "zod";
import type { AnyColumn, SQL } from "drizzle-orm";

const filterValue = z.union([z.string(), z.number(), z.boolean()]);

// The filters an on-demand TanStack DB collection sends, from parseLoadSubsetOptions
const subsetRequestSchema = z.object({
  filters: z.array(
    z.object({
      field: z.array(z.string()),
      operator: z.string(),
      value: z.union([filterValue, z.array(filterValue), z.null()]).optional(),
    }),
  ),
});

export type SubsetFilter = z.infer<typeof subsetRequestSchema>["filters"][number];

// Returns null if the request body isn't valid
export async function readSubsetFilters(request: Request): Promise<Array<SubsetFilter> | null> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = subsetRequestSchema.safeParse(body);

  return parsed.success ? parsed.data.filters : null;
}

/**
 * Turns collection filters into a SQL condition, only for the columns a route allows.
 *
 * Never allow a masked column here (grades, attendance, gender). Filtering on one would reveal
 * the hidden value through which rows come back, even though the column itself stays null.
 *
 * Anything not recognized is skipped, not rejected. That only returns extra rows, and
 * TanStack DB applies the query's full where clause to them again on the client.
 *
 * This only narrows results, so always combine it with `access.canSee` using `and()`.
 */
export function buildSubsetWhere(
  filters: Array<SubsetFilter>,
  columns: Record<string, AnyColumn>,
): Array<SQL> {
  const conditions: Array<SQL> = [];

  for (const { field, operator, value } of filters) {
    const columnName = field.at(-1);
    if (!columnName || !Object.hasOwn(columns, columnName)) continue;
    const column = columns[columnName];

    if (operator === "in") {
      if (Array.isArray(value)) conditions.push(inArray(column, value));
      continue;
    }

    if (value === null || value === undefined || Array.isArray(value)) continue;

    if (operator === "eq") conditions.push(eq(column, value));
    else if (operator === "gt") conditions.push(gt(column, value));
    else if (operator === "gte") conditions.push(gte(column, value));
    else if (operator === "lt") conditions.push(lt(column, value));
    else if (operator === "lte") conditions.push(lte(column, value));
  }

  return conditions;
}
