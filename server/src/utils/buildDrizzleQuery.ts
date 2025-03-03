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
	departments,
	colleges,
	instructor_courses: instructorCourses,
	courses,
	student_courses: studentCourses,
	students,
	student_academic_info: studentAcademicInfo,
	student_advisors: studentAdvisors,
};

const allowedOperators = ['=', '!=', '>', '<', 'LIKE'];

/**
 * Builds a Drizzle ORM query based on the query definition.
 * - Validates table and column permissions.
 * - Processes user-specified filters (combined into one WHERE clause).
 * - Applies automatic filters (e.g. Faculty can only see their own instructor_courses).
 * - Supports inner joins via a "joins" property in queryDef.
 *
 * @param queryDef - The JSON query definition from the client.
 * @param orm - The Drizzle ORM instance.
 * @param currentUser - An object representing the current user (with properties: user_id, permissions, currentRole).
 * @returns A built query that can be executed.
 */
export async function buildDrizzleQuery(
	queryDef: any,
	orm: any,
	currentUser: { user_id: string; permissions: any[]; currentRole: { role_id: number; role_name: string } }
) {
	// Validate base table.
	const baseTable = allowedTables[queryDef.table];
	if (!baseTable) {
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

	// Build column mapping from the select array.
	const columnsToSelect = queryDef.select.reduce((acc: any, col: any) => {
		if (col.includes('.')) {
			const [joinTableName, columnName] = col.split('.');
			const joinTable = allowedTables[joinTableName];
			if (!joinTable || !(columnName in joinTable)) {
				throw new Error(`Column ${col} is not allowed or join table ${joinTableName} is not permitted`);
			}
			// Use the qualified column name as the key.
			acc[col] = joinTable[columnName];
		} else {
			if (!(col in baseTable)) {
				throw new Error(`Column ${col} is not allowed for table ${queryDef.table}`);
			}
			acc[col] = baseTable[col];
		}
		return acc;
	}, {} as Record<string, any>);

	// Start building the query from the base table.
	let query = orm.select(columnsToSelect).from(baseTable);

	// Process joins if provided.
	if (queryDef.joins && Array.isArray(queryDef.joins)) {
		// Accumulate join definitions by join table.
		const joinMap: Record<string, Array<{ left: string; right: string }>> = {};
		for (const joinDef of queryDef.joins) {
			if (!allowedTables[joinDef.table]) {
				throw new Error(`Join table ${joinDef.table} is not allowed`);
			}
			if (!joinDef.on || !joinDef.on.left || !joinDef.on.right) {
				throw new Error("Join definition must include 'on' with 'left' and 'right'");
			}
			if (!joinMap[joinDef.table]) {
				joinMap[joinDef.table] = [];
			}
			joinMap[joinDef.table].push(joinDef.on);
		}
		// For each join table, combine the conditions using an array.
		for (const joinTableName in joinMap) {
			const joinTable = allowedTables[joinTableName];
			const conditions = joinMap[joinTableName].map((onClause) => {
				// Determine the left column.
				let leftCol;
				if (onClause.left.includes('.')) {
					// If qualified (e.g., "student_courses.mnumber"), split it.
					const [sourceAlias, colName] = onClause.left.split('.');
					const sourceTable = allowedTables[sourceAlias];
					if (!sourceTable || !(colName in sourceTable)) {
						throw new Error(`Column ${onClause.left} is not allowed or join table ${sourceAlias} is not permitted`);
					}
					leftCol = sourceTable[colName];
				} else {
					// Otherwise, use the base table.
					leftCol = baseTable[onClause.left];
				}
				// The right-hand side always comes from the join table.
				const rightCol = joinTable[onClause.right];
				if (!leftCol || !rightCol) {
					throw new Error(`Invalid join condition: ${onClause.left} or ${onClause.right} not found`);
				}
				return eq(leftCol, rightCol);
			});
			// Combine all conditions into one composite condition.
			const joinCondition = and(...conditions);
			// Add the join with the composite condition.
			query = query.innerJoin(joinTable, joinCondition);
		}
	}

	// Build the WHERE clause.
	// Start with automatic filters.
	let whereClause: any = automaticFilters(queryDef, baseTable, currentUser); // May be null.

	// Process user-specified filters.
	if (queryDef.filters && Array.isArray(queryDef.filters)) {
		for (const filter of queryDef.filters) {
			if (!allowedOperators.includes(filter.operator)) {
				throw new Error("Invalid operator");
			}
			if (!Object.keys(baseTable).includes(filter.column)) {
				throw new Error(`Column ${filter.column} is not allowed for table ${queryDef.table}`);
			}
			let condition: any;
			if (filter.operator === '=') {
				condition = eq(baseTable[filter.column], filter.value);
			} else if (filter.operator === '!=') {
				condition = not(eq(baseTable[filter.column], filter.value));
			} else if (filter.operator === '>') {
				condition = gt(baseTable[filter.column], filter.value);
			} else if (filter.operator === '<') {
				condition = lt(baseTable[filter.column], filter.value);
			} else if (filter.operator === 'LIKE') {
				condition = like(baseTable[filter.column], filter.value);
			} else {
				throw new Error("Operator not implemented");
			}
			whereClause = whereClause ? and(whereClause, condition) : condition;
			console.log('[buildDrizzleQuery] Added filter:', filter, '-> condition:', condition);
		}
	}

	// Apply the WHERE clause in a single .where() call.
	query = query.where(whereClause);

	if (queryDef.sort) {
		let sortColumn;
		if (queryDef.sort.column.includes('.')) {
			// If the sort column is qualified, e.g., "student_courses.mnumber"
			const [joinTableName, colName] = queryDef.sort.column.split('.');
			const joinTable = allowedTables[joinTableName];
			if (!joinTable || !(colName in joinTable)) {
				throw new Error(`Sort column ${queryDef.sort.column} is not allowed`);
			}
			sortColumn = joinTable[colName];
		} else {
			// Otherwise, the sort column belongs to the base table.
			if (!(queryDef.sort.column in baseTable)) {
				throw new Error(`Sort column ${queryDef.sort.column} is not allowed for table ${queryDef.table}`);
			}
			sortColumn = baseTable[queryDef.sort.column];
		}
		query = query.orderBy(sortColumn, queryDef.sort.direction);
	}

	// Apply pagination if provided.
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
	currentUser: { user_id: string; permissions: any[]; currentRole: { role_id: number; role_name: string } }
) {
	let whereClause = null;
	if (queryDef.table === 'instructor_courses' && currentUser.currentRole.role_name === 'Faculty') {
		console.log('[automaticFilters] Faculty role detected: applying filter on user_id');
		whereClause = eq(table.user_id, currentUser.user_id);
	}
	return whereClause;
}