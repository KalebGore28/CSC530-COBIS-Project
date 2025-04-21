import { eq, and, ne, like, SQL, sql, inArray } from "drizzle-orm"; // Import necessary Drizzle functions
import { getDbConnection } from "../db/connection";
// Import both user and faculty schemas
import { user, faculty, userRoles, roles } from "../db/schema";

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

// Define the expected structure for the role object in the output
interface RoleInfo {
	role_id: number;
	role_name: string;
}

// Define the structure for the user object returned by the function
interface UserWithRoles {
	id: string;
	mnumber: string | null;
	name: string | null;
	email: string;
	image: string | null;
	isEnabled: boolean;
	lastLogin: string | null; // Assuming lastLogin is stored as a string (e.g., ISO format)
	createdAt: string; // Assuming createdAt is stored as a string
	college: string | null;
	department: string | null;
	roles: RoleInfo[]; // The desired roles array
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
				college: faculty.college,
				department: faculty.department,
				// Aggregate roles into a JSON array
				// Using json_group_array to create a JSON array of roles
				roles_json: sql<string>`CASE WHEN COUNT(${roles.id}) > 0 THEN json_group_array(json_object('role_id', ${roles.id}, 'role_name', ${roles.name})) ELSE '[]' END`.as('roles_json'),
			})
			.from(user)
			.leftJoin(faculty, eq(user.mnumber, faculty.mnumber))
			.leftJoin(userRoles, eq(user.id, userRoles.user_id))
			.leftJoin(roles, eq(userRoles.role_id, roles.id))
			.groupBy(
				user.id,
				user.mnumber,
				user.name,
				user.email,
				user.image,
				user.isEnabled,
				user.lastLogin,
				user.createdAt,
				faculty.college,
				faculty.department
			);

		// Apply conditions if any exist
		const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

		const usersData = await finalQuery;


		const usersWithParsedRoles: UserWithRoles[] = usersData.map(u => ({
			...u,
			lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null, // Convert Date to ISO string
			createdAt: new Date(u.createdAt).toISOString(), // Convert Date to ISO string
			roles: JSON.parse(u.roles_json) as RoleInfo[], // Parse the string back into an array
		}));

		return usersWithParsedRoles;
	}


	/**
	 * Provision or update a user's details and roles.
	 * Handles user fields, faculty upsert, and user_roles synchronization.
	 * Role IDs are REQUIRED.
	 * Designed for admin use.
	 *
	 * @param userId The ID of the user to provision/update.
	 * @param details Object containing required role_ids and optional mnumber, isEnabled, college, department.
	 * @returns Object indicating success or containing error information.
	 */
	static async provisionUser(userId: string, details: {
		mnumber?: string | null;
		isEnabled?: boolean;
		college?: string;
		department?: string;
		role_ids: number[]; // <--- Changed: Now required (no `?`)
	}) {
		const { orm: db } = await getDbConnection();
		let finalMnumber: string | null = null;

		// --- Start Transaction ---
		return db.transaction(async (tx) => {
			try {
				// 1. Fetch User (using tx)
				const currentUserData = await tx.select().from(user).where(eq(user.id, userId)).limit(1);
				if (currentUserData.length === 0) {
					return { success: false, status: 404, message: 'User not found' };
				}
				const originalUser = currentUserData[0];
				finalMnumber = originalUser.mnumber;

				// 2. Prepare User Update object
				const userUpdateData: Partial<typeof user.$inferInsert> = {};

				// 3. Handle M-number update (using tx) - Logic remains the same
				if ('mnumber' in details) {
					// ... same mnumber update logic ...
					const newMnumber = details.mnumber;
					if (newMnumber !== originalUser.mnumber) {
						if (newMnumber === null) {
							userUpdateData.mnumber = null;
							finalMnumber = null;
						} else {
							const existingUserWithMnumber = await tx.select({ id: user.id }).from(user)
								.where(and(eq(user.mnumber, newMnumber!), ne(user.id, userId)))
								.limit(1);
							if (existingUserWithMnumber.length > 0) {
								throw new Error(`M-number '${newMnumber}' is already assigned to another user`);
							}
							userUpdateData.mnumber = newMnumber;
							finalMnumber = newMnumber || null;
						}
					}
				} else {
					finalMnumber = originalUser.mnumber;
				}


				// 4. Handle Enable status update - Logic remains the same
				if (details.isEnabled !== undefined && details.isEnabled !== originalUser.isEnabled) {
					userUpdateData.isEnabled = details.isEnabled;
				}

				// 5. Perform User Update (if changes detected) (using tx) - Logic remains the same
				if (Object.keys(userUpdateData).length > 0) {
					userUpdateData.updatedAt = new Date();
					await tx.update(user).set(userUpdateData).where(eq(user.id, userId));
				}

				// 6. Handle Faculty Data (using tx) - Logic remains the same
				if (details.college !== undefined && details.department !== undefined) {
					if (!finalMnumber) {
						throw new Error('User must have an M-number assigned before setting college/department');
					}
					const userName = ('name' in userUpdateData ? userUpdateData.name : originalUser.name) ?? 'Unknown Unknown';
					const { firstName, lastName } = deriveNames(userName);
					await tx.insert(faculty)
						.values({ /* ... */ mnumber: finalMnumber, first_name: firstName, last_name: lastName, college: details.college, department: details.department })
						.onConflictDoUpdate({ /* ... */ target: faculty.mnumber, set: { first_name: firstName, last_name: lastName, college: details.college, department: details.department } });
				}

				// --- 7. Handle Role Assignments (Now Always Executes) ---
				// Removed the outer `if (details.role_ids !== undefined)` check
				const roleIdsToAssign = details.role_ids; // Guaranteed to be number[] by controller

				// 7a. Validate Role IDs exist in the 'roles' table (using tx)
				if (roleIdsToAssign.length > 0) { // Still check length > 0 before querying DB
					const existingRoles = await tx.select({ id: roles.id })
						.from(roles)
						.where(inArray(roles.id, roleIdsToAssign));

					if (existingRoles.length !== roleIdsToAssign.length) {
						const existingRoleIdsSet = new Set(existingRoles.map(r => r.id));
						const missingIds = roleIdsToAssign.filter(id => !existingRoleIdsSet.has(id));
						throw new Error(`Invalid or non-existent role IDs provided: ${missingIds.join(', ')}`);
					}
				}

				// 7b. Clear Existing Roles for this user (using tx)
				await tx.delete(userRoles).where(eq(userRoles.user_id, userId));

				// 7c. Insert New Roles (if any provided) (using tx)
				if (roleIdsToAssign.length > 0) { // Still check length > 0 before inserting
					const newUserRolesData = roleIdsToAssign.map(roleId => ({
						user_id: userId,
						role_id: roleId
					}));
					await tx.insert(userRoles).values(newUserRolesData);
				}
				// --- End Role Assignments ---


				// 8. Fetch final complete user details including roles (using tx if needed)
				const updatedUserDetails = await UserService.getUserDetailsById(userId, tx);
				if (!updatedUserDetails) {
					throw new Error("Failed to retrieve updated user details after provisioning.");
				}

				// 9. Return success
				return { success: true, status: 200, user: updatedUserDetails };

			} catch (error: any) {
				// Error handling logic remains the same
				console.error("Error during user provisioning transaction:", error);
				let status = 500;
				let message = 'Internal server error during provisioning';
				if (error.message.includes('M-number') && error.message.includes('already assigned')) { status = 409; message = error.message; }
				else if (error.message.includes('M-number assigned before setting college/department')) { status = 400; message = error.message; }
				else if (error.message.includes('Invalid or non-existent role IDs')) { status = 400; message = error.message; }
				else if (error.message.includes('FOREIGN KEY constraint failed')) { status = 400; message = 'Role assignment failed due to invalid reference.'; }
				else if (error.message.includes('UNIQUE constraint failed: user.mnumber')) { status = 409; message = 'M-number is already assigned to another user.'; }
				return { success: false, status: status, message: message };
			}
		});
	}


	/**
	 * Get detailed user information by user ID, including faculty data and roles.
	 *
	 * @param userId The ID of the user to fetch details for.
	 * @param dbOrTx Optional - A Drizzle instance or Transaction object to use for the query.
	 * @returns An object containing user details, faculty details (if available), and roles, or null if user not found.
	 */
	static async getUserDetailsById(userId: string, dbOrTx?: any) { // Accept optional db/tx object
		const db = dbOrTx ?? (await getDbConnection()).orm; // Use provided tx or get a new connection

		// Fetch user, faculty, and roles in potentially separate queries or a complex join
		// Option 1: Complex Join (might be less performant with aggregations in SQLite)
		// Option 2: Separate queries (often clearer and performant enough)

		// Fetch basic user and faculty data
		const userQuery = db
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
			.leftJoin(faculty, eq(user.mnumber, faculty.mnumber)) // Join faculty if mnumber matches
			.where(eq(user.id, userId))
			.limit(1);

		const userResults = await userQuery;

		if (userResults.length === 0) {
			return null; // User not found
		}
		const userData = userResults[0];

		// Fetch user roles separately
		const rolesQuery = db
			.select({
				role_id: roles.id,
				role_name: roles.name,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.role_id, roles.id))
			.where(eq(userRoles.user_id, userId));

		const assignedRoles = await rolesQuery;

		// Construct the final user details object
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
			roles: assignedRoles, // Add the fetched roles
		};

		// Conditionally add faculty details
		if (userData.college !== null && userData.department !== null) {
			userDetails.college = userData.college;
			userDetails.department = userData.department;
		}

		return userDetails;
	}
} 