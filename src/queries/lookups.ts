import { Query, eq } from "@tanstack/react-db";

import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { currentTermCollection } from "@/integrations/tanstack-db/current-term";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { rolesCollection } from "@/integrations/tanstack-db/roles";
import { termsCollection } from "@/integrations/tanstack-db/terms";

/**
 * The term the app treats as current, with its name.
 */
export function currentTermQuery() {
  return new Query()
    .from({ current_term: currentTermCollection })
    .leftJoin({ terms: termsCollection }, ({ current_term, terms }) =>
      eq(current_term.term_id, terms.id),
    )
    .select(({ current_term, terms }) => ({
      year: current_term.year,
      term_id: current_term.term_id,
      description: terms?.description,
    }))
    .findOne();
}

// Sorted lists for pickers and dropdowns

export function departmentsByNameQuery() {
  return new Query()
    .from({ departments: departmentsCollection })
    .orderBy(({ departments }) => departments.description, "asc");
}

export function collegesByNameQuery() {
  return new Query()
    .from({ colleges: collegesCollection })
    .orderBy(({ colleges }) => colleges.description, "asc");
}

export function facultyByNameQuery() {
  return new Query()
    .from({ faculty: facultyCollection })
    .orderBy(({ faculty }) => faculty.last_name, "asc")
    .orderBy(({ faculty }) => faculty.first_name, "asc");
}

export function rolesByNameQuery() {
  return new Query().from({ roles: rolesCollection }).orderBy(({ roles }) => roles.name, "asc");
}
