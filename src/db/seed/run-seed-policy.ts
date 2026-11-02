import { getDb } from "..";
import { seedPolicy } from "./seed-policy";

await seedPolicy(getDb());
console.log("Policy tables seeded");
process.exit(0);
