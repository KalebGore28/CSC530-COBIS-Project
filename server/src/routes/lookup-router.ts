import express from 'express';
import { LookupController } from '../controllers/lookup-controller';

/**
 * Lookup routes
 * @module routes/lookup
 * @description This module defines the routes for lookup operations.
 * It provides endpoints for searching various lookup tables.
 */
const router = express.Router();

// Lookup routes for different entities
router.get('/departments', LookupController.getDepartments);
router.get('/colleges', LookupController.getColleges);
router.get('/roles', LookupController.getRoles);

export default router;
