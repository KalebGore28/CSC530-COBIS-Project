import express from 'express';
import { normalizeHeadersMiddleware } from '../middleware/normalizeHeaders';
import { importCSV } from '../utils/importCSV';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const upload = multer({
	dest: 'uploads/',
	fileFilter: (req, file, cb) => {
		if (file.mimetype !== 'text/csv') {
			return cb(new Error('Only CSV files are allowed'));
		}
		cb(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Import routes
import { academicStandingRouter } from './imports/academic_standing';
import { admitCodesRouter } from './imports/admit_codes';
import { collegeCodesRouter } from './imports/college_codes';
import { collegesRouter } from './imports/colleges';
import { coursesRouter } from './imports/courses';
import { demographicsRouter } from './imports/demographics';
import { departmentsRouter } from './imports/departments';
import { instructionalMethodsRouter } from './imports/instructional_methods';
import { nationsRouter } from './imports/nations';
import { overridesRouter } from './imports/overrides';
import { partOfTermRouter } from './imports/part_of_term';
import { previousCollegesRouter } from './imports/previous_colleges';
import { programsRouter } from './imports/programs.js';
import { registrationStatusRouter } from './imports/registration_status';
import { studentCoursesRouter } from './imports/student_courses';
import { studentTypesRouter } from './imports/student_types';
import { subjectPrefixesRouter } from './imports/subject_prefixes';
import { termsRouter } from './imports/terms';
import { testScoresRouter } from './imports/test_scores';

// Import schemas
import {
	academicStanding,
	admitCodes,
	collegeCodes,
	colleges,
	courses,
	departments,
	instructionalMethods,
	nations,
	overrides,
	partOfTerm,
	previousColleges,
	programs,
	registrationStatus,
	studentCourses,
	studentTypes,
	subjectPrefixes,
	terms,
	testScores,
} from '../db/schema';

// Utility to extract fields from Drizzle ORM schema
const getFieldsFromSchema = (schema: any): string[] => {
	return Object.keys(schema).filter((key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
};

// Map routers to their schemas, endpoints, and fields (if special case)
const routerSchemaMap = [
	{ router: academicStandingRouter, schema: academicStanding, name: "Academic Standing", endpoint: "/api/import/academic_standing" },
	{ router: admitCodesRouter, schema: admitCodes, name: "Admit Codes", endpoint: "/api/import/admit_codes" },
	{ router: collegeCodesRouter, schema: collegeCodes, name: "College Codes", endpoint: "/api/import/college_codes" },
	{ router: collegesRouter, schema: colleges, name: "Colleges", endpoint: "/api/import/colleges" },
	{ router: coursesRouter, schema: courses, name: "Courses", endpoint: "/api/import/courses" },
	{
		router: demographicsRouter,
		name: "Demographics",
		endpoint: "/api/import/demographics",
		fields: [
			"mnumber", "firstname", "lastname", "middlename", "suffix", "gender", "birthdate", "citizen",
			"race", "racedesc", "residcode", "residdesc", "age", "cellphone", "homestreet1", "homestreet2",
			"homecity", "homestate", "homezip", "homenation", "homephone", "locstreet1", "locstreet2",
			"loccity", "locstate", "loczip", "locnation", "locphone", "admitterm", "admitcode", "acadstanding",
			"msuatthours", "msuearnhours", "msuqp", "msugpa", "overatthours", "overearnhours", "overqp",
			"overgpa", "program", "levl", "major1", "major1dept", "major1coll", "major2", "major2dept",
			"major2coll", "minor1", "minor1dept", "minor2", "minor2dept",
			"advnumb", "advfname", "advlname", "advmname", "advsuffix",
		], // Manually define fields for Demographics
	},
	{ router: departmentsRouter, schema: departments, name: "Departments", endpoint: "/api/import/departments" },
	{ router: instructionalMethodsRouter, schema: instructionalMethods, name: "Instructional Methods", endpoint: "/api/import/instructional_methods" },
	{ router: nationsRouter, schema: nations, name: "Nations", endpoint: "/api/import/nations" },
	{ router: overridesRouter, schema: overrides, name: "Overrides", endpoint: "/api/import/overrides" },
	{ router: partOfTermRouter, schema: partOfTerm, name: "Part of Term", endpoint: "/api/import/part_of_term" },
	{ router: previousCollegesRouter, schema: previousColleges, name: "Previous Colleges", endpoint: "/api/import/previous_colleges" },
	{ router: programsRouter, schema: programs, name: "Programs", endpoint: "/api/import/programs" },
	{ router: registrationStatusRouter, schema: registrationStatus, name: "Registration Status", endpoint: "/api/import/registration_status" },
	{ router: studentCoursesRouter, schema: studentCourses, name: "Student Courses", endpoint: "/api/import/student_courses" },
	{ router: studentTypesRouter, schema: studentTypes, name: "Student Types", endpoint: "/api/import/student_types" },
	{ router: subjectPrefixesRouter, schema: subjectPrefixes, name: "Subject Prefixes", endpoint: "/api/import/subject_prefixes" },
	{ router: termsRouter, schema: terms, name: "Terms", endpoint: "/api/import/terms" },
	{ router: testScoresRouter, schema: testScores, name: "Test Scores", endpoint: "/api/import/test_scores" },
];

// Generate metadata
const importMetadata = routerSchemaMap.map(({ schema, name, endpoint, fields }) => ({
	name,
	endpoint,
	fields: fields || (schema ? getFieldsFromSchema(schema) : []),
}));

// Create a router
const router = express.Router()

	/**
	 * @openapi
	 * /api/import/metadata:
	 *   get:
	 *     tags:
	 *       - Imports
	 *     summary: Get metadata for all importable tables.
	 *     description: Returns a list of all tables that can be imported into, including their endpoints and required fields.
	 *     responses:
	 *       200:
	 *         description: Successfully retrieved metadata.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   name:
	 *                     type: string
	 *                   endpoint:
	 *                     type: string
	 *                   fields:
	 *                     type: array
	 *                     items:
	 *                       type: string
	 *       500:
	 *         description: Error retrieving metadata.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.get('/metadata', (req, res) => {
		try {
			res.json(importMetadata);
		} catch (error: any) {
			console.error(`Error retrieving import metadata: ${error.message}`);
			res.status(500).json({ error: 'Error retrieving import metadata.' });
		}
	})

	/**
	 * @openapi
	 * /api/import/parse-csv:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Parse a CSV file.
	 *     description: Accepts a CSV file upload, parses it, and returns the headers and data rows.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               file:
	 *                 type: string
	 *                 format: binary
	 *     responses:
	 *       200:
	 *         description: Successfully parsed CSV file.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 headers:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: array
	 *                     items:
	 *                       type: string
	 *       400:
	 *         description: Invalid file or missing file.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 *       500:
	 *         description: Error parsing CSV file.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/parse-csv', upload.single('file'), async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ error: 'No file uploaded' });
			}

			const parsedData = await importCSV(req.file.path);
			if (!parsedData || parsedData.length === 0) {
				return res.status(400).json({ error: 'Empty or invalid CSV file' });
			}

			const headers = Object.keys(parsedData[0]);
			const data = parsedData.map(row => headers.map(header => row[header] || ''));

			fs.unlinkSync(req.file.path);

			res.json({
				headers,
				data,
			});
		} catch (error: any) {
			if (req.file?.path) {
				fs.unlinkSync(req.file.path);
			}
			console.error(`Error parsing CSV: ${error.message}`);
			res.status(500).json({ error: 'Error parsing CSV file' });
		}
	})

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
	.use(testScoresRouter);

export default router;