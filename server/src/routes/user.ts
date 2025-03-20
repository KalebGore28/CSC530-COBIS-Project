import { fromNodeHeaders } from "better-auth/node";
import express, { Request, Response } from 'express';
import { auth } from "../lib/auth";
import 'zod-openapi/extend';
import { z } from 'zod';

import { AuthAndPermissionsRequest } from "../types/requests";

import { authenticateUser } from "../middleware/authenticateUser";
import { getRolesPermissions } from "../middleware/getRolesPermissions";

const router = express.Router();
router.use(authenticateUser);
router.use(getRolesPermissions);
router.get("/me", async (req: Request, res: Response) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	session.roles = (req as AuthAndPermissionsRequest).roles;
	session.permissions = (req as AuthAndPermissionsRequest).permissions;
	res.json(session);
	return;
});
export const meSpec = {
	'/api/me': {
		get: {
			tags: ['User'],
			operationId: 'getMe',
			description: 'Get the current user',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								session: z.object({
									id: z.string(),
									expiresAt: z.string(),
									token: z.string(),
									createdAt: z.boolean(),
									updatedAt: z.string(),
									ipAddress: z.string(),
									userAgent: z.string(),
									userId: z.string(),
								}),
								user: z.object({ 
									id: z.string(),
									name: z.string(),
									email: z.string(),
									emailVerified: z.boolean(),
									image: z.string().optional(),
									createdAt: z.string(),
									updatedAt: z.string(),
								}),
							}),
						},
					},
				},
			},
		},
	},
};

export default router;