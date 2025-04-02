// @ts-nocheck
import { fromNodeHeaders } from "better-auth/node";
import express, { Request, Response } from 'express';
import { auth } from "../lib/auth";
import 'zod-openapi/extend';
import { z } from 'zod';

import { getDbConnection } from '../db/connection';
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthAndPermissionsRequest } from "../types/requests";


const router = express.Router();

router.get("/me", async (req: Request, res: Response) => {
	const db = (await getDbConnection()).orm;
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (session) {

		// Attach properties to the session object
		session.roles = (req as AuthAndPermissionsRequest).roles || [];
		session.permissions = (req as AuthAndPermissionsRequest).permissions || [];
		session.department = (req as AuthAndPermissionsRequest).department || null;
		session.college = (req as AuthAndPermissionsRequest).college || null;
		session.mnumber = (req as AuthAndPermissionsRequest).mnumber || null;
		session.isEnabled = (req as AuthAndPermissionsRequest).isEnabled || null;
	}
	res.json(session);
	return;
});
const meSpec = {
	'/api/user/me': {
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

router.post('/update-mnumber', async (req: Request, res: Response) => {
	const db = (await getDbConnection()).orm;
	// Extract mnumber from the request body
	const { mnumber } = req.body;

	// Get the current user from the request (attached by authenticateUser middleware)
	const currentUser = (req as any).user; // Adjust based on your middleware's user object

	// Step 1: Validate input
	if (!mnumber || typeof mnumber !== 'string') {
		return res.status(400).json({
			success: false,
			message: 'Mnumber is required and must be a string',
		});
	}

	try {
		// Step 2: Fetch the current user's data from the database
		const currentUserData = await db
			.select()
			.from(user)
			.where(eq(user.id, currentUser.id))
			.limit(1);

		if (!currentUserData[0]) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Step 3: Check if the user already has an mnumber
		if (currentUserData[0].mnumber !== null) {
			return res.status(403).json({
				success: false,
				message: 'Cannot change mnumber. Contact admin to change.',
			});
		}

		// Step 4: Check if the mnumber is already taken by another user
		const existingUserWithMnumber = await db
			.select()
			.from(user)
			.where(eq(user.mnumber, mnumber))
			.limit(1);

		if (existingUserWithMnumber[0]) {
			return res.status(409).json({
				success: false,
				message: 'Mnumber already taken. If this is yours, contact admin to fix.',
			});
		}

		// Step 5: Update the user's mnumber
		await db
			.update(user)
			.set({ mnumber })
			.where(eq(user.id, currentUser.id));

		// Step 6: Return success response
		return res.json({
			success: true,
			message: 'Mnumber updated successfully',
		});
	} catch (error) {
		// Step 7: Handle unexpected errors
		console.error('Error updating mnumber:', error);
		return res.status(500).json({
			success: false,
			message: 'An error occurred while updating your mnumber',
		});
	}
});
const mnumber = z.string().openapi({ description: 'The mnumber to update', example: 'M12345678', ref: 'mnumber' });
const updateMnumberSpec = {
	'/api/user/update-mnumber': {
		post: {
			tags: ['User'],
			operationId: 'updateMnumber',
			description: 'Update the current user\'s mnumber',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mnumber,
						}),
					},
				},
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string(),
							}),
						},
					},
				},
			},
		},
	}
}


export const userSpecs = {
	...meSpec,
	...updateMnumberSpec,
}

export default router;