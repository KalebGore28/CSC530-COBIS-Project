import { eq, like, and, not, gt, lt } from 'drizzle-orm';
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
 * - Validates table and column permissions.
 * - Supports user-specified filters combined into one WHERE clause.
 * - Applies automatic filters (e.g. Faculty can only see their own instructor_courses).
 * - Supports inner joins via a "joins" property in queryDef.
 *
 * @param queryDef - The JSON query definition from the client.
 * @param orm - The Drizzle ORM instance.
 * @param currentUser - An object representing the current user (e.g. { user_id: string, permissions: any[], currentRole: { role_id: number, role_name: string } }).
 * @returns A built query that can be executed.
 */
export async function buildDrizzleQuery(
	queryDef: any,
	orm: any,
	currentUser: { user_id: string, permissions: any[], currentRole: { role_id: number, role_name: string } }
) {
	// Validate base table.
	const table = allowedTables[queryDef.table];
	if (!table) {
		throw new Error("Table not allowed to be queried");
	}

	// Check table-level permission.
	const tablePermission = currentUser.permissions.some(
		(perm) => perm.permission_table === queryDef.table && perm.can_read
	);
	if (!tablePermission) {
		throw new Error("User does not have permission to access this table");
	}

	// Check column-level permissions for the base table.
	for (const col of queryDef.select) {
		if (!col.includes('.')) {
			const hasColumnPermission = currentUser.permissions.some(
				(perm) =>
					perm.permission_table === queryDef.table &&
					perm.permission_column === col &&
					perm.can_read
			);
			if (!hasColumnPermission) {
				throw new Error(`User does not have permission to access column ${col}`);
			}
		} else {
			// For qualified columns like "students.first_name"
			const [joinTableName, columnName] = col.split('.');
			const joinPermission = currentUser.permissions.some(
				(perm) =>
					perm.permission_table === joinTableName &&
					perm.permission_column === columnName &&
					perm.can_read
			);
			if (!joinPermission) {
				throw new Error(`User does not have permission to access column ${col}`);
			}
		}
	}

	// Build column mapping.
	const columnsToSelect = queryDef.select.reduce((acc: any, col: any) => {
		if (col.includes('.')) {
			const [joinTableName, columnName] = col.split('.');
			const joinTable = allowedTables[joinTableName];
			if (!joinTable || !(columnName in joinTable)) {
				throw new Error(`Column ${col} is not allowed or join table ${joinTableName} is not permitted`);
			}
			// Use a fully qualified key to avoid collisions.
			acc[col] = joinTable[columnName];
		} else {
			if (!(col in table)) {
				throw new Error(`Column ${col} is not allowed for table ${queryDef.table}`);
			}
			acc[col] = table[col];
		}
		return acc;
	}, {} as Record<string, any>);

	// Start building the query from the base table.
	let query = orm.select(columnsToSelect).from(table);

	// Process joins if provided.
	if (queryDef.joins && Array.isArray(queryDef.joins)) {
		for (const joinDef of queryDef.joins) {
			const joinTable = allowedTables[joinDef.table];
			if (!joinTable) {
				throw new Error(`Join table ${joinDef.table} is not allowed`);
			}
			// Expect joinDef.on to have { left: "columnName", right: "columnName" }
			// This joins the base table's column (joinDef.on.left) with the join table's column (joinDef.on.right)
			query = query.innerJoin(
				joinTable,
				eq(table[joinDef.on.left], joinTable[joinDef.on.right])
			);
		}
	}

	// Build the WHERE clause: start with automatic filters.
	let whereClause: any = automaticFilters(queryDef, table, currentUser); // May be null.

	// Process user-specified filters.
	if (queryDef.filters && Array.isArray(queryDef.filters)) {
		for (const filter of queryDef.filters) {
			if (!allowedOperators.includes(filter.operator)) {
				throw new Error("Invalid operator");
			}
			if (!Object.keys(table).includes(filter.column)) {
				throw new Error(`Column ${filter.column} is not allowed for table ${queryDef.table}`);
			}

			let condition: any;
			if (filter.operator === '=') {
				condition = eq(table[filter.column], filter.value);
			} else if (filter.operator === '!=') {
				condition = not(eq(table[filter.column], filter.value));
			} else if (filter.operator === '>') {
				condition = gt(table[filter.column], filter.value);
			} else if (filter.operator === '<') {
				condition = lt(table[filter.column], filter.value);
			} else if (filter.operator === 'LIKE') {
				condition = like(table[filter.column], filter.value);
			} else {
				throw new Error("Operator not implemented");
			}
			// Combine user filter with existing whereClause.
			whereClause = whereClause ? and(whereClause, condition) : condition;
			console.log('[buildDrizzleQuery] Added filter:', filter, '-> condition:', condition);
		}
	}

	// Apply the WHERE clause in a single .where() call.
	query = query.where(whereClause);

	// Apply sorting.
	if (queryDef.sort) {
		query = query.orderBy(table[queryDef.sort.column], queryDef.sort.direction);
	}

	// Apply pagination.
	if (queryDef.pagination) {
		query = query.limit(queryDef.pagination.limit).offset(queryDef.pagination.offset);
	}

	return query;
}

/**
 * Automatic filters: For example, if the base table is "instructor_courses" and the current user’s role is Faculty,
 * then add a filter so that only rows where user_id equals currentUser.user_id are returned.
 */
function automaticFilters(
	queryDef: any,
	table: any,
	currentUser: { user_id: string, permissions: any[], currentRole: { role_id: number, role_name: string } }
) {
	let whereClause = null;
	if (queryDef.table === 'instructor_courses' && currentUser.currentRole.role_name === 'Faculty') {
		console.log('[automaticFilters] Faculty role detected: applying filter on user_id');
		whereClause = eq(table.user_id, currentUser.user_id);
	}
	return whereClause;
}