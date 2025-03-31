import express, { Request, Response } from 'express';
import totalCreditHours, { creditHoursSpec } from './reporting/totalCreditHours';
import studentCourseRequirements, { studentCourseRequirementSpec } from './reporting/studentCourseRequirements';
import classRoster, { classRosterSpec } from './reporting/classRoster';


const router = express.Router();
router.use(totalCreditHours);
router.use(studentCourseRequirements);
router.use(classRoster);

export const reportingSpecs = {
	...creditHoursSpec,
	...studentCourseRequirementSpec,
	...classRosterSpec
}

export default router;