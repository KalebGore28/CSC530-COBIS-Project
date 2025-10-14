import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { GraphQLObjectType, GraphQLSchema, extendSchema, parse } from 'graphql';
import { buildSchema } from 'drizzle-graphql';
import { queries } from "./graphql/queries";
import { addResolversToSchema } from '@graphql-tools/schema';

import mysql from "mysql2/promise";
import 'dotenv/config';

import * as schema from './schema';
import { CourseResolver, courseTypeExtension } from "./graphql/resolvers/course";
import { FacultyResolver, facultyTypeExtension } from "./graphql/resolvers/faculty";
import { InstructorCourseResolver, instructorCourseTypeExtension } from "./graphql/resolvers/instructor-course";
import { ProgramResolver, programTypeExtension } from "./graphql/resolvers/program";
import { StudentAcademicInfoResolver, studentAcademicInfoTypeExtension } from "./graphql/resolvers/student-academic-info";
import { StudentAddressResolver, studentAddressTypeExtension } from "./graphql/resolvers/student-address";
import { StudentAdvisorResolver, studentAdvisorTypeExtension } from "./graphql/resolvers/student-advisor";
import { StudentCoursesResolver, studentCoursesTypeExtension } from "./graphql/resolvers/student-course";
import { StudentProgramsResolver, studentProgramTypeExtension } from "./graphql/resolvers/student-program";
import { StudentResolver, studentTypeExtension } from "./graphql/resolvers/student";
import { UserRolesResolver, userRoleTypeExtension } from "./graphql/resolvers/user-role";

export interface DbConnection {
	db: mysql.Pool;
	orm: MySql2Database<typeof schema>;
	graphql_schema: GraphQLSchema;
}

const globalForDb = globalThis as unknown as {
	_dbConnection?: Promise<DbConnection>;
};

const createDb = async (): Promise<DbConnection> => {

	const poolConnection = mysql.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	const db = drizzle(poolConnection, { schema: schema, mode: 'default' });
	if (!poolConnection) {
		throw new Error('❌ Failed to create database connection. Please check your environment variables.');
	}

	const { entities } = buildSchema(db);

	// Create merged Query root
	const query = new GraphQLObjectType({
		name: 'Query',
		fields: {
			...entities.queries,
			...queries,
		},
	});

	// Create merged Mutation root (if you have them)
	const mutation = new GraphQLObjectType({
		name: 'Mutation',
		fields: {
			...entities.mutations,
		},
	});

	// Construct the final schema
	let graphql_schema = new GraphQLSchema({
		query,
		mutation,
		types: [
			...Object.values(entities.types),
			...Object.values(entities.inputs),
		],
	});

	graphql_schema = extendSchema(graphql_schema, parse(
		courseTypeExtension +
		facultyTypeExtension +
		instructorCourseTypeExtension +
		programTypeExtension +
		studentAcademicInfoTypeExtension +
		studentAddressTypeExtension +
		studentAdvisorTypeExtension +
		studentCoursesTypeExtension +
		studentProgramTypeExtension +
		studentTypeExtension +
		userRoleTypeExtension
	));

	// 🧩 Add your *custom* resolvers on top of existing drizzle ones
	const executableSchema = addResolversToSchema({
		schema: graphql_schema,
		resolvers: {
			CoursesSelectItem: CourseResolver,
			FacultySelectItem: FacultyResolver,
			InstructorCoursesSelectItem: InstructorCourseResolver,
			ProgramsSelectItem: ProgramResolver,
			StudentAcademicInfoSelectItem: StudentAcademicInfoResolver,
			StudentAddressesSelectItem: StudentAddressResolver,
			StudentAdvisorsSelectItem: StudentAdvisorResolver,
			StudentCoursesSelectItem: StudentCoursesResolver,
			StudentProgramsSelectItem: StudentProgramsResolver,
			StudentsSelectItem: StudentResolver,
			UserRolesSelectItem: UserRolesResolver,
		}
	});

	console.log(`✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return { db: poolConnection, orm: db, graphql_schema: executableSchema };
};

export const getDbConnection = async (): Promise<DbConnection> => {
	if (!globalForDb._dbConnection) {
		globalForDb._dbConnection = createDb();
	}
	return globalForDb._dbConnection;
};

export const seedDb = async (
	dbConn: DbConnection,
	seeders: Array<(orm: DbConnection['orm']) => Promise<void>>
): Promise<void> => {
	for (const seeder of seeders) {
		await seeder(dbConn.orm);
	}
};
