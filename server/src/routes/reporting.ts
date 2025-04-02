import express from 'express';
import studentCourseRequirements, { studentCourseRequirementSpec } from './reporting/studentCourseRequirements';


const router = express.Router();
router.use(studentCourseRequirements);

export const reportingSpecs = {
	...studentCourseRequirementSpec,
}

export default router;