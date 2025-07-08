// import-router.ts
import express from 'express';
import { ImportController } from '../controllers/import-controller';
import { hasRole } from '../middleware/has-role';

/**
 * Creates an Import router for handling CSV import operations.
 * @param {boolean} useAuth - Whether to attach the role-checking middleware
 * @returns {express.Router}
 */
export function createImportRouter(useAuth: boolean = true): express.Router {
	const router = express.Router();

	if (useAuth) {
		// Only add role check if useAuth is true
		router.use(hasRole('cobis_administrator'));
	}

	router.post('/process', ImportController.processImport);
	router.get('/info', ImportController.getImportInfo);

	return router;
}
