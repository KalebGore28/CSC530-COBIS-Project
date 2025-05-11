import express, { Request, Response } from 'express';
import { getDbConnection } from '../db/connection';
import { buildDrizzleQuery, allowedTables } from '../utils/buildDrizzleQuery';
import { relationshipsMapping } from '../utils/relationshipMapping';

import { hasRole } from '../middleware/has-role';

import { AuthAndPermissionsRequest } from '../types/requests';


// Define the API endpoint
const router = express.Router()

// Attach middleware
// @ts-ignore
router.use(hasRole('cobis_administrator'))

router.get('/metadata', (req: Request, res: Response) => {
	try {
		const userPermissions = (req as AuthAndPermissionsRequest).permissions;
		if (!userPermissions) {
			res.status(400).json({ error: 'User permissions not found' });
			return;
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
		// console.log(JSON.stringify(queryDef, null, 2));

		// Find the role in the user's roles and return the first one that matches
		const selectedRole = (req as AuthAndPermissionsRequest).roles.find((r: { role_id: number, role_name: string }) => r.role_name === role);
		if (!selectedRole) {
			res.status(403).json({ error: "User does not have the specified role" });
			return;
		}

		const userId = (req as AuthAndPermissionsRequest).user.id;
		const userPermissions = (req as AuthAndPermissionsRequest).permissions;
		const query = await buildDrizzleQuery(queryDef, orm, userId, userPermissions, selectedRole);
		const results = await query;
		res.json({ results });
	} catch (error: any) {
		console.error("Error processing custom query:", error);
		res.status(400).json({ error: error.message });
	}
});

export default router;