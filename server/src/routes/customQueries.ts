import express from 'express';
import { getDbConnection } from '../db/connection';
import { departments, colleges } from '../db/schema';
import { attachUserPermissions } from '../middleware/attachUserPermissions';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { eq, like } from 'drizzle-orm';

const allowedTables: Record<string, any> = {
	departments: departments,
	colleges: colleges,
	// Add more allowed table mappings here
};

const allowedOperators = ['=', '!=', '>', '<', 'LIKE'];

/**
 * Builds a Drizzle ORM query based on the query definition.
 * Uses the permissions attached by middleware (req.user.permissions) to enforce RBAC.
 *
 * @param queryDef - The JSON query definition from the client.
 * @param orm - The Drizzle ORM instance.
 * @param userPermissions - The permissions array attached to req.user.permissions.
 */
export async function buildDrizzleQuery(queryDef: any, orm: any, userPermissions: any[]) {
	// Validate table
	const table = allowedTables[queryDef.table];
	if (!table) {
		throw new Error("Invalid table name");
	}

	// Check if the user has read permission for the requested table.
	const permitted = userPermissions.some(
		(perm) => perm.permission_table === queryDef.table && perm.can_read
	);
	if (!permitted) {
		throw new Error("User does not have permission to access this table");
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

	// Apply filters
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
			// Map operator to drizzle operator.
			if (filter.operator === '=') {
				query = query.where(eq(table[filter.column], filter.value));
			} else if (filter.operator === 'LIKE') {
				query = query.where(like(table[filter.column], filter.value));
			}
			// You can add more operator cases as needed.
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
	.use(authenticateJWT)
	.use(attachUserPermissions)
	.post('/custom_query', async (req, res) => {
		try {
			const queryDef = req.body;
			const { orm } = await getDbConnection();
			// Instead of passing a user ID, we pass the permissions attached by the middleware.
			// @ts-ignore
			const query = await buildDrizzleQuery(queryDef, orm, req.user.permissions);
			const results = await query;
			res.json({ results });
		} catch (error: any) {
			console.error("Error processing custom query:", error);
			res.status(400).json({ error: error.message });
		}
	});