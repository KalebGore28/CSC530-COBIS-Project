// File: src/graphql/resolvers.ts
import { eq, and, sql } from 'drizzle-orm'
import * as tables from '../db/schema'

export const resolvers = {
	Query: {
		student: async (_: any, { mnumber }: { mnumber: string }, { db }: any) => {
			const [stud] = await db.select().from(tables.students)
				.where(eq(tables.students.mnumber, mnumber))
				.limit(1)
			return stud || null
		},

		faculty: async (_: any, { mnumber }: { mnumber: string }, { db }: any) => {
			const [fac] = await db.select().from(tables.faculty)
				.where(eq(tables.faculty.mnumber, mnumber))
				.limit(1)
			return fac || null
		},

		user: async (_: any, { id }: { id: string }, { db }: any) => {
			const [usr] = await db.select().from(tables.user)
				.where(eq(tables.user.id, id))
				.limit(1)
			return usr || null
		},

		course: async (_: any, { subject, number, suffix }: any, { db }: any) => {
			const [c] = await db.select().from(tables.courses)
				.where(and(
					eq(tables.courses.subject, subject),
					eq(tables.courses.number, number),
					eq(tables.courses.suffix, suffix)
				))
				.limit(1)
			return c || null
		},

		program: async (_: any, { code }: { code: string }, { db }: any) => {
			const [p] = await db.select().from(tables.programs)
				.where(eq(tables.programs.code, code))
				.limit(1)
			return p || null
		},

		department: async (_: any, { code }: { code: string }, { db }: any) => {
			const [d] = await db.select().from(tables.departments)
				.where(eq(tables.departments.code, code))
				.limit(1)
			return d || null
		},

		college: async (_: any, { code }: { code: string }, { db }: any) => {
			const [c] = await db.select().from(tables.colleges)
				.where(eq(tables.colleges.code, code))
				.limit(1)
			return c || null
		},

		term: async (_: any, { code }: { code: string }, { db }: any) => {
			const [t] = await db.select().from(tables.terms)
				.where(eq(tables.terms.code, code))
				.limit(1)
			return t || null
		}
	},

	Student: {
		academic_info: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAcademicInfo)
				.where(eq(tables.studentAcademicInfo.mnumber, stud.mnumber))
				.orderBy(sql`${tables.studentAcademicInfo.year} desc, ${tables.studentAcademicInfo.term} desc`),

		addresses: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAddresses)
				.where(eq(tables.studentAddresses.mnumber, stud.mnumber)),

		advisors: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAdvisors)
				.where(eq(tables.studentAdvisors.student_mnumber, stud.mnumber))
				.orderBy(sql`${tables.studentAdvisors.year} desc, ${tables.studentAdvisors.term} desc`),

		courses: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentCourses)
				.where(eq(tables.studentCourses.mnumber, stud.mnumber))
				.orderBy(sql`${tables.studentCourses.year} desc, ${tables.studentCourses.term} desc`),

		programs: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentPrograms)
				.where(eq(tables.studentPrograms.mnumber, stud.mnumber)),

		// testScores: (stud: any, _: any, { db }: any) =>
		// 	db.select().from(tables.testScores)
		// 		.where(eq(tables.testScores.mnumber, stud.mnumber))
	},

	Faculty: {
		courses_taught: (fac: any, _: any, { db }: any) =>
			db.select().from(tables.instructorCourses)
				.where(eq(tables.instructorCourses.mnumber, fac.mnumber)),
		department: (fac: any, _: any, { loaders }: any) =>
			loaders.department.load(fac.department),
		college: (fac: any, _: any, { loaders }: any) =>
			loaders.college.load(fac.college),
	},

	InstructorCourse: {
		mnumber: (row: any) => row.mnumber,
		// turn raw string like "Fall" into the Term lookup object
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),

		// if you also want to expose the full Course object here:
		course: (row: any, _: any, { loaders }: any) =>
			loaders.course.load(
				`${row.course_subject}|${row.course_number}|${row.course_suffix}`
			)
	}
}
