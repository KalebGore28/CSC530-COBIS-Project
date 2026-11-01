export async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`/api/data/${endpoint}`);
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
