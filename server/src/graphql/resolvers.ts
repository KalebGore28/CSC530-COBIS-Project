import { eq, sql } from 'drizzle-orm'
import * as tables from '../db/schema'

export const resolvers = {
	Query: {
		student: async (_: any, { mnumber }: { mnumber: string }, { db }: any) => {
			const [stud] = await db
				.select()
				.from(tables.students)
				.where(eq(tables.students.mnumber, mnumber))
				.limit(1)
			return stud || null
		}
	},

	Student: {
		programs: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentPrograms)
				.where(eq(tables.studentPrograms.mnumber, stud.mnumber)),
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
	},

	// Nested lookups via DataLoader
	StudentProgram: {
		term: (obj: any, _: any, { loaders }: any) => loaders.term.load(obj.term),
		program: (obj: any, _: any, { loaders }: any) => loaders.program.load(obj.program),
	},

	StudentAcademicInfo: {
		term: (o: any, _: any, { loaders }: any) => loaders.term.load(o.term),
		admit_term: (o: any, _: any, { loaders }: any) => loaders.term.load(o.admit_term),
		admit_code: (o: any, _: any, { loaders }: any) => loaders.admitCode.load(o.admit_code),
		academic_standing: (o: any, _: any, { loaders }: any) => loaders.academicStanding.load(o.academic_standing),
	},

	StudentAddress: {
		nation_code: (o: any, _: any, { loaders }: any) => loaders.nation.load(o.nation_code),
	},

	StudentAdvisor: {
		term: (o: any, _: any, { loaders }: any) => loaders.term.load(o.term),
	},

	StudentCourse: {
		term: (o: any, _: any, { loaders }: any) => loaders.term.load(o.term),
		part_of_term: (o: any, _: any, { loaders }: any) => loaders.partOfTerm.load(o.part_of_term),
		registration_status: (o: any, _: any, { loaders }: any) => loaders.registrationStatus.load(o.registration_status),
		instructional_method: (o: any, _: any, { loaders }: any) => loaders.instructionalMethod.load(o.instructional_method),
		course: (o: any, _: any, { loaders }: any) => loaders.course.load(`${o.course_subject}|${o.course_number}|${o.course_suffix}`)

	}
}
