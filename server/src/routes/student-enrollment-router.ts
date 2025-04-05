// // src/routes/student-enrollment-router.ts
// import express from 'express';
// import { StudentEnrollmentController } from '../controllers/student-enrollment-controller';
// import { checkStudentAccess } from '../middleware/check-student-access';

// const router = express.Router();

// // Get student enrollment history
// router.get(
// 	'/:mnumber/enrollment-history',
// 	checkStudentAccess,
// 	StudentEnrollmentController.getEnrollmentHistory
// );

// export default router;