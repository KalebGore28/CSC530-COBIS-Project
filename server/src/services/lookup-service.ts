import { getDbConnection } from "../db/connection";
import {
	colleges,
	departments,
} from '../db/schema';

/**
 * Service for handling lookup operations
 * @module services/lookup
 * @description This module provides functions to fetch data from various lookup tables.
*/
export class LookupService {
	/**
	 * Get departments
	 */
	static async getDepartments() {
		const db = (await getDbConnection()).orm;

		return await db
			.select({
				code: departments.code,
				description: departments.description,
			})
			.from(departments);
	}

	/**
	 * Get colleges
	 */
	static async getColleges() {
		const db = (await getDbConnection()).orm;

		return await db
			.select({
				code: colleges.code,
				description: colleges.description,
			})
			.from(colleges);
	}
}