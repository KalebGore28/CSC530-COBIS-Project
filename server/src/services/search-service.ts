import { sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import {
	academicStanding,
	admitCodes,
	colleges,
	collegeCodes,
	courses,
	departments,
	nations,
	partOfTerm,
	programs,
	registrationStatus,
	terms,
	faculty
} from '../db/schema';

/**
 * Service for handling search operations across various lookup tables
 */
export class SearchService {
	/**
	 * Search academic standings by code or description
	 */
	static async searchAcademicStandings(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: academicStanding.code,
				description: academicStanding.description,
			})
			.from(academicStanding)
			.where(
				sql`
					UPPER(${academicStanding.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${academicStanding.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search admit codes by code or description
	 */
	static async searchAdmitCodes(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: admitCodes.code,
				description: admitCodes.description,
			})
			.from(admitCodes)
			.where(
				sql`
					UPPER(${admitCodes.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${admitCodes.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search colleges by code or description
	 */
	static async searchColleges(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: colleges.code,
				name: colleges.description,
			})
			.from(colleges)
			.where(
				sql`
					UPPER(${colleges.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${colleges.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search college codes by code or description
	 */
	static async searchCollegeCodes(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: collegeCodes.code,
				name: collegeCodes.description,
			})
			.from(collegeCodes)
			.where(
				sql`
					UPPER(${collegeCodes.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${collegeCodes.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search courses by subject+number+suffix or title
	 */
	static async searchCourses(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				subject: courses.subject,
				number: courses.number,
				suffix: courses.suffix,
				title: courses.title
			})
			.from(courses)
			.where(
				sql`
					UPPER(${courses.subject} || CAST(${courses.number} AS TEXT) || ${courses.suffix}) LIKE ${searchQuery + '%'} OR
					UPPER(${courses.title}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search departments by code or description
	 */
	static async searchDepartments(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: departments.code,
				name: departments.description,
			})
			.from(departments)
			.where(
				sql`
					UPPER(${departments.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${departments.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search nations by code or description
	 */
	static async searchNations(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: nations.code,
				name: nations.description,
			})
			.from(nations)
			.where(
				sql`
					UPPER(${nations.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${nations.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search part of terms by code or description
	 */
	static async searchPartOfTerms(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: partOfTerm.code,
				description: partOfTerm.description,
			})
			.from(partOfTerm)
			.where(
				sql`
					UPPER(${partOfTerm.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${partOfTerm.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search programs by code or description
	 */
	static async searchPrograms(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: programs.code,
				description: programs.description,
				cipCode: programs.cip_code,
				isMajor: programs.is_major,
				isMinor: programs.is_minor,
				hasConcentration: programs.has_concentration,
				isDiscontinued: programs.is_discontinued,
				isAacsb: programs.is_aacsb,
				department: programs.department,
				college: programs.college,
			})
			.from(programs)
			.where(
				sql`
					UPPER(${programs.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${programs.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search registration statuses by code or description
	 */
	static async searchRegistrationStatuses(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: registrationStatus.code,
				description: registrationStatus.description,
			})
			.from(registrationStatus)
			.where(
				sql`
					UPPER(${registrationStatus.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${registrationStatus.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search terms by code or description
	 */
	static async searchTerms(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				code: terms.code,
				description: terms.description,
			})
			.from(terms)
			.where(
				sql`
					UPPER(${terms.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${terms.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10);
	}

	/**
	 * Search faculty by first name, last name, or mnumber
	 */
	static async searchFaculty(query: string) {
		const db = (await getDbConnection()).orm;
		const searchQuery = query.toUpperCase();

		return await db
			.select({
				firstName: faculty.first_name,
				lastName: faculty.last_name,
				mnumber: faculty.mnumber,
			})
			.from(faculty)
			.where(
				sql`
					UPPER(${faculty.first_name}) LIKE ${searchQuery + '%'} OR
					UPPER(${faculty.last_name}) LIKE ${searchQuery + '%'} OR
					UPPER(${faculty.mnumber}) LIKE ${searchQuery + '%'}
				`
			)
			.limit(10);
	}
} 