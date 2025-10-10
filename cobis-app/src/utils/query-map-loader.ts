import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dev path (relative from server/src/utils → packages/app/persisted_queries.json)
const devPath = path.resolve(__dirname, "../../../app/persisted_queries.json");
// Prod path (built: server.js and JSON live together in dist/)
const prodPath = path.resolve(__dirname, "persisted_queries.json");

let file_path: string;

// Try devPath first; if it exists, use it
try {
  await fs.access(devPath);
  file_path = devPath;
} catch {
  // Otherwise, run from dist/, where JSON is next to server.js
  file_path = prodPath;
}

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
