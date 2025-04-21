import { Request, Response } from 'express';
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { UserService, UserFilters } from '../services/user-service';
import { AuthAndPermissionsRequest } from '../types/requests';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const UserIdParamsSchema = z.object({
	userId: z.string().min(1, { message: "User ID cannot be empty" }).openapi({
		example: "user_2XQo9jk8JtYmIi3qSEoRYgVpnGn"
	})
});

export const GetAllUsersQuerySchema = z.object({
	isEnabled: z.string()
		.optional()
		.transform((val, ctx) => {
			if (val === undefined) return undefined;

			// Convert valid strings to boolean
			if (val.toLowerCase() === 'true') return true;
			if (val.toLowerCase() === 'false') return false;

			// If the string is present but not 'true' or 'false', add an issue
			ctx.addIssue({
				code: z.ZodIssueCode.custom, // Use custom issue code
				message: "Invalid boolean format. Expected 'true' or 'false'.", // Custom error message
			});

			// Return z.NEVER to indicate transform failure if the issue wasn't handled
			return z.NEVER;
		})
		.openapi({
			type: 'boolean',
			description: "Filter by enabled status ('true' or 'false')",
			example: "true",
		}),

	college: z.string().min(1).optional()
		.openapi({
			description: "Filter by college name",
			example: "0"
		}),

	department: z.string().min(1).optional() // Optional string, non-empty if provided
		.openapi({
			description: "Filter by department name",
			example: "0000"
		}),

	name: z.string().min(1).optional() // Optional string, non-empty if provided
		.openapi({
			description: "Filter by user name (partial match)",
			example: "John"
		}),

	email: z.string().email({ message: "Invalid email format provided for filter." }).optional() // Optional, must be valid email format
		.openapi({
			description: "Filter by user email address",
			example: "johndoe@example.com"
		}),

	mnumber: z.string().min(1).optional() // Optional string, non-empty if provided
		.openapi({
			description: "Filter by user M-Number",
			example: "M12345678"
		}),

})

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
		const validationResult = UserIdParamsSchema.safeParse(req.params);

		if (!validationResult.success) {
			// If validation fails, return a 400 Bad Request with Zod errors
			res.status(400).json({
				success: false,
				message: 'Invalid request parameters',
				errors: validationResult.error.format(), // Provides detailed errors
			});
			return;
		}

		const { userId } = validationResult.data;

		try {
			// Check if user exists (using the validated userId)
			const user = await UserService.getUserById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			// Update user's enabled status (using the validated userId)
			await UserService.updateUserEnabled(userId, true);

			res.json({
				success: true,
				message: 'User enabled successfully'
			});
			return;

		} catch (error) {
			console.error(`Error enabling user ${userId}:`, error); // Log context
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
		const validationResult = UserIdParamsSchema.safeParse(req.params);

		if (!validationResult.success) {
			// If validation fails, return a 400 Bad Request with Zod errors
			res.status(400).json({
				success: false,
				message: 'Invalid request parameters',
				errors: validationResult.error.format(), // Provides detailed errors
			});
			return;
		}

		const { userId } = validationResult.data;

		try {
			// Check if user exists (using the validated userId)
			const user = await UserService.getUserById(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			// Update user's enabled status (using the validated userId)
			await UserService.updateUserEnabled(userId, false); // Set to false for disabling

			res.json({
				success: true,
				message: 'User disabled successfully'
			});
			return;

		} catch (error) {
			console.error(`Error disabling user ${userId}:`, error);
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
		const validationResult = GetAllUsersQuerySchema.safeParse(req.query);

		if (!validationResult.success) {
			res.status(400).json({
				success: false,
				message: 'Invalid query parameters',
				errors: validationResult.error.format(),
			});
			return;
		}

		const filters: UserFilters = validationResult.data;

		try {
			const users = await UserService.getAllUsers(filters);
			res.status(200).json(users);

		} catch (error: any) {
			console.error('Error getting all users:', error);
			res.status(500).json({ success: false, message: 'An error occurred while fetching users' });
		}
	}


	/**
	 * Provision or update user details and roles (Admin only).
	 */
	static async provisionUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;
			// Extract details from the body. role_ids is now expected.
			const { mnumber, isEnabled, college, department, role_ids } = req.body;

			// --- Mandatory Fields Validation ---
			if (!userId) {
				res.status(400).json({ success: false, message: 'User ID is required in the URL path' });
				return;
			}
			// --- Role IDs are MANDATORY ---
			if (role_ids === undefined || role_ids === null) { // Explicitly check for missing key
				res.status(400).json({ success: false, message: 'role_ids is required and must be an array of integers' });
				return;
			}
			if (!Array.isArray(role_ids) || !role_ids.every(id => typeof id === 'number' && Number.isInteger(id))) {
				res.status(400).json({ success: false, message: 'role_ids must be an array of integers' });
				return;
			}
			// --- Optional: Check if at least one role MUST be assigned ---
			// Uncomment the following block if an empty role array is not allowed
			/*
			if (role_ids.length === 0) {
				return res.status(400).json({ success: false, message: 'At least one role ID must be provided in the role_ids array' });
			}
			*/
			const uniqueRoleIds = [...new Set(role_ids)]; // Ensure unique IDs before passing

			// --- Start of Optional User Details Validation ---
			const details: {
				mnumber?: string | null;
				isEnabled?: boolean;
				college?: string;
				department?: string;
				role_ids: number[]; // Type now reflects mandatory requirement
			} = {
				role_ids: uniqueRoleIds // Assign validated & unique role IDs
			};

			if ('mnumber' in req.body) {
				details.mnumber = (req.body.mnumber === null || req.body.mnumber === '') ? null : req.body.mnumber;
			}
			if (isEnabled !== undefined) {
				if (typeof isEnabled !== 'boolean') {
					res.status(400).json({ success: false, message: 'isEnabled must be a boolean' });
					return;
				}
				details.isEnabled = isEnabled;
			}
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
			// --- End of Optional User Details Validation ---


			// Call the service method - role_ids is guaranteed to be number[] here
			const result = await UserService.provisionUser(userId, details);

			// Send response based on service result
			if (result.success) {
				res.status(result.status).json({ success: true, user: result.user });
			} else {
				res.status(result.status).json({ success: false, message: result.message });
			}

		} catch (error: any) {
			console.error('Error in provisionUser controller:', error);
			res.status(500).json({ success: false, message: 'An unexpected error occurred' });
		}
	}
} 