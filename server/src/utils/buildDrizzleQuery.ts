import { eq, like, and, not, gt, lt } from 'drizzle-orm';
import {
	advisors,
	colleges,
	courses,
	departments,
	instructorCourses,
	studentAcademicInfo,
	studentAdvisors,
	studentCourses,
	students,
	users,
} from '../db/schema';

export const allowedTables: Record<string, any> = {
	advisors,
	colleges,
	courses,
	departments,
	instructor_courses: instructorCourses,
	student_academic_info: studentAcademicInfo,
	student_advisors: studentAdvisors,
	student_courses: studentCourses,
	students,
	users,
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

	// Check table-level permission
	const tablePermission = currentUser.permissions.some(
		(perm) => perm.table_name === queryDef.table
	);
	if (!tablePermission) {
		throw new Error("User does not have permission to access this table");
	}

	// Check column-level permissions for the base table and joins
	for (const col of queryDef.select) {
		if (!col.includes('.')) {
			// Unqualified columns from the base table
			const hasColumnPermission = currentUser.permissions.some(
				(perm) =>
					perm.table_name === queryDef.table &&
					perm.column_name === col
			);
			if (!hasColumnPermission) {
				throw new Error(`User does not have permission to access column ${col}`);
			}
		} else {
			// Qualified columns like "students.first_name"
			const [joinTableName, columnName] = col.split('.');
			const joinPermission = currentUser.permissions.some(
				(perm) =>
					perm.table_name === joinTableName &&
					perm.column_name === columnName
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
		// Instead of expecting .left and .right, we expect an object with multiple columns.
		const joinMap: Record<string, Array<Record<string, string>>> = {};
		for (const joinDef of queryDef.joins) {
			if (!allowedTables[joinDef.table]) {
				throw new Error(`Join table ${joinDef.table} is not allowed`);
			}

			if (!joinDef.on || typeof joinDef.on !== 'object') {
				throw new Error("Join definition must include an 'on' object with key/value pairs");
			}

			if (!joinMap[joinDef.table]) {
				joinMap[joinDef.table] = [];
			}
			// Push the entire "on" object (with multiple pairs) for this join
			joinMap[joinDef.table].push(joinDef.on);
		}

		// For each join table, combine the conditions using an array.
		for (const joinTableName in joinMap) {
			const joinTable = allowedTables[joinTableName];
			// Each element in joinMap[joinTableName] is an object like { term: 'term', year: 'year', ... }
			const conditions = joinMap[joinTableName].map(onClause => {
				const subconditions = Object.entries(onClause).map(([leftKey, rightKey]) => {
					let leftCol;
					// If leftKey is qualified (e.g., "someTable.mnumber")
					if (leftKey.includes('.')) {
						const [sourceAlias, colName] = leftKey.split('.');
						const sourceTable = allowedTables[sourceAlias];
						if (!sourceTable || !(colName in sourceTable)) {
							throw new Error(`Column ${leftKey} is not allowed or join table ${sourceAlias} is not permitted`);
						}
						leftCol = sourceTable[colName];
					} else {
						// Else assume it's on the base table
						leftCol = baseTable[leftKey];
					}

					const rightCol = joinTable[rightKey];
					if (!leftCol || !rightCol) {
						throw new Error(`Invalid join condition: ${leftKey} or ${rightKey} not found`);
					}
					return eq(leftCol, rightCol);
				});
				// Combine all column comparisons into one AND condition
				return and(...subconditions);
			});

			// Combine multiple "on" objects for the same table into a single AND
			const joinCondition = and(...conditions);
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
	if (queryDef.table === 'instructor_courses' && currentUser.currentRole.role_name === 'faculty') {
		console.log('[automaticFilters] Faculty role detected: applying filter on user_id');
		whereClause = eq(table.user_id, currentUser.user_id);
	}
	return whereClause;
}