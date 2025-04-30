import express from 'express';
import { SearchController } from '../controllers/search-controller';

/**
 * Search routes
 * @module routes/search
 * @description This module defines the routes for search operations.
 * It provides endpoints for searching various lookup tables.
 */
const router = express.Router();

// Search routes for different entities
router.get('/academic-standings', SearchController.searchAcademicStandings);
router.get('/admit-codes', SearchController.searchAdmitCodes);
router.get('/colleges', SearchController.searchColleges);
router.get('/college-codes', SearchController.searchCollegeCodes);
router.get('/courses', SearchController.searchCourses);
router.get('/departments', SearchController.searchDepartments);
router.get('/nations', SearchController.searchNations);
router.get('/part-of-terms', SearchController.searchPartOfTerms);
router.get('/programs', SearchController.searchPrograms);
router.get('/registration-statuses', SearchController.searchRegistrationStatuses);
router.get('/terms', SearchController.searchTerms);
router.get('/faculty', SearchController.searchFaculty);

export default router;