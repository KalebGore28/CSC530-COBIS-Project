import { eq, and, sql, type SQL } from 'drizzle-orm';
import { getDbConnection } from '../db/connection'; // Adjust path as needed
import { students, studentAdvisors } from '../db/schema'; // Adjust path as needed

/**
 * Service to handle advisor data operations
 */
export class AdvisorService {

	/**
	 * Get students advised by a specific advisor, optionally filtered by term/year.
	 */
	static async getAdvisedStudents(params: {
		advisorMnumber: string;
		term?: string;
		year?: number;
	}) {
		const { advisorMnumber, term, year } = params;
		const db = (await getDbConnection()).orm; // Get Drizzle instance

		try {
			// Build filter conditions for the studentAdvisors table
			const conditions: SQL[] = [
				eq(studentAdvisors.advisor_mnumber, advisorMnumber)
			];

			// Add term and year filters if provided
			if (term) {
				conditions.push(eq(studentAdvisors.term, term));
			}
			if (year !== undefined) {
				conditions.push(eq(studentAdvisors.year, year));
			}

			// Construct the final query
			const query = db.select({
				// Select all columns from the students table
				mnumber: students.mnumber,
				firstName: students.first_name,
				middleName: students.middle_name,
				lastName: students.last_name,
				suffix: students.suffix,
				gender: students.gender,
				birthdate: students.birthdate,
				citizenship: students.citizenship,
				raceCode: students.race_code,
				raceDescription: students.race_description,
				residencyCode: students.residency_code,
				residencyDescription: students.residency_description,
				age: students.age,
				cellPhone: students.cell_phone,
				email: students.email,
				// Optionally select term/year from studentAdvisors if needed in the result
				// term: studentAdvisors.term,
				// year: studentAdvisors.year
			})
				.from(students)
				.innerJoin(studentAdvisors, eq(students.mnumber, studentAdvisors.student_mnumber))
				.where(and(...conditions))
				// Optional: Add ordering if desired
				.orderBy(students.last_name, students.first_name);

			// Execute the query
			const result = await query;

			// You might want to group results if a student could have the same advisor
			// listed multiple times for different terms/years within the filter scope,
			// but the current query structure avoids duplicates unless you select
			// term/year from studentAdvisors. If selecting term/year, consider grouping.

			return result;

		} catch (error) {
			console.error(`Database error fetching advised students for advisor ${advisorMnumber}:`, error);
			// Rethrow the error to be caught by the controller, or handle it here
			// depending on your error handling strategy.
			throw new Error('Failed to retrieve advised students from the database.');
		}
	}

	// Add other advisor-related service methods here if needed
}
