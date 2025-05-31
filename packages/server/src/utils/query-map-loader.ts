import { fileURLToPath } from "url";
import path from "path";

// In ESM, __dirname isn’t defined; recreate it from import.meta.url:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.join(__dirname, "../../../app", "persisted_queries.json");
console.log("Loading persisted queries from:", file_path);


type QueryMap = Record<string, string>;
let queryMap: QueryMap = {};

export async function loadQueryMap(): Promise<QueryMap> {
  if (Object.keys(queryMap).length > 0) {
    return queryMap;
  }

  try {
    const data = await import(file_path);
    queryMap = data.default || data;
    console.log("Persisted queries loaded successfully.");
  } catch (error) {
    console.error("Error loading persisted queries:", error);
  }

  return queryMap;
}