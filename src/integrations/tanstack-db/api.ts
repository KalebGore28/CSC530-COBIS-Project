import { parseLoadSubsetOptions } from "@tanstack/query-db-collection";

export async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`/api/data/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches only the rows an on-demand collection's query needs.
 *
 * parseLoadSubsetOptions throws on expressions like `or` and `like`. When that happens we ask for
 * everything the user can access, and TanStack DB applies the query's where clause on the client.
 */
export async function fetchCollectionSubset<T>(
  endpoint: string,
  context: { meta?: Record<string, unknown> },
): Promise<T[]> {
  let filters: ReturnType<typeof parseLoadSubsetOptions>["filters"] = [];
  try {
    filters = parseLoadSubsetOptions(
      context.meta?.loadSubsetOptions as Parameters<typeof parseLoadSubsetOptions>[0],
    ).filters;
  } catch {
    filters = [];
  }

  const response = await fetch(`/api/data/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters }),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

export async function updateCollectionItem<T>(
  endpoint: string,
  original: T,
  changes: Partial<T>,
  key: keyof T = "id" as keyof T,
): Promise<T> {
  const response = await fetch(`/api/data/${endpoint}`, {
    method: "PUT",
    body: JSON.stringify({
      [key]: original[key],
      ...changes,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ${endpoint} item: ${response.statusText}`);
  }
  return response.json();
}
