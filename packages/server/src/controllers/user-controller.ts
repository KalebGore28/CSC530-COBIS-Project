import { Request, Response } from 'express';
import { fromNodeHeaders } from "better-auth/node";
import { authPromise } from "../lib/auth";
import { UserService, UserFilters } from '../services/user-service';
import { AuthAndPermissionsRequest } from '../types/requests';
import { getDbConnection } from '../db/connection';
import { user } from '../db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// --- Validation Schemas ---
export const UserIdParamsSchema = z.object({
	userId: z.string().min(1, { message: "User ID cannot be empty" })
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
		}),

	college: z.string().min(1).optional(),
	department: z.string().min(1).optional(), // Optional string, non-empty if provided
	name: z.string().min(1).optional(), // Optional string, non-empty if provided
	email: z.string().optional(), // Optional, must be valid email format
	mnumber: z.string().min(1).optional() // Optional string, non-empty if provided
});

export const ProvisionUserBodySchema = z.object({
	// role_ids: Mandatory array of unique integers. Use min(1) if empty array is not allowed.
	role_ids: z.array(z.number().int({ message: "Each role ID must be an integer" }), {
		required_error: "role_ids is required", // Error if key is missing
		invalid_type_error: "role_ids must be an array of integers",
	})
		.min(1, { message: "At least one role ID must be provided in the role_ids array" }) // Ensure array is not empty
		.transform(ids => [...new Set(ids)]), // Remove duplicates

	// mnumber: Optional string, allowing null. Empty string is treated as null.
	mnumber: z.preprocess(
		(val) => (val === "" ? null : val), // Convert empty string to null before validation
		z.string({ invalid_type_error: "mnumber must be a string or null" })
			.nullable() // Allow null
			.optional() // Allow undefined (key not present)
	),

	// isEnabled: Optional boolean
	isEnabled: z.boolean({ invalid_type_error: "isEnabled must be a boolean" })
		.optional(),

	// college & department: Optional strings, but *must* be provided together if one is present.
	college: z.string({ invalid_type_error: "college must be a string" })
		.min(1, { message: "college cannot be empty if provided" }) // Optional: ensure non-empty if present
		.optional(),

	department: z.string({ invalid_type_error: "department must be a string" })
		.min(1, { message: "department cannot be empty if provided" }) // Optional: ensure non-empty if present
		.optional(),

	// `superRefine` allows cross-field validation after individual fields are parsed.
}).superRefine((data, ctx) => {
	const collegeProvided = data.college !== undefined;
	const departmentProvided = data.department !== undefined;

	// Check if only one of the two is provided
	if (collegeProvided !== departmentProvided) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Both college and department must be provided together, or neither should be provided.",
			path: ["college", "department"],
		});
	}
})

type ProvisionUserDetails = z.output<typeof ProvisionUserBodySchema>;
const ProvisionUserRequestSchema = z.object({
	params: UserIdParamsSchema,
	body: ProvisionUserBodySchema,
});


/**
 * Controller for user-related endpoints
 */
export class UserController {
	/**
	 * Get the current user's session and user data
	 */
	static async getUserInfo(req: Request, res: Response) {
		// simulate a delay
		// await new Promise(resolve => setTimeout(resolve, 5000));
		try {
			// Get the session using better-auth
			const auth = await authPromise();
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

				// Update the lastLogin timestamp in the database
				const { orm } = await getDbConnection();
				await orm.update(user)
					.set({ lastLogin: new Date() })
					.where(eq(user.id, session.user.id))

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
		const authRequest = req as AuthAndPermissionsRequest;
		const currentUserId = authRequest.user.id;

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

		// Check if the user is trying to disable themselves
		if (userId === currentUserId) {
			res.status(400).json({
				success: false,
				message: 'You cannot disable your own account'
			});
			return;
		}

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
			res.status(500).json({
				success: false,
				message: 'An error occurred while disabling the user'
			});
			return;
		}
	}

	/**
	 * Get all users with optional filters (Admin only)
	 * Fetches users with role IDs as a JSON string and parses it into an array.
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
			if (error instanceof SyntaxError) {
				res.status(500).json({ success: false, message: 'An error occurred while processing user role data' });
			} else {
				res.status(500).json({ success: false, message: 'An error occurred while fetching users' });
			}
		}
	}

	/**
	 * Get a specific user by ID (Admin only)
	 */
	static async getUser(req: Request, res: Response) {
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
			const user = await UserService.getUser(userId);
			if (!user) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			res.status(200).json(user);

		} catch (error: any) {
			res.status(500).json({ success: false, message: 'An error occurred while fetching the user' });
		}
	}


	/**
	 * Provision or update user details and roles (Admin only).
	 */
	static async provisionUser(req: Request, res: Response) {
		// --- Zod Validation for Params and Body ---
		const validationResult = ProvisionUserRequestSchema.safeParse({
			params: req.params,
			body: req.body,
		});

		if (!validationResult.success) {
			// If validation fails, return a 400 Bad Request with Zod errors
			res.status(400).json({
				success: false,
				message: 'Invalid request data',
				errors: validationResult.error.format(),
			});
			return;
		}

		// --- Use Validated Data ---
		// Extract validated data with correct types
		const { userId } = validationResult.data.params;
		const details: ProvisionUserDetails = validationResult.data.body;
		// 'details' now contains:
		// - role_ids: number[] (guaranteed non-empty and unique)
		// - mnumber?: string | null (empty string input becomes null)
		// - isEnabled?: boolean
		// - college?: string (only if department is also present)
		// - department?: string (only if college is also present)

		try {
			// Call the service method with validated userId and details object
			// The 'details' object contains role_ids already.
			const result = await UserService.provisionUser(userId, details);

			// Send response based on service result
			if (result.success) {
				res.status(result.status).json({ success: true, user: result.user });
			} else {
				res.status(result.status).json({ success: false, message: result.message });
			}

		} catch (error: any) {
			res.status(500).json({ success: false, message: 'An unexpected error occurred during user provisioning' });
		}
	}
} 