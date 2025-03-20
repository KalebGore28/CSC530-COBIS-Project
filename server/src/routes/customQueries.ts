// TODO: Fix type issues in this file
import express, { Request, Response } from 'express';
import { getDbConnection } from '../db/connection';
import { buildDrizzleQuery, allowedTables } from '../utils/buildDrizzleQuery';
import { relationshipsMapping } from '../utils/relationshipMapping';

import { authenticateUser } from '../middleware/authenticateUser';
import { getRolesPermissions } from '../middleware/getRolesPermissions';
import { hasRole } from '../middleware/hasRole';

const COBIS_ADMIN_ROLE_ID = 6;

// Define the API endpoint
const router = express.Router()

// Attach middleware
router.use(authenticateUser)
router.use(getRolesPermissions)
// @ts-ignore
router.use(hasRole(COBIS_ADMIN_ROLE_ID))

router.get('/metadata', (req: Request, res: Response) => {
	try {
		// Ensure RBAC middleware has populated req.user.permissions
		const userPermissions = (req as any).permissions; // Use 'as any' if req.user isn't typed
		if (!userPermissions) {
			return res.status(400).json({ error: 'User permissions not found' });
		}

		// Build metadata for each allowed table
		const metadata = Object.keys(allowedTables).map((tableName) => {
			// Get allowed columns for this table from user permissions
			const allowedColumns = userPermissions
				.filter((perm: { table_name: string; column_name: string }) => perm.table_name === tableName)
				.map((perm: { table_name: string; column_name: string }) => perm.column_name);
			const columns = Array.from(new Set(allowedColumns)); // Remove duplicates

			// Retrieve relationship info from the static mapping
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
router.post('/execute', async (req: Request, res: Response) => {
	try {
		const { queryDef, role } = req.body;
		const { orm } = await getDbConnection();
		console.log(JSON.stringify(queryDef, null, 2));

		// Check if the user has the role they claim to have.
		const hasRole = req.roles.some((r: { role_id: number, role_name: string }) => r.role_name === role);

		if (!hasRole) {
			return res.status(403).json({ error: "User does not have the specified role" });
		}

		// If they have said role, assign it to the user object.
		req.user.currentRole = req.roles.find((r: { role_id: number, role_name: string }) => r.role_name === role);
		req.user.permissions = req.permissions;
		const query = await buildDrizzleQuery(queryDef, orm, req.user);
		const results = await query;
		res.json({ results });
	} catch (error: any) {
		console.error("Error processing custom query:", error);
		res.status(400).json({ error: error.message });
	}
});

export default router;