import { eq } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import { user } from "../db/schema";
import { UserSessionInfo } from "../types/user";

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
} 