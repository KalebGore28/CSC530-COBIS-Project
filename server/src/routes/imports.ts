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
import courseCatalogRouter, { importCoursesSpec } from './imports/courseCatalog';
import { demographicsRouter } from './imports/demographics';
import departmentsRouter, { departmentsSpec } from './imports/departments';
import instructionalMethodsRouter, { instructionalMethodsSpec } from './imports/instructionalMethods';
import nationsRouter, { importNationsSpec } from './imports/nations';
import overridesRouter, { importOverridesSpec } from './imports/overrides';
import partOfTermRouter, { importPartOfTermSpec } from './imports/partOfTerm';
import previousCollegesRouter, { importPreviousCollegesSpec } from './imports/previousColleges';
import programsRouter, { importProgramsSpec } from './imports/programs.js';
import registrationStatusRouter, { importRegistrationStatusSpec } from './imports/registrationStatus';
import coursesRouter, { importStudentCoursesSpec } from './imports/courses';
import subjectPrefixesRouter, { importSubjectPrefixesSpec } from './imports/subjectPrefixes';
import termsRouter, { importTermsSpec } from './imports/terms';
import testScoresRouter, { importTestScoresSpec } from './imports/testScores';

// Import metadata service
import { generateImportMetadata } from '../services/columnMappingService';

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

// Generate metadata using the service
const importMetadata = generateImportMetadata();

/**
 * Import router for handling all import endpoints.
 */
const router = express.Router()

// Attach middleware
// @ts-ignore
router.use(hasRole('cobis_administrator'));
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
						'application/json': {
							schema: z.array(z.object({
								name: z.string(),
								endpoint: z.string(),
								fields: z.array(z.string()),
								category: z.enum(['lookup', 'data']),
								description: z.string().optional(),
							}))
						},
					},
				},
			},
		},
	}
}
router.post('/parse-csv',
	upload.single('file'),
	async (req: AuthAndPermissionsRequest, res: any) => {
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
router.use(courseCatalogRouter)
router.use(demographicsRouter)
router.use(departmentsRouter)
router.use(instructionalMethodsRouter)
router.use(nationsRouter)
router.use(overridesRouter)
router.use(partOfTermRouter)
router.use(previousCollegesRouter)
router.use(programsRouter)
router.use(registrationStatusRouter)
router.use(coursesRouter)
router.use(subjectPrefixesRouter)
router.use(termsRouter)
router.use(testScoresRouter);

export default router;