import { eq, like, and } from 'drizzle-orm';
import {
	departments,
	colleges,
	instructorCourses,
	courses,
	studentCourses,
	students,
	studentAcademicInfo,
	studentAdvisors,
} from '../db/schema';

const allowedTables: Record<string, any> = {
	departments: departments,
	colleges: colleges,
	instructor_courses: instructorCourses,
	courses: courses,
	student_courses: studentCourses,
	students: students,
	student_academic_info: studentAcademicInfo,
	student_advisors: studentAdvisors,
};

const allowedOperators = ['=', '!=', '>', '<', 'LIKE'];

/**
 * Builds a Drizzle ORM query based on the query definition.
 * Uses the permissions attached by middleware (req.user.permissions) to enforce RBAC,
 * and applies automatic filters (e.g. Faculty can only see their own instructor_courses).
 *
 * @param queryDef - The JSON query definition from the client.
 * @param orm - The Drizzle ORM instance.
 * @param currentUser - An object representing the current user.
 * @returns A built query that can be executed.
 */
export async function buildDrizzleQuery(
	queryDef: any,
	orm: any,
	currentUser: { user_id: string, permissions: any[], currentRole: { role_id: number, role_name: string } }
) {
	// Validate table: ensure the requested table is allowed.
	const table = allowedTables[queryDef.table];
	if (!table) {
		throw new Error("Invalid table name");
	}

	// Check if the user has read permission for the requested table.
	const tablePermission = currentUser.permissions.some(
		(perm) => perm.permission_table === queryDef.table && perm.can_read
	);
	if (!tablePermission) {
		throw new Error("User does not have permission to access this table");
	}

	// Check if the user has read permission for each requested column.
	for (const col of queryDef.select) {
		const hasColumnPermission = currentUser.permissions.some(
			(perm) =>
				perm.permission_table === queryDef.table &&
				perm.permission_column === col &&
				perm.can_read
		);
		if (!hasColumnPermission) {
			throw new Error(`User does not have permission to access column ${col}`);
		}
	}

	// Build column mapping from the select array.
	const columnsToSelect = queryDef.select.reduce((acc: any, col: any) => {
		if (!(col in table)) {
			throw new Error(`Column ${col} is not allowed for table ${queryDef.table}`);
		}
		acc[col] = table[col];
		return acc;
	}, {} as Record<string, any>);

	// Start building the query: select the requested columns.
	let query = orm.select(columnsToSelect).from(table);

	// Build the WHERE clause.
	let whereClause: any = automaticFilters(queryDef, table, currentUser);

	// Apply any user-specified filters.
	if (queryDef.filters && Array.isArray(queryDef.filters)) {
		for (const filter of queryDef.filters) {

			// Validate operator.
			if (!allowedOperators.includes(filter.operator)) {
				throw new Error("Invalid operator");
			}
			// Validate column.
			if (!Object.keys(table).includes(filter.column)) {
				throw new Error(`Column ${filter.column} is not allowed for table ${queryDef.table}`);
			}

			// For other filters, apply them normally
			if (filter.operator === '=') {
				whereClause = and(whereClause, eq(table[filter.column], filter.value));
			} else if (filter.operator === 'LIKE') {
				whereClause = and(whereClause, like(table[filter.column], filter.value));
			}
		}
	}


	// Apply the WHERE clause in a single `.where()` call.
	query = query.where(whereClause);

	// Apply sorting if provided.
	if (queryDef.sort) {
		query = query.orderBy(table[queryDef.sort.column], queryDef.sort.direction);
	}

	// Apply pagination if provided.
	if (queryDef.pagination) {
		query = query.limit(queryDef.pagination.limit).offset(queryDef.pagination.offset);
	}

	return query;
}

function automaticFilters(queryDef: any, table: any, currentUser: { user_id: string, permissions: any[], currentRole: { role_id: number, role_name: string } }) {
	let whereClause = null

	// Apply automatic filters based on the table.
	if (queryDef.table === 'instructor_courses' && currentUser.currentRole.role_name === 'Faculty') {
		console.log('Faculty role detected');
		whereClause = eq(table.user_id, currentUser.user_id);
	}

	return whereClause;
}