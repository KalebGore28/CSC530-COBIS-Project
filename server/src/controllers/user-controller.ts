import { Request, Response } from 'express';
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { UserService } from '../services/user-service';
import { AuthAndPermissionsRequest } from '../types/requests';

/**
 * Controller for user-related endpoints
 */
export class UserController {
	/**
	 * Get the current user's session and user data
	 */
	static async getUserInfo(req: Request, res: Response) {
		try {
			// Get the session using better-auth
			const session = await auth.api.getSession({
				headers: fromNodeHeaders(req.headers),
			});

			if (session) {
				// Get the user information from the request
				const userInfo = {
					roles: (req as AuthAndPermissionsRequest).roles,
					department: (req as AuthAndPermissionsRequest).department,
					college: (req as AuthAndPermissionsRequest).college,
					mnumber: (req as AuthAndPermissionsRequest).mnumber,
					isEnabled: (req as AuthAndPermissionsRequest).isEnabled
				};

				// Enrich the session with user information
				res.json(userInfo);
			} else {
				res.json(null);
			}
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Update the current user's M-number
	 */
	static async updateMnumber(req: Request, res: Response) {
		try {
			// Extract mnumber from the request body
			const { mnumber } = req.body;

			// Get the current user from the request (attached by authenticateUser middleware)
			const currentUser = (req as any).user;

			// Step 1: Validate input
			if (!mnumber || typeof mnumber !== 'string') {
				res.status(400).json({
					success: false,
					message: 'M-number is required and must be a string',
				});
				return;
			}

			// Step 2: Get the current user data
			const userData = await UserService.getUserById(currentUser.id);
			if (!userData) {
				res.status(404).json({
					success: false,
					message: 'User not found',
				});
				return;
			}

			// Step 3: Check if the user already has an M-number
			if (userData.mnumber !== null) {
				res.status(403).json({
					success: false,
					message: 'Cannot change M-number. Contact admin to change.',
				});
				return;
			}

			// Step 4: Check if the M-number is already taken
			const isMnumberTaken = await UserService.isMnumberTaken(mnumber);
			if (isMnumberTaken) {
				res.status(409).json({
					success: false,
					message: 'M-number already taken. If this is yours, contact admin to fix.',
				});
				return;
			}

			// Step 5: Update the user's M-number
			await UserService.updateMnumber(currentUser.id, mnumber);

			// Step 6: Return success response
			res.json({
				success: true,
				message: 'M-number updated successfully',
			});
			return;
		} catch (error) {
			console.error('Error updating M-number:', error);
			res.status(500).json({
				success: false,
				message: 'An error occurred while updating your M-number',
			});
			return;
		}
	}

	/**
	 * Enable a user account
	 */
	static async enableUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;

			// Check if user exists
			const user = await UserService.getUserById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			// Update user's enabled status
			await UserService.updateUserEnabled(userId, true);

			res.json({
				success: true,
				message: 'User enabled successfully'
			});
			return;
		} catch (error) {
			console.error('Error enabling user:', error);
			res.status(500).json({
				success: false,
				message: 'An error occurred while enabling the user'
			});
			return;
		}
	}

	/**
	 * Disable a user account
	 */
	static async disableUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;

			// Check if user exists
			const user = await UserService.getUserById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			// Update user's enabled status
			await UserService.updateUserEnabled(userId, false);

			res.json({
				success: true,
				message: 'User disabled successfully'
			});
			return;
		} catch (error) {
			console.error('Error disabling user:', error);
			res.status(500).json({
				success: false,
				message: 'An error occurred while disabling the user'
			});
			return;
		}
	}
} 