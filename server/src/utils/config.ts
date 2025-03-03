import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES6 modules, derive __filename and __dirname.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine your project root.
// If your config file is in server/src/utils, then two levels up is your project root:
const projectRoot = path.resolve(__dirname, '../../');
console.log("Project root:", projectRoot);

// Now load your .env file using an absolute path:
dotenv.config({ path: path.resolve(projectRoot, 'src/.env') });

// Get DB_URL from environment.
const rawDbUrl = process.env.DB_URL;
if (!rawDbUrl) {
  throw new Error("DB_URL is not defined in the environment variables");
}

// If the DB_URL is not absolute, resolve it relative to your project root.
const dbAbsolutePath = path.isAbsolute(rawDbUrl)
  ? rawDbUrl
  : path.resolve(projectRoot, rawDbUrl);

console.log("Production DB absolute path:", dbAbsolutePath);

export const config = {
  sessionSecret: process.env.SESSION_SECRET as string,
  jwtSecret: process.env.JWT_SECRET as string,
  db: {
    url: dbAbsolutePath,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callBack: process.env.GOOGLE_CALLBACK_URL as string,
    }
  }
};