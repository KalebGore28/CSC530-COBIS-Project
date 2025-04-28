import express from 'express';
import { ImportController } from '../controllers/import-controller';
import { hasRole } from '../middleware/has-role';

/**
 * Import router for handling CSV import operations
 * @module routes/import-router
 * @requires express
 * @requires multer
 * @requires ../controllers/import-controller
 */
const router = express.Router();

// Middleware to check if the user has the required role
router.use(hasRole('cobis_administator'));

// Process and import a CSV file
router.post('/process',
	ImportController.processImport
);

// Get all import information (tables and file patterns)
router.get('/info',
	ImportController.getImportInfo
);

export default router; 