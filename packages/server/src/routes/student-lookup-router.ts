import express from 'express';
import { StudentLookupController } from '../controllers/student-lookup-controller';

/**
 * Student lookup routes
 * @module routes/student-lookup-router
 * @requires express
 * @requires ../controllers/student-lookup-controller
 * @description This module defines the routes for student lookup operations.
 */
const router = express.Router();

// Student lookup endpoint
router.get('/', StudentLookupController.lookupStudents);

export default router;