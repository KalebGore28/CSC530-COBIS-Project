import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Because we copied `persisted_queries.json` to `<root>/dist/persisted_queries.json`,
// and `<root>/dist/server.js` is our output, the JSON is one level up from __dirname:
const file_path = path.join(__dirname, "persisted_queries.json");
console.log("Loading persisted queries from:", file_path);

type QueryMap = Record<string, string>;
let queryMap: QueryMap = {};

export async function loadQueryMap(): Promise<QueryMap> {
  if (Object.keys(queryMap).length > 0) {
    return queryMap;
  }

  try {
    const raw = await fs.readFile(file_path, "utf-8");
    queryMap = JSON.parse(raw);
    console.log("Persisted queries loaded successfully.");
  } catch (error) {
    console.error("Error loading persisted queries:", error);
  }

  return queryMap;
}
