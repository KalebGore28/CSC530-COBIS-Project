import express from 'express';
import { normalizeHeadersMiddleware } from '../middleware/normalizeHeaders';

// Import routes
import academicStandingRouter from './imports/academic_standing';
// import admitCodesRouter from './imports/admit_codes.js';
// import collegeCodesRouter from './imports/college_codes.js';
// import collegesRouter from './imports/colleges.js';
// import coursesRouter from './imports/courses.js';
// import demographicsRouter from './imports/demographics.js';
// import departmentsRouter from './imports/departments.js';
// import instructionalMethodsRouter from './imports/instructional_methods.js';
// import nationsRouter from './imports/nations.js';
// import overridesRouter from './imports/overrides.js';
// import partOfTermRouter from './imports/part_of_term.js';
// import previousCollegesRouter from './imports/previous_colleges.js';
// import programsRouter from './imports/programs.js';
// import registrationStatusRouter from './imports/registration_status.js';
// import studentCoursesRouter from './imports/student_courses.js';
// import studentTypesRouter from './imports/student_types.js';
// import subjectPrefixesRouter from './imports/subject_prefixes.js';
// import termsRouter from './imports/terms.js';
// import testScores from './imports/test_scores.js';

// Create a router
const router = express.Router();

// Middleware to normalize column headers to lowercase
router.use(normalizeHeadersMiddleware);

// Routes
router.use(academicStandingRouter);
// router.use(admitCodesRouter);
// router.use(collegeCodesRouter);
// router.use(collegesRouter);
// router.use(coursesRouter);
// router.use(demographicsRouter);
// router.use(departmentsRouter);
// router.use(instructionalMethodsRouter);
// router.use(nationsRouter);
// router.use(overridesRouter);
// router.use(partOfTermRouter);
// router.use(previousCollegesRouter);
// router.use(programsRouter);
// router.use(registrationStatusRouter);
// router.use(studentCoursesRouter);
// router.use(studentTypesRouter);
// router.use(subjectPrefixesRouter);
// router.use(termsRouter);
// router.use(testScores);

export default router;