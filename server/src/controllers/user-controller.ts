import { Request, Response } from 'express';
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
// Import UserService and potentially the filters interface
import { UserService, UserFilters } from '../services/user-service';
import { AuthAndPermissionsRequest } from '../types/requests';

// Helper function to parse boolean query params
function parseBoolean(value: any): boolean | undefined {
	if (typeof value === 'string') {
		if (value.toLowerCase() === 'true') return true;
		if (value.toLowerCase() === 'false') return false;
	}
	return undefined; // Return undefined if not 'true' or 'false'
}

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

	/**
	 * Get all users with optional filters (Admin only)
	 */
	static async getAllUsers(req: Request, res: Response) {
		try {
			// Extract and prepare filters from query parameters
			const filters: UserFilters = {};
			const { isEnabled, college, department, name, email, mnumber } = req.query;

			const parsedEnabled = parseBoolean(isEnabled);
			if (parsedEnabled !== undefined) {
				filters.isEnabled = parsedEnabled;
			}
			if (typeof college === 'string') filters.college = college;
			if (typeof department === 'string') filters.department = department;
			if (typeof name === 'string') filters.name = name;
			if (typeof email === 'string') filters.email = email;
			if (typeof mnumber === 'string') filters.mnumber = mnumber;


			// Call the service method
			const users = await UserService.getAllUsers(filters);

			res.status(200).json(users);

		} catch (error: any) {
			console.error('Error getting all users:', error);
			res.status(500).json({ success: false, message: 'An error occurred while fetching users' });
		}
	}


	/**
	 * Provision or update user details (Admin only)
	 */
	static async provisionUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;
			// Extract optional details from the body
			const { mnumber, isEnabled, college, department } = req.body;

			// Basic validation (more complex validation can be added)
			if (!userId) {
				res.status(400).json({ success: false, message: 'User ID is required' });
				return;
			}

			const details: {
				mnumber?: string;
				isEnabled?: boolean;
				college?: string;
				department?: string;
			} = {};

			// Only include fields if they are present in the request body
			if (mnumber !== undefined) details.mnumber = mnumber; // Allow null/empty string based on service logic
			if (isEnabled !== undefined) {
				if (typeof isEnabled !== 'boolean') {
					res.status(400).json({ success: false, message: 'isEnabled must be a boolean' });
					return;
				}
				details.isEnabled = isEnabled;
			}
			// Require both college and department if either is provided for faculty update
			if (college !== undefined || department !== undefined) {
				if (college === undefined || department === undefined) {
					res.status(400).json({ success: false, message: 'Both college and department must be provided to update faculty details' });
					return;
				}
				if (typeof college !== 'string' || typeof department !== 'string') {
					res.status(400).json({ success: false, message: 'College and department must be strings' });
					return;
				}
				details.college = college;
				details.department = department;
			}

			// Call the service method
			const result = await UserService.provisionUser(userId, details);

			// Send response based on service result
			if (result.success) {
				// On success, status is 200 and includes the updated user
				res.status(result.status).json({ success: true, user: result.user });
			} else {
				// On failure, use status and message from service
				res.status(result.status).json({ success: false, message: result.message });
			}

		} catch (error: any) {
			// Catch unexpected errors during controller execution
			console.error('Error in provisionUser controller:', error);
			res.status(500).json({ success: false, message: 'An unexpected error occurred' });
		}
	}


} 