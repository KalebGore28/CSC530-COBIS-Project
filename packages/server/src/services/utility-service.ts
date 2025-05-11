import { getDbConnection } from '../db/connection';
import { instructorCourses } from "../db/models/instructor-courses";
import { sql } from "drizzle-orm";

export class UtilityService {
	static async getCurrentTermAndYear() {
		const db = (await getDbConnection()).orm;
		// First get the max year
		const maxYearResult = await db
			.select({
				maxYear: sql<number>`MAX(${instructorCourses.year})`
			})
			.from(instructorCourses);

		const maxYear = maxYearResult[0]?.maxYear;

		if (!maxYear) {
			throw new Error("No academic years found in the system");
		}

		// Then get the max term for that year
		const maxTermResult = await db
			.select({
				maxTerm: sql<string>`MAX(${instructorCourses.term})`
			})
			.from(instructorCourses)
			.where(sql`${instructorCourses.year} = ${maxYear}`);

		const maxTerm = maxTermResult[0]?.maxTerm;

		if (!maxTerm) {
			throw new Error("No terms found for the current year");
		}

		return {
			term: maxTerm,
			year: maxYear,
			termName: getTermName(maxTerm)
		};
	}
}

function getTermName(termCode: string): string {
	const termMap: Record<string, string> = {
		"10": "Spring",
		"50": "Summer",
		"80": "Fall",
		"90": "Winter"
	};
	return termMap[termCode] || "Unknown";
}