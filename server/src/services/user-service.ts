import { eq, and, or, ne, like, SQL } from "drizzle-orm"; // Import necessary Drizzle functions
import { getDbConnection } from "../db/connection";
// Import both user and faculty schemas
import { user, faculty } from "../db/schema";

// Helper function to derive names (basic example)
function deriveNames(fullName: string | null): { firstName: string; lastName: string } {
	if (!fullName) {
		return { firstName: 'Unknown', lastName: 'Unknown' };
	}
	const parts = fullName.trim().split(/\s+/); // Split by whitespace
	const firstName = parts[0] || 'Unknown';
	const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Unknown'; // Handle middle names/multiple last names
	return { firstName, lastName };
}


/**
 * Interface for getAllUsers filters
 */
export interface UserFilters {
	isEnabled?: boolean;
	college?: string;
	department?: string;
	name?: string;
	email?: string;
	mnumber?: string; // Allow filtering by mnumber too
}

/**
 * Service class for handling user-related data operations
 */
export class UserService {
	/**
	 * Check if an M-number is already taken by another user
	 * 
	 * @param mnumber The M-number to check
	 * @returns True if the M-number is already taken, false otherwise
	 */
	static async isMnumberTaken(mnumber: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		const existingUserWithMnumber = await db
			.select()
			.from(user)
			.where(eq(user.mnumber, mnumber))
			.limit(1);

		return existingUserWithMnumber.length > 0;
	}

	/**
	 * Get a user by their user ID
	 * 
	 * @param userId The user ID to lookup
	 * @returns The user data or null if not found
	 */
	static async getUserById(userId: string) {
		const db = (await getDbConnection()).orm;

		const userData = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		return userData[0] || null;
	}

	/**
	 * Update a user's M-number
	 * 
	 * @param userId The user ID to update
	 * @param mnumber The new M-number to set
	 */
	static async updateMnumber(userId: string, mnumber: string) {
		const db = (await getDbConnection()).orm;

		await db
			.update(user)
			.set({ mnumber })
			.where(eq(user.id, userId));
	}

	/**
	 * Update a user's enabled status
	 */
	static async updateUserEnabled(userId: string, isEnabled: boolean) {
		const db = (await getDbConnection()).orm;
		return await db
			.update(user)
			.set({
				isEnabled: isEnabled,
				updatedAt: new Date()
			})
			.where(eq(user.id, userId));
	}

	/**
 * Get a list of users with optional filters, including faculty data.
 *
 * @param filters Optional filters for isEnabled, college, department, name, email, mnumber.
 * @returns An array of user objects with potential faculty data.
 */
	static async getAllUsers(filters: UserFilters = {}) {
		const db = (await getDbConnection()).orm;
		const conditions: SQL[] = []; // Array to hold WHERE conditions

		// Build conditions based on filters
		if (filters.isEnabled !== undefined) {
			conditions.push(eq(user.isEnabled, filters.isEnabled));
		}
		if (filters.name) {
			// Case-insensitive search for name
			conditions.push(like(user.name, `%${filters.name}%`));
		}
		if (filters.email) {
			// Case-insensitive search for email
			conditions.push(like(user.email, `%${filters.email}%`));
		}
		if (filters.mnumber) {
			conditions.push(eq(user.mnumber, filters.mnumber));
		}

		// Filters requiring the JOINED faculty table
		// Note: If filtering by college/dept, users without an mnumber or faculty entry won't match
		if (filters.college) {
			conditions.push(eq(faculty.college, filters.college));
		}
		if (filters.department) {
			conditions.push(eq(faculty.department, filters.department));
		}

		// Base query with left join
		const query = db
			.select({
				// Select desired fields for the list view
				id: user.id,
				mnumber: user.mnumber,
				name: user.name,
				email: user.email,
				image: user.image,
				isEnabled: user.isEnabled,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt,
				// Include faculty data (will be null if no match)
				college: faculty.college,
				department: faculty.department,
			})
			.from(user)
			.leftJoin(faculty, eq(user.mnumber, faculty.mnumber));

		// Apply conditions if any exist
		const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

		// Execute query
		const users = await finalQuery;
		return users;
	}


	/**
	 * Provision or update a user's details, including enabling, setting M-number,
	 * and ensuring faculty record exists. Designed for admin use.
	 *
	 * @param userId The ID of the user to provision/update.
	 * @param details Object containing optional mnumber, isEnabled, college, department.
	 * @returns Object indicating success or containing error information.
	 */
	static async provisionUser(userId: string, details: {
		mnumber?: string;
		isEnabled?: boolean;
		college?: string;
		department?: string;
	}) {
		const db = (await getDbConnection()).orm;
		let finalMnumber: string | null = null; // Track the mnumber to use for faculty upsert

		try {
			// 1. Fetch User
			const currentUserData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
			if (currentUserData.length === 0) {
				return { success: false, status: 404, message: 'User not found' };
			}
			const originalUser = currentUserData[0];
			finalMnumber = originalUser.mnumber; // Start with existing mnumber

			// 2. Prepare User Update object
			const userUpdateData: Partial<typeof user.$inferInsert> = {}; // Use inferInsert for partial type

			// 3. Handle M-number update
			if (details.mnumber !== undefined) {
				if (details.mnumber === null || details.mnumber.trim() === '') {
					// Allow setting mnumber to null if needed
					userUpdateData.mnumber = null;
					finalMnumber = null;
				} else {
					// Check uniqueness only if mnumber is changing to a non-null value
					if (details.mnumber !== originalUser.mnumber) {
						const existingUserWithMnumber = await db
							.select({ id: user.id })
							.from(user)
							.where(and(
								eq(user.mnumber, details.mnumber),
								ne(user.id, userId) // Exclude the current user
							))
							.limit(1);

						if (existingUserWithMnumber.length > 0) {
							return { success: false, status: 409, message: 'M-number is already assigned to another user' };
						}
					}
					userUpdateData.mnumber = details.mnumber;
					finalMnumber = details.mnumber; // Update finalMnumber for faculty step
				}
			}

			// 4. Handle Enable status update
			if (details.isEnabled !== undefined && details.isEnabled !== originalUser.isEnabled) {
				userUpdateData.isEnabled = details.isEnabled;
			}

			// 5. Perform User Update (if changes detected)
			if (Object.keys(userUpdateData).length > 0) {
				userUpdateData.updatedAt = new Date(); // Update timestamp
				await db.update(user).set(userUpdateData).where(eq(user.id, userId));
			}

			// 6. Handle Faculty Data (only if college AND department are provided)
			if (details.college !== undefined && details.department !== undefined) {
				// 7. Check if we have an M-number to use
				if (!finalMnumber) {
					return { success: false, status: 400, message: 'User must have an M-number assigned before setting college/department' };
				}

				// 8. Derive names (fetch updated user name if necessary, although unlikely to change here)
				const userName = userUpdateData.name || originalUser.name; // Use original name
				const { firstName, lastName } = deriveNames(userName);

				// 9. Perform UPSERT on faculty table
				// We assume 'mnumber' is the primary key or has a unique constraint for conflict target
				await db.insert(faculty)
					.values({
						mnumber: finalMnumber,
						first_name: firstName,
						last_name: lastName,
						college: details.college,
						department: details.department,
					})
					// Type assertion needed because Drizzle's types for onConflictDoUpdate are complex
					.onConflictDoUpdate({
						target: faculty.mnumber, // Target the unique constraint column
						set: { // Fields to update on conflict
							first_name: firstName, // Update names in case they changed? Or keep original? Let's update.
							last_name: lastName,
							college: details.college,
							department: details.department,
							// Note: You might want specific logic for updating existing faculty entries
						}
					} as any); // Use 'as any' to bypass complex typing if necessary, ensure target/set are correct
			}

			// 10. Return success
			// Fetch the final state of the user to return it
			const updatedUserDetails = await this.getUserDetailsById(userId); // Reuse the method from earlier discussion if available or implement similar logic
			return { success: true, status: 200, user: updatedUserDetails }; // Return updated user details

		} catch (error: any) {
			console.error("Error in provisionUser:", error);
			// Check for specific database errors if possible (e.g., constraint violations)
			return { success: false, status: 500, message: error.message || 'Internal server error during provisioning' };
		}
	}

	/**
	* Get detailed user information by user ID, including faculty data if available.
	* (Copied from previous discussion - assumed needed for provisionUser return)
	*
	* @param userId The ID of the user to fetch details for.
	* @returns An object containing user details and potentially faculty details, or null if user not found.
	*/
	static async getUserDetailsById(userId: string) {
		const db = (await getDbConnection()).orm;

		const results = await db
			.select({
				userId: user.id,
				mnumber: user.mnumber,
				name: user.name,
				email: user.email,
				image: user.image,
				isEnabled: user.isEnabled,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				college: faculty.college,
				department: faculty.department,
			})
			.from(user)
			.leftJoin(faculty, eq(user.mnumber, faculty.mnumber))
			.where(eq(user.id, userId))
			.limit(1);

		if (results.length === 0) {
			return null;
		}

		const userData = results[0];
		// Clean up the object, removing faculty fields if they are null
		const userDetails: any = {
			id: userData.userId,
			mnumber: userData.mnumber,
			name: userData.name,
			email: userData.email,
			image: userData.image,
			isEnabled: userData.isEnabled,
			lastLogin: userData.lastLogin,
			createdAt: userData.createdAt,
			updatedAt: userData.updatedAt,

		};
		if (userData.college !== null && userData.department !== null) {
			userDetails.college = userData.college;
			userDetails.department = userData.department;
		}


		return userDetails;
	}
} 