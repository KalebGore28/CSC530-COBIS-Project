import { eq, like, and } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import { departments, colleges, users, roles, permissions, userRoles, userPermissions, rolePermissions } from '../db/schema';
import express from 'express';

const allowedTables: Record<string, any> = {
	departments: departments,
	colleges: colleges,
	// Add more allowed table mappings here
};

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export async function seedRBAC(orm: ReturnType<typeof drizzle>) {
	// Insert a sample user.
	// await orm.insert(users).values({
	// 	id: '112958238101772307723',
	// 	email: 'testuser@example.com',
	// 	display_name: 'Test User',
	// 	is_active: true, // Assuming 1 represents true.
	// 	last_login: new Date().toISOString(),
	// 	created_at: new Date().toISOString(),
	// }).execute();

	// Insert sample roles.
	// await orm.insert(roles).values([
	// 	{ id: 1, name: 'admin' },
	// 	{ id: 2, name: 'report_viewer' },
	// 	{ id: 3, name: 'basic_user' },
	// ]).execute();

	// Insert sample permissions individually.
	// await orm.insert(permissions).values({
	// 	id: 1,
	// 	table_name: 'departments',
	// 	column_name: 'id',
	// 	description: 'Permission to select departments',
	// 	can_read: true,
	// 	can_write: false,
	// }).execute();

	// await orm.insert(permissions).values({
	// 	id: 2,
	// 	table_name: 'colleges',
	// 	column_name: 'id',
	// 	description: 'Permission to select colleges',
	// 	can_read: true,
	// 	can_write: false,
	// }).execute();

	// await orm.insert(permissions).values({
	// 	id: 3,
	// 	table_name: 'reports',
	// 	column_name: 'id',
	// 	description: 'Permission to select reports',
	// 	can_read: true,
	// 	can_write: false,
	// }).execute();
	// // Assign the admin role to the sample user.
	// await orm.insert(userRoles).values({
	// 	user_id: '112958238101772307723',
	// 	role_id: 1,
	// }).execute();

	// // Optionally, assign a direct permission to the sample user.
	// await orm.insert(userPermissions).values({
	// 	user_id: '112958238101772307723',
	// 	permission_id: 1,
	// }).execute();

	// // Link the admin role with all available permissions.
	// await orm.insert(rolePermissions).values([
	// 	{ role_id: 1, permission_id: 1 },
	// 	{ role_id: 1, permission_id: 2 },
	// 	{ role_id: 1, permission_id: 3 },
	// ]).execute();
}

// Example usage:
(async () => {
	const { orm } = await getDbConnection();

	// Run your migrations here, if necessary.
	// e.g., db.exec(migrationSQL);

	// Seed the RBAC data.
	await seedRBAC(orm);

	// Verify seeded data (for debugging purposes).
	const usersData = await orm.select().from(users).execute();
	// console.log('Seeded Users:', usersData);

	const rolesData = await orm.select().from(roles).execute();
	// console.log('Seeded Roles:', rolesData);

	const permissionsData = await orm.select().from(permissions).execute();
	// console.log('Seeded Permissions:', permissionsData);
})();

const allowedOperators = ['=', '!=', '>', '<', 'LIKE'];

// Function to check if the user has permission for the requested table
async function checkUserPermissions(userId: string, table: string) {
	const { orm } = await getDbConnection();

	try {
		// Combine conditions with `and`
		const condition = and(
			eq(userPermissions.user_id, userId),
			eq(permissions.table_name, table)
		);

		// Build and execute the query using a single .where() with the combined condition
		const permissionsResult = await orm
			.select()
			.from(userPermissions)
			.innerJoin(permissions, eq(userPermissions.permission_id, permissions.id))
			.where(condition)
			.execute();

		console.log("Permissions result:", permissionsResult);

		return permissionsResult.length > 0;
	} catch (error) {
		console.error("Error in permission check:", error);
		throw new Error("Error while checking user permissions.");
	}
}

// Build the Drizzle query with the RBAC check
async function buildDrizzleQuery(queryDef: any, orm: any, userId: string) {
	// Validate table
	const table = allowedTables[queryDef.table];
	if (!table) {
		throw new Error("Invalid table name");
	}

	// Await the permission check
	const hasPermission = await checkUserPermissions(userId, queryDef.table);
	if (!hasPermission) {
		throw new Error("User does not have permission to access this table");
	}

	// Build column mapping from the select array
	const columnsToSelect = queryDef.select.reduce((acc: any, col: any) => {
		if (!(col in table)) {
			throw new Error(`Column ${col} is not allowed for table ${queryDef.table}`);
		}
		acc[col] = table[col];
		return acc;
	}, {} as Record<string, any>);

	// Start building the query: select the requested columns
	let query = orm.select(columnsToSelect).from(table);

	// Apply filters
	if (queryDef.filters && Array.isArray(queryDef.filters)) {
		for (const filter of queryDef.filters) {
			// Validate operator
			if (!allowedOperators.includes(filter.operator)) {
				throw new Error("Invalid operator");
			}
			// Validate column
			if (!Object.keys(table).includes(filter.column)) {
				throw new Error(`Column ${filter.column} is not allowed for table ${queryDef.table}`);
			}
			// Map operator to drizzle operator
			if (filter.operator === '=') {
				query = query.where(eq(table[filter.column], filter.value));
			} else if (filter.operator === 'LIKE') {
				query = query.where(like(table[filter.column], filter.value));
			}
		}
	}

	// Sorting
	if (queryDef.sort) {
		query = query.orderBy(table[queryDef.sort.column], queryDef.sort.direction);
	}

	// Pagination
	if (queryDef.pagination) {
		query = query.limit(queryDef.pagination.limit).offset(queryDef.pagination.offset);
	}

	return query;
}

// Define the API endpoint
export const customQuery = express.Router()
	/**
	 * @openapi
	 * /api/custom_query:
	 *   post:
	 *     summary: Execute a custom query using Drizzle ORM.
	 *     description: >
	 *       Accepts a JSON payload that defines a custom query, including the table, selected columns,
	 *       filters, sorting, and pagination options. The backend validates the input, builds the query
	 *       dynamically using Drizzle ORM, and returns the query results.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               table:
	 *                 type: string
	 *                 description: Name of the table to query. Must be an allowed table.
	 *                 example: "departments"
	 *               select:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: List of columns to select.
	 *                 example: ["code", "description", "prefixes"]
	 *               filters:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     column:
	 *                       type: string
	 *                       description: Column name to filter on.
	 *                       example: "college"
	 *                     operator:
	 *                       type: string
	 *                       description: Comparison operator (e.g., "=", "LIKE").
	 *                       example: "="
	 *                     value:
	 *                       type: string
	 *                       description: Value to compare against.
	 *                       example: "BP"
	 *                 description: List of filter conditions.
	 *               sort:
	 *                 type: object
	 *                 properties:
	 *                   column:
	 *                     type: string
	 *                     description: Column name to sort by.
	 *                     example: "code"
	 *                   direction:
	 *                     type: string
	 *                     enum: [asc, desc]
	 *                     description: Sort direction.
	 *                     example: "asc"
	 *               pagination:
	 *                 type: object
	 *                 properties:
	 *                   limit:
	 *                     type: integer
	 *                     description: Maximum number of records to return.
	 *                     example: 50
	 *                   offset:
	 *                     type: integer
	 *                     description: Number of records to skip.
	 *                     example: 0
	 *             required:
	 *               - table
	 *               - select
	 *     responses:
	 *       200:
	 *         description: Query executed successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 results:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     description: A single row of the query result.
	 *       400:
	 *         description: Invalid query definition or processing error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/custom_query', async (req, res) => {
		try {
			const userId = "112958238101772307723"; // Extract user ID from authentication (e.g., JWT token)
			const queryDef = req.body;
			// Assume you have a pre-established drizzle ORM instance.
			const { orm } = await getDbConnection();
			const query = buildDrizzleQuery(queryDef, orm, userId); // Pass user ID for RBAC validation
			const results = await query;
			res.json({ results });
		} catch (error: any) {
			console.error("Error processing custom query:", error);
			res.status(400).json({ error: error.message });
		}
	});