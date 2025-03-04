// @ts-nocheck
import express from 'express';
import { getDbConnection } from '../db/connection';
import { attachUserPermissions } from '../middleware/attachUserPermissions';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { buildDrizzleQuery, allowedTables } from '../utils/buildDrizzleQuery';
import { relationshipsMapping } from '../utils/relationshipMapping';

// Define the API endpoint
export const customQuery = express.Router()
	.use(authenticateJWT)
	.use(attachUserPermissions)

	/**
	 * @openapi
	 * /api/custom-query/metadata:
	 *   get:
	 *     tags:
	 *      - Custom Queries
	 *     summary: Get metadata for allowed tables and columns based on user permissions.
	 *     description: >
	 *       Returns a list of allowed tables and columns based on the user's permissions.
	 *       This metadata can be used to build custom queries with role-based filters and joins.
	 *     responses:
	 *       200:
	 *         description: Metadata retrieved successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 metadata:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       table:
	 *                         type: string
	 *                         description: Name of the table.
	 *                         example: "student_courses"
	 *                       columns:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                         description: List of columns that the user has permission to read.
	 *                         example: ["mnumber", "term", "year", "crn", "course_subject", "course_number"]
	 */
	.get('/metadata', (req, res) => {
		try {
			// Ensure that RBAC middleware has populated req.user.permissions.
			const userPermissions = req.user?.permissions;
			if (!userPermissions) {
				return res.status(400).json({ error: "User permissions not found" });
			}

			// Build metadata for each allowed table.
			const metadata = Object.keys(allowedTables).map((tableName) => {
				// Get allowed columns for this table from user permissions.
				const allowedColumns = userPermissions
					.filter((perm: any) => perm.permission_table === tableName && perm.can_read)
					.map((perm: any) => perm.permission_column);
				const columns = Array.from(new Set(allowedColumns));

				// Retrieve relationship info from the static mapping.
				const relationships = relationshipsMapping[tableName] || [];

				return {
					table: tableName,
					columns,
					relationships
				};
			});

			res.json({ metadata });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	})


	/**
	 * @openapi
	 * /api/custom-query/execute:
	 *   post:
	 *     tags:
	 *      - Custom Queries
	 *     summary: Execute a custom query using Drizzle ORM with role-based filters and joins.
	 *     description: >
	 *       Accepts a JSON payload that defines a custom query, including the table, selected columns,
	 *       filters, joins, sorting, and pagination options, as well as the role view to use.
	 *       The backend validates the input, applies automatic role-based filters (e.g., Faculty only sees their own courses),
	 *       builds the query dynamically using Drizzle ORM (with joins if specified), and returns the query results.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               queryDef:
	 *                 type: object
	 *                 properties:
	 *                   table:
	 *                     type: string
	 *                     description: Name of the base table to query. Must be an allowed table.
	 *                     example: "student_courses"
	 *                   select:
	 *                     type: array
	 *                     items:
	 *                       type: string
	 *                     description: List of columns to select. Qualified names (e.g. "students.first_name") are allowed.
	 *                     example: [
	 *                       "mnumber",
	 *                       "term",
	 *                       "year",
	 *                       "crn",
	 *                       "course_subject",
	 *                       "course_number",
	 *                       "course_suffix",
	 *                       "course_section",
	 *                       "course_hours",
	 *                       "registration_status",
	 *                       "instructional_method",
	 *                       "last_attendance",
	 *                       "students.first_name",
	 *                       "students.last_name"
	 *                     ]
	 *                   filters:
	 *                     type: array
	 *                     items:
	 *                       type: object
	 *                       properties:
	 *                         column:
	 *                           type: string
	 *                           description: Column name to filter on.
	 *                           example: "registration_status"
	 *                         operator:
	 *                           type: string
	 *                           description: Comparison operator (e.g., "=", "LIKE").
	 *                           example: "="
	 *                         value:
	 *                           type: string
	 *                           description: Value to compare against.
	 *                           example: "Enrolled"
	 *                     description: List of filter conditions.
	 *                   joins:
	 *                     type: array
	 *                     items:
	 *                       type: object
	 *                       properties:
	 *                         table:
	 *                           type: string
	 *                           description: The name of the table to join.
	 *                           example: "students"
	 *                         on:
	 *                           type: object
	 *                           properties:
	 *                             left:
	 *                               type: string
	 *                               description: Column from the base table to join on.
	 *                               example: "mnumber"
	 *                             right:
	 *                               type: string
	 *                               description: Column from the join table to join on.
	 *                               example: "mnumber"
	 *                     description: List of join definitions.
	 *                   sort:
	 *                     type: object
	 *                     properties:
	 *                       column:
	 *                         type: string
	 *                         description: Column name to sort by.
	 *                         example: "crn"
	 *                       direction:
	 *                         type: string
	 *                         enum: [asc, desc]
	 *                         description: Sort direction.
	 *                         example: "asc"
	 *                   pagination:
	 *                     type: object
	 *                     properties:
	 *                       limit:
	 *                         type: integer
	 *                         description: Maximum number of records to return.
	 *                         example: 10
	 *                       offset:
	 *                         type: integer
	 *                         description: Number of records to skip.
	 *                         example: 0
	 *                 required:
	 *                   - table
	 *                   - select
	 *               role:
	 *                 type: string
	 *                 description: >
	 *                   The role view to apply (e.g., "Faculty"). This determines which automatic filters are applied.
	 *                 example: "Faculty"
	 *           example:
	 *             queryDef:
	 *               table: "student_courses"
	 *               select:
	 *                 - "mnumber"
	 *                 - "term"
	 *                 - "year"
	 *                 - "crn"
	 *                 - "course_subject"
	 *                 - "course_number"
	 *                 - "course_suffix"
	 *                 - "course_section"
	 *                 - "course_hours"
	 *                 - "registration_status"
	 *                 - "instructional_method"
	 *                 - "last_attendance"
	 *                 - "students.first_name"
	 *                 - "students.last_name"
	 *               joins:
	 *                 - table: "students"
	 *                   on:
	 *                     left: "mnumber"
	 *                     right: "mnumber"
	 *               filters: []
	 *               sort:
	 *                 column: "crn"
	 *                 direction: "asc"
	 *               pagination:
	 *                 limit: 10
	 *                 offset: 0
	 *             role: "Faculty"
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
	.post('/execute', async (req, res) => {
		try {
			const { queryDef, role } = req.body;
			const { orm } = await getDbConnection();
			console.log(JSON.stringify(queryDef, null, 2));

			// Check if the user has the role they claim to have.
			const hasRole = req.user.roles.some((r: { role_id: number, role_name: string }) => r.role_name === role);

			if (!hasRole) {
				return res.status(403).json({ error: "User does not have the specified role" });
			}

			// If they have said role, assign it to the user object.
			req.user.currentRole = req.user.roles.find((r: { role_id: number, role_name: string }) => r.role_name === role);
			const query = await buildDrizzleQuery(queryDef, orm, req.user);
			const results = await query;
			console.log(results);
			res.json({ results });
		} catch (error: any) {
			console.error("Error processing custom query:", error);
			res.status(400).json({ error: error.message });
		}
	});