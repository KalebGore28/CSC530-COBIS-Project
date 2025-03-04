// process.env.NODE_ENV = 'test';
import express from 'express';
import request from 'supertest';

import { academicStandingRouter } from '../routes/imports/academic_standing';
import { admitCodesRouter } from '../routes/imports/admit_codes';
import { collegeCodesRouter } from '../routes/imports/college_codes';
import { collegesRouter } from '../routes/imports/colleges';
import { coursesRouter } from '../routes/imports/courses';
import { demographicsRouter } from '../routes/imports/demographics';
import { departmentsRouter } from '../routes/imports/departments';
import { instructionalMethodsRouter } from '../routes/imports/instructional_methods';
import { nationsRouter } from '../routes/imports/nations';
import { overridesRouter } from '../routes/imports/overrides';
import { partOfTermRouter } from '../routes/imports/part_of_term';
import { previousCollegesRouter } from '../routes/imports/previous_colleges';
import { programsRouter } from '../routes/imports/programs';
import { registrationStatusRouter } from '../routes/imports/registration_status';
import { studentCoursesRouter } from '../routes/imports/student_courses';
import { studentTypesRouter } from '../routes/imports/student_types';
import { subjectPrefixesRouter } from '../routes/imports/subject_prefixes';
import { termsRouter } from '../routes/imports/terms';
import { testScoresRouter } from '../routes/imports/test_scores';

// Stuff to import CSVs
import { importCSV } from '../utils/importCSV';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seeds database with all of the csv files in the data/csvs directory.
 */
export const seedDatabase = async () => {
	// Import all csv files in the data/csvs directory
	const academicStandingCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/academic_standing.csv'));
	const admitCodesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/admit_codes.csv'));
	const collegeCodesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/college_codes.csv'));
	const collegesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/colleges.csv'));
	const coursesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/course_titles.csv'));
	const demographicsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/demographics_sample.csv'));
	const departmentsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/departments.csv'));
	const instructionalMethodsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/instructional_methods.csv'));
	const nationsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/nations.csv'));
	const overridesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/overrides_sample.csv'));
	const partOfTermCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/part_of_term.csv'));
	const previousCollegesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/previous_colleges_sample.csv'));
	const programsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/major_minor.csv'));
	const registrationStatusCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/registration_status.csv'));
	const studentCoursesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/courses_sample.csv'));
	const studentTypesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/student_types.csv'));
	const subjectPrefixesCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/subject_prefixes.csv'));
	const termsCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/terms.csv'));
	const testScoresCSV: any = await importCSV<any>(path.resolve(__dirname, './data/csvs/test_scores_sample.csv'));


	const app = express()
		.use(express.json({ limit: "10mb" }))
		.use(express.urlencoded({ extended: true, limit: "10mb" }))
		.use('/api/import', academicStandingRouter)
		.use('/api/import', admitCodesRouter)
		.use('/api/import', collegeCodesRouter)
		.use('/api/import', collegesRouter)
		.use('/api/import', coursesRouter)
		.use('/api/import', demographicsRouter)
		.use('/api/import', departmentsRouter)
		.use('/api/import', instructionalMethodsRouter)
		.use('/api/import', nationsRouter)
		.use('/api/import', overridesRouter)
		.use('/api/import', partOfTermRouter)
		.use('/api/import', previousCollegesRouter)
		.use('/api/import', programsRouter)
		.use('/api/import', registrationStatusRouter)
		.use('/api/import', studentCoursesRouter)
		.use('/api/import', studentTypesRouter)
		.use('/api/import', subjectPrefixesRouter)
		.use('/api/import', termsRouter)
		.use('/api/import', testScoresRouter)

	// Import all csv files in the data/csvs directory in a particular order to avoid foreign key constraints
	const termsResponse = await request(app)
		.post('/api/import/terms')
		.send({
			mappedData: termsCSV,
			fileName: 'terms.csv',
			importedBy: 'seed script',
		});

	const academicStandingResponse = await request(app)
		.post('/api/import/academic_standing')
		.send({
			mappedData: academicStandingCSV,
			fileName: 'academic_standing.csv',
			importedBy: 'seed script',
		});

	const admitCodesResponse = await request(app)
		.post('/api/import/admit_codes')
		.send({
			mappedData: admitCodesCSV,
			fileName: 'admit_codes.csv',
			importedBy: 'seed script',
		});

	const collegeCodesResponse = await request(app)
		.post('/api/import/college_codes')
		.send({
			mappedData: collegeCodesCSV,
			fileName: 'college_codes.csv',
			importedBy: 'seed script',
		});

	const collegesResponse = await request(app)
		.post('/api/import/colleges')
		.send({
			mappedData: collegesCSV,
			fileName: 'colleges.csv',
			importedBy: 'seed script',
		});

	const coursesResponse = await request(app)
		.post('/api/import/courses')
		.send({
			mappedData: coursesCSV,
			fileName: 'course_titles.csv',
			importedBy: 'seed script',
		});

	// console.log(departmentsCSV);
	const departmentsResponse = await request(app)
		.post('/api/import/departments')
		.send({
			mappedData: departmentsCSV,
			fileName: 'departments.csv',
			importedBy: 'seed script',
		});

	const instructionalMethodsResponse = await request(app)
		.post('/api/import/instructional_methods')
		.send({
			mappedData: instructionalMethodsCSV,
			fileName: 'instructional_methods.csv',
			importedBy: 'seed script',
		});

	const programsResponse = await request(app)
		.post('/api/import/programs')
		.send({
			mappedData: programsCSV,
			fileName: 'major_minor.csv',
			importedBy: 'seed script',
		});

	const nationsResponse = await request(app)
		.post('/api/import/nations')
		.send({
			mappedData: nationsCSV,
			fileName: 'nations.csv',
			importedBy: 'seed script',
		});

	const partOfTermResponse = await request(app)
		.post('/api/import/part_of_term')
		.send({
			mappedData: partOfTermCSV,
			fileName: 'part_of_term.csv',
			importedBy: 'seed script',
		});

	const registrationStatusResponse = await request(app)
		.post('/api/import/registration_status')
		.send({
			mappedData: registrationStatusCSV,
			fileName: 'registration_status.csv',
			importedBy: 'seed script',
		});

	const studentTypesResponse = await request(app)
		.post('/api/import/student_types')
		.send({
			mappedData: studentTypesCSV,
			fileName: 'student_types.csv',
			importedBy: 'seed script',
		});

	const subjectPrefixesResponse = await request(app)
		.post('/api/import/subject_prefixes')
		.send({
			mappedData: subjectPrefixesCSV,
			fileName: 'subject_prefixes.csv',
			importedBy: 'seed script',
		});

	const demographicsResponse = await request(app)
		.post('/api/import/demographics')
		.send({
			mappedData: demographicsCSV,
			fileName: 'demographics.csv',
			importedBy: 'seed script',
		});

	const studentCoursesResponse = await request(app)
		.post('/api/import/student_courses')
		.send({
			mappedData: studentCoursesCSV,
			fileName: 'courses_sample.csv',
			importedBy: 'seed script',
		});

	const testScoresResponse = await request(app)
		.post('/api/import/test_scores')
		.send({
			mappedData: testScoresCSV,
			fileName: 'test_scores_sample.csv',
			importedBy: 'seed script',
		});

	const overridesResponse = await request(app)
		.post('/api/import/overrides')
		.send({
			mappedData: overridesCSV,
			fileName: 'overrides_sample.csv',
			importedBy: 'seed script',
		});

	const previousCollegesResponse = await request(app)
		.post('/api/import/previous_colleges')
		.send({
			mappedData: previousCollegesCSV,
			fileName: 'previous_colleges_sample.csv',
			importedBy: 'seed script',
		});

	// Check if any of the responses have failed status codes
	if (
		termsResponse.status !== 200 ||
		academicStandingResponse.status !== 200 ||
		admitCodesResponse.status !== 200 ||
		collegeCodesResponse.status !== 200 ||
		collegesResponse.status !== 200 ||
		coursesResponse.status !== 200 ||
		departmentsResponse.status !== 200 ||
		instructionalMethodsResponse.status !== 200 ||
		nationsResponse.status !== 200 ||
		partOfTermResponse.status !== 200 ||
		registrationStatusResponse.status !== 200 ||
		studentTypesResponse.status !== 200 ||
		subjectPrefixesResponse.status !== 200 ||
		demographicsResponse.status !== 200 ||
		studentCoursesResponse.status !== 200 ||
		testScoresResponse.status !== 200 ||
		overridesResponse.status !== 200 ||
		previousCollegesResponse.status !== 200
	) {
		throw new Error('Failed to seed database.');
	}
};