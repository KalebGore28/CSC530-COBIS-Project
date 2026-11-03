import type { getDb } from "@/db";
import { seedRoleCapabilities, seedRoleDataAccess } from "./seed-policy";
import {
  seedAcademicStanding,
  seedAdmitCodes,
  seedColleges,
  seedCoursePrefixes,
  seedDepartments,
  seedInstructionalMethods,
  seedPartOfTerm,
  seedRegistrationStatus,
  seedRoles,
  seedTerms,
} from "./seed-lookups";

export async function seedDeployment(db: ReturnType<typeof getDb>) {
  // Ordered so each table comes after the ones it points to
  console.log(`roles: ${await seedRoles(db)}`);
  console.log(`role data access: ${await seedRoleDataAccess(db)}`);
  console.log(`role capabilities: ${await seedRoleCapabilities(db)}`);
  console.log(`terms: ${await seedTerms(db)}`);
  console.log(`colleges: ${await seedColleges(db)}`);
  console.log(`departments: ${await seedDepartments(db)}`);
  console.log(`course prefixes: ${await seedCoursePrefixes(db)}`);
  console.log(`academic standing: ${await seedAcademicStanding(db)}`);
  console.log(`admit codes: ${await seedAdmitCodes(db)}`);
  console.log(`instructional methods: ${await seedInstructionalMethods(db)}`);
  console.log(`part of term: ${await seedPartOfTerm(db)}`);
  console.log(`registration status: ${await seedRegistrationStatus(db)}`);
}
