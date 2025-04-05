import express from 'express';
import multer from 'multer';
import path from 'path';
import { ImportController } from '../controllers/import-controller';

/**
 * Import router for handling CSV import operations
 * @module routes/import-router
 * @requires express
 * @requires multer
 * @requires ../controllers/import-controller
 */
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
	dest: 'uploads/',
	fileFilter: (req, file, cb) => {
		// Check if file extension is .csv (case insensitive)
		if (path.extname(file.originalname).toLowerCase() !== '.csv') {
			return cb(new Error('Only CSV files are allowed'));
		}
		// Accept the file regardless of mime type as long as extension is .csv
		cb(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Process and import a CSV file
router.post('/process',
	upload.single('file'),
	ImportController.processImport
);

// Get available import tables with metadata
router.get('/tables',
	ImportController.getImportTables
);

// Get available file patterns for data tables
router.get('/patterns',
	ImportController.getImportPatterns
);

// Validate CSV headers against expected columns
router.post('/validate-columns',
	ImportController.validateCsvColumns
);

export default router; 