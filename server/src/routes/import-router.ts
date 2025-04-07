import express from 'express';
import multer from 'multer';
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
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/tmp/'); // Store uploads in /tmp directory
	},
	filename: function (req, file, cb) {
		// Use a timestamp to make filenames unique
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		// Only accept CSV files
		if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
			return cb(new Error('Only CSV files are accepted'));
		}
		cb(null, true);
	},
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB max file size
	}
});

// Process and import a CSV file
router.post('/process',
	upload.single('file'), // File should be uploaded as 'file'
	ImportController.processImport
);

// Get all import information (tables and file patterns)
router.get('/info',
	ImportController.getImportInfo
);

export default router; 