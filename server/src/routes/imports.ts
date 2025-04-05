// File: src/routes/imports.ts
import express from 'express';
import importRouter from './import-router';
import { ImportAPISpecs } from '../specs/import-specs';

/**
 * Router for handling all import-related operations
 * Refactored to use the controller/service pattern
 */
const router = express.Router();

// Use the unified import router that follows the controller/service pattern
router.use(importRouter);

export default router;

// Export API Specifications for documentation
export const importAPISpecs = ImportAPISpecs;