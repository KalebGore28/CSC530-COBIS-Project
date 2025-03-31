import express, { Request, Response, NextFunction } from 'express';
import { importCSV } from '../utils/importCSV';
import multer from 'multer';
import fs from 'fs';
import 'zod-openapi/extend';
import { z } from 'zod';

// Import middleware and types
import { normalizeHeadersMiddleware } from '../middleware/normalizeHeaders';
import { hasRole } from '../middleware/hasRole';
import { AuthAndPermissionsRequest } from '../types/requests';

// Import routes
import academicStandingRouter, { academicStandingSpec } from './imports/academicStanding';
import admitCodesRouter, { admitCodesSpec } from './imports/admitCodes';
import collegeCodesRouter, { collegeCodesSpec } from './imports/collegeCodes';
import collegesRouter, { collegesSpec } from './imports/colleges';
import coursesRouter, { importCoursesSpec } from './imports/courses';
import { demographicsRouter } from './imports/demographics';
import departmentsRouter, { departmentsSpec } from './imports/departments';
import instructionalMethodsRouter, { instructionalMethodsSpec } from './imports/instructionalMethods';
import nationsRouter, { importNationsSpec } from './imports/nations';
import overridesRouter, { importOverridesSpec } from './imports/overrides';
import partOfTermRouter, { importPartOfTermSpec } from './imports/partOfTerm';
import previousCollegesRouter, { importPreviousCollegesSpec } from './imports/previousColleges';
import programsRouter, { importProgramsSpec } from './imports/programs.js';
import registrationStatusRouter, { importRegistrationStatusSpec } from './imports/registrationStatus';
import studentCoursesRouter, { importStudentCoursesSpec } from './imports/studentCourses';
import subjectPrefixesRouter, { importSubjectPrefixesSpec } from './imports/subjectPrefixes';
import termsRouter, { importTermsSpec } from './imports/terms';
import testScoresRouter, { importTestScoresSpec } from './imports/testScores';

// Import schemas
import {
	academicStanding, admitCodes,
	collegeCodes, colleges,
	courses, departments,
	instructionalMethods, nations,
	overrides, partOfTerm,
	previousColleges, programs,
	registrationStatus, studentCourses,
	subjectPrefixes,
	terms, testScores,
} from '../db/schema';

const COBIS_ADMIN_ROLE_ID = 6;

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

// Utility to extract fields from Drizzle ORM schema
const getFieldsFromSchema = (schema: any): string[] => {
	return Object.keys(schema).filter((key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
};

// Map routers to their schemas, endpoints, and fields (if special case)
const routerSchemaMap = [
	{ router: academicStandingRouter, schema: academicStanding, name: "Academic Standing", endpoint: "/api/import/academic-standing" },
	{ router: admitCodesRouter, schema: admitCodes, name: "Admit Codes", endpoint: "/api/import/admit-codes" },
	{ router: collegeCodesRouter, schema: collegeCodes, name: "College Codes", endpoint: "/api/import/college-codes" },
	{ router: collegesRouter, schema: colleges, name: "Colleges", endpoint: "/api/import/colleges" },
	{ router: coursesRouter, schema: courses, name: "Courses", endpoint: "/api/import/courses" },
	{
		router: demographicsRouter,
		schema: null,
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
	{ router: instructionalMethodsRouter, schema: instructionalMethods, name: "Instructional Methods", endpoint: "/api/import/instructional-methods" },
	{ router: nationsRouter, schema: nations, name: "Nations", endpoint: "/api/import/nations" },
	{ router: overridesRouter, schema: overrides, name: "Overrides", endpoint: "/api/import/overrides" },
	{ router: partOfTermRouter, schema: partOfTerm, name: "Part of Term", endpoint: "/api/import/part-of-term" },
	{ router: previousCollegesRouter, schema: previousColleges, name: "Previous Colleges", endpoint: "/api/import/previous-colleges" },
	{ router: programsRouter, schema: programs, name: "Programs", endpoint: "/api/import/programs" },
	{ router: registrationStatusRouter, schema: registrationStatus, name: "Registration Status", endpoint: "/api/import/registration-status" },
	{ router: studentCoursesRouter, schema: studentCourses, name: "Student Courses", endpoint: "/api/import/student-courses" },
	{ router: subjectPrefixesRouter, schema: subjectPrefixes, name: "Subject Prefixes", endpoint: "/api/import/subject-prefixes" },
	{ router: termsRouter, schema: terms, name: "Terms", endpoint: "/api/import/terms" },
	{ router: testScoresRouter, schema: testScores, name: "Test Scores", endpoint: "/api/import/test-scores" },
];

// Generate metadata
const importMetadata = routerSchemaMap.map(({ schema, name, endpoint, fields }) => ({
	name,
	endpoint,
	fields: fields || (schema ? getFieldsFromSchema(schema) : []),
}));

/**
 * Import router for handling all import endpoints.
 */
const router = express.Router()

// Attach middleware
// @ts-ignore
router.use(hasRole(COBIS_ADMIN_ROLE_ID))

router.get('/metadata',
	(req: Request, res: Response) => {
		try {
			res.json(importMetadata);
		} catch (error: any) {
			console.error(`Error retrieving import metadata: ${error.message}`);
			res.status(500).json({ error: 'Error retrieving import metadata.' });
		}
	})
const metadataSpec = {
	'/api/import/metadata': {
		get: {
			tags: ['Imports'],
			operationId: 'getImportMetadata',
			description: 'Get metadata for all import endpoints',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': { schema: z.array(z.object({ name: z.string(), endpoint: z.string(), fields: z.array(z.string()) })) },
					},
				},
			},
		},
	}
}

router.post('/parse-csv',
	upload.single('file'), async (req: AuthAndPermissionsRequest, res: any) => {
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
const parseCSVSpec = {
	'/api/import/parse-csv': {
		post: {
			tags: ['Imports'],
			operationId: 'parseCSV',
			description: 'Parse a CSV file and return its contents',
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: z.object({ file: z.string().openapi({ description: 'CSV file to parse', format: 'binary' }) }),
					},
				},
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								headers: z.array(z.string()),
								data: z.array(z.array(z.string())),
							}),
						},
					},
				},
				'400': {
					description: '400 Bad Request',
					content: {
						'application/json': { schema: z.object({ error: z.string() }) },
					},
				},
				'500': {
					description: '500 Internal Server Error',
					content: {
						'application/json': { schema: z.object({ error: z.string() }) },
					},
				},
			},
		},
	},
}

// Combine all API specs
export const importAPISpecs = {
	...metadataSpec,
	...parseCSVSpec,
	...academicStandingSpec,
	...admitCodesSpec,
	...collegeCodesSpec,
	...collegesSpec,
	...importCoursesSpec,

	...departmentsSpec,
	...instructionalMethodsSpec,
	...importNationsSpec,
	...importOverridesSpec,
	...importPartOfTermSpec,
	...importPreviousCollegesSpec,
	...importProgramsSpec,
	...importRegistrationStatusSpec,
	...importStudentCoursesSpec,
	...importSubjectPrefixesSpec,
	...importTermsSpec,
	...importTestScoresSpec,
}

// Middleware to normalize all column headers to lowercase
router.use(normalizeHeadersMiddleware)

// Use routers
router.use(academicStandingRouter)
router.use(admitCodesRouter)
router.use(collegeCodesRouter)
router.use(collegesRouter)
router.use(coursesRouter)
router.use(demographicsRouter)
router.use(departmentsRouter)
router.use(instructionalMethodsRouter)
router.use(nationsRouter)
router.use(overridesRouter)
router.use(partOfTermRouter)
router.use(previousCollegesRouter)
router.use(programsRouter)
router.use(registrationStatusRouter)
router.use(studentCoursesRouter)
router.use(subjectPrefixesRouter)
router.use(termsRouter)
router.use(testScoresRouter);

export default router;