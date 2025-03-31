// process.env.NODE_ENV = 'test';
import express from 'express';
import request from 'supertest';

import academicStandingRouter from '../routes/imports/academicStanding';
import admitCodesRouter from '../routes/imports/admitCodes';
import collegeCodesRouter from '../routes/imports/collegeCodes';
import collegesRouter from '../routes/imports/colleges';
import coursesRouter from '../routes/imports/courseCatalog';
import { demographicsRouter } from '../routes/imports/demographics';
import departmentsRouter from '../routes/imports/departments';
import instructionalMethodsRouter from '../routes/imports/instructionalMethods';
import nationsRouter from '../routes/imports/nations';
import overridesRouter from '../routes/imports/overrides';
import partOfTermRouter from '../routes/imports/partOfTerm';
import previousCollegesRouter from '../routes/imports/previousColleges';
import programsRouter from '../routes/imports/programs';
import registrationStatusRouter from '../routes/imports/registrationStatus';
import studentCoursesRouter from '../routes/imports/courses';
import subjectPrefixesRouter from '../routes/imports/subjectPrefixes';
import termsRouter from '../routes/imports/terms';
import testScoresRouter from '../routes/imports/testScores';

// Stuff to import CSVs
import { importCSV } from '../utils/importCSV';
import path from 'path';

const __dirname = path.resolve();


/**
 * Seeds database with all of the csv files in the data/csvs directory.
 */
export const seedDatabase = async () => {
	// Import all csv files in the data/csvs directory
	const academicStandingCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/academic_standing.csv'));
	const admitCodesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/admit_codes.csv'));
	const collegeCodesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/college_codes.csv'));
	const collegesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/colleges.csv'));
	const coursesCatalogCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/course_titles.csv'));
	const demographicsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/demographics_sample.csv'));
	const departmentsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/departments.csv'));
	const instructionalMethodsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/instructional_methods.csv'));
	const nationsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/nations.csv'));
	const overridesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/overrides_sample.csv'));
	const partOfTermCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/part_of_term.csv'));
	const previousCollegesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/previous_colleges_sample.csv'));
	const programsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/major_minor.csv'));
	const registrationStatusCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/registration_status.csv'));
	const coursesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/courses_sample.csv'));
	const subjectPrefixesCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/subject_prefixes.csv'));
	const termsCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/terms.csv'));
	const testScoresCSV: any = await importCSV(path.resolve(__dirname, './src/seed/data/csvs/test_scores_sample.csv'));


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
		.post('/api/import/academic-standing')
		.send({
			mappedData: academicStandingCSV,
			fileName: 'academic-standing.csv',
			importedBy: 'seed script',
		});

	const admitCodesResponse = await request(app)
		.post('/api/import/admit-codes')
		.send({
			mappedData: admitCodesCSV,
			fileName: 'admit-codes.csv',
			importedBy: 'seed script',
		});

	const collegeCodesResponse = await request(app)
		.post('/api/import/college-codes')
		.send({
			mappedData: collegeCodesCSV,
			fileName: 'college-codes.csv',
			importedBy: 'seed script',
		});

	const collegesResponse = await request(app)
		.post('/api/import/colleges')
		.send({
			mappedData: collegesCSV,
			fileName: 'colleges.csv',
			importedBy: 'seed script',
		});

	const courseCatalogResponse = await request(app)
		.post('/api/import/course-catalog')
		.send({
			mappedData: coursesCatalogCSV,
			fileName: 'course-titles.csv',
			importedBy: 'seed script',
		});

	const departmentsResponse = await request(app)
		.post('/api/import/departments')
		.send({
			mappedData: departmentsCSV,
			fileName: 'departments.csv',
			importedBy: 'seed script',
		});

	const instructionalMethodsResponse = await request(app)
		.post('/api/import/instructional-methods')
		.send({
			mappedData: instructionalMethodsCSV,
			fileName: 'instructional-methods.csv',
			importedBy: 'seed script',
		});

	const programsResponse = await request(app)
		.post('/api/import/programs')
		.send({
			mappedData: programsCSV,
			fileName: 'major-minor.csv',
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
		.post('/api/import/part-of-term')
		.send({
			mappedData: partOfTermCSV,
			fileName: 'part-of-term.csv',
			importedBy: 'seed script',
		});

	const registrationStatusResponse = await request(app)
		.post('/api/import/registration-status')
		.send({
			mappedData: registrationStatusCSV,
			fileName: 'registration-status.csv',
			importedBy: 'seed script',
		});

	const subjectPrefixesResponse = await request(app)
		.post('/api/import/subject-prefixes')
		.send({
			mappedData: subjectPrefixesCSV,
			fileName: 'subject-prefixes.csv',
			importedBy: 'seed script',
		});

	const demographicsResponse = await request(app)
		.post('/api/import/demographics')
		.send({
			mappedData: demographicsCSV,
			fileName: 'demographics.csv',
			importedBy: 'seed script',
		});

	const coursesResponse = await request(app)
		.post('/api/import/courses')
		.send({
			mappedData: coursesCSV,
			fileName: 'courses-sample.csv',
			importedBy: 'seed script',
		});

	// const testScoresResponse = await request(app)
	// 	.post('/api/import/test-scores')
	// 	.send({
	// 		mappedData: testScoresCSV,
	// 		fileName: 'test-scores-sample.csv',
	// 		importedBy: 'seed script',
	// 	});

	// const overridesResponse = await request(app)
	// 	.post('/api/import/overrides')
	// 	.send({
	// 		mappedData: overridesCSV,
	// 		fileName: 'overrides-sample.csv',
	// 		importedBy: 'seed script',
	// 	});

	// const previousCollegesResponse = await request(app)
	// 	.post('/api/import/previous-colleges')
	// 	.send({
	// 		mappedData: previousCollegesCSV,
	// 		fileName: 'previous-colleges-sample.csv',
	// 		importedBy: 'seed script',
	// 	});

	// Check if any of the responses have failed status codes
	if (
		termsResponse.status !== 200 ||
		academicStandingResponse.status !== 200 ||
		admitCodesResponse.status !== 200 ||
		collegeCodesResponse.status !== 200 ||
		collegesResponse.status !== 200 ||
		courseCatalogResponse.status !== 200 ||
		departmentsResponse.status !== 200 ||
		instructionalMethodsResponse.status !== 200 ||
		programsResponse.status !== 200 ||
		nationsResponse.status !== 200 ||
		partOfTermResponse.status !== 200 ||
		registrationStatusResponse.status !== 200 ||
		subjectPrefixesResponse.status !== 200 ||
		demographicsResponse.status !== 200 ||
		coursesResponse.status !== 200 //||
		// testScoresResponse.status !== 200 ||
		// overridesResponse.status !== 200 ||
		// previousCollegesResponse.status !== 200
	) {
		throw new Error('Failed to seed database.');
	}
};