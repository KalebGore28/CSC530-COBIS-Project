import express from 'express';
import { getDbConnection } from '../db/connection';
import { attachUserPermissions } from '../middleware/attachUserPermissions';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { buildDrizzleQuery } from '../utils/buildDrizzleQuery';

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
			console.log(req.user);
			const currentUser = { id: req.user.user_id }; // Ensure req.user is defined and has an id
			const query = await buildDrizzleQuery(queryDef, orm, req.user?.permissions, currentUser);
			const results = await query;
			res.json({ results });
		} catch (error: any) {
			console.error("Error processing custom query:", error);
			res.status(400).json({ error: error.message });
		}
	});