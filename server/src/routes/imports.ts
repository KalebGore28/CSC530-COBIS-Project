import express from 'express';
import { normalizeHeadersMiddleware } from '../middleware/normalizeHeaders';

// Import routes
import academicStandingRouter from './imports/academic_standing';
import admitCodesRouter from './imports/admit_codes';
import collegeCodesRouter from './imports/college_codes';
import collegesRouter from './imports/colleges';
import coursesRouter from './imports/courses';
import demographicsRouter from './imports/demographics';
import departmentsRouter from './imports/departments';
import instructionalMethodsRouter from './imports/instructional_methods';
import nationsRouter from './imports/nations';
import overridesRouter from './imports/overrides';
import partOfTermRouter from './imports/part_of_term';
import previousCollegesRouter from './imports/previous_colleges';
import programsRouter from './imports/programs.js';
import registrationStatusRouter from './imports/registration_status';
import studentCoursesRouter from './imports/student_courses';
import studentTypesRouter from './imports/student_types';
import subjectPrefixesRouter from './imports/subject_prefixes';
import termsRouter from './imports/terms';
import testScores from './imports/test_scores';

// Create a router
const router = express.Router()

	// Middleware to normalize column headers to lowercase
	.use(normalizeHeadersMiddleware)

	// Routes
	.use(academicStandingRouter)
	.use(admitCodesRouter)
	.use(collegeCodesRouter)
	.use(collegesRouter)
	.use(coursesRouter)
	.use(demographicsRouter)
	.use(departmentsRouter)
	.use(instructionalMethodsRouter)
	.use(nationsRouter)
	.use(overridesRouter)
	.use(partOfTermRouter)
	.use(previousCollegesRouter)
	.use(programsRouter)
	.use(registrationStatusRouter)
	.use(studentCoursesRouter)
	.use(studentTypesRouter)
	.use(subjectPrefixesRouter)
	.use(termsRouter)
	.use(testScores)

export default router;