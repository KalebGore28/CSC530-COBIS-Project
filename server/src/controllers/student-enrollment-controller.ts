// src/controllers/student-enrollment-controller.ts
import { Request, Response } from 'express';
import { StudentEnrollmentService } from '../services/student-enrollment-service';
import { AuthAndPermissionsRequest } from '../types/requests';

export class StudentEnrollmentController {
	/**
	 * Get student enrollment history
	 */
	static async getEnrollmentHistory(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const user = req as AuthAndPermissionsRequest;

			const enrollmentHistory = await StudentEnrollmentService.getEnrollmentHistory(
				mnumber,
				user
			);

			if (!enrollmentHistory) {
				res.status(404).json({ error: 'Student not found' });
				return;
			}

			res.json(enrollmentHistory);
			return;
		} catch (error) {
			console.error('Error fetching student enrollment history:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}
}