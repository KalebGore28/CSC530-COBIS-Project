import express from 'express';
import { normalizeHeadersMiddleware } from '../../middleware/normalizeHeaders.js';

// Import routes
import academicStandingRouter from './academic_standing.js';
import admitCodesRouter from './admit_codes.js';
import collegeCodesRouter from './college_codes.js';
import collegesRouter from './colleges.js';
import coursesRouter from './courses.js';
import demographicsRouter from './demographics.js';
import departmentsRouter from './departments.js';
import instructionalMethodsRouter from './instructional_methods.js';
import nationsRouter from './nations.js';
import overridesRouter from './overrides.js';
import partOfTermRouter from './part_of_term.js';
import previousCollegesRouter from './previous_colleges.js';
import programsRouter from './programs.js';
import registrationStatusRouter from './registration_status.js';
import studentCoursesRouter from './student_courses.js';
import studentTypesRouter from './student_types.js';
import subjectPrefixesRouter from './subject_prefixes.js';
import termsRouter from './terms.js';
import testScores from './test_scores.js';

// Create a router
const router = express.Router();

// Middleware to normalize column headers to lowercase
router.use(normalizeHeadersMiddleware);

// Routes
router.use(academicStandingRouter);
router.use(admitCodesRouter);
router.use(collegeCodesRouter);
router.use(collegesRouter);
router.use(coursesRouter);
router.use(demographicsRouter);
router.use(departmentsRouter);
router.use(instructionalMethodsRouter);
router.use(nationsRouter);
router.use(overridesRouter);
router.use(partOfTermRouter);
router.use(previousCollegesRouter);
router.use(programsRouter);
router.use(registrationStatusRouter);
router.use(studentCoursesRouter);
router.use(studentTypesRouter);
router.use(subjectPrefixesRouter);
router.use(termsRouter);
router.use(testScores);

export default router;