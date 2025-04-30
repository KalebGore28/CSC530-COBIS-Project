import { Request, Response } from 'express';
import { LookupService } from '../services/lookup-service';

/**
 * Controller for handling lookup operations
 */
export class LookupController {

	/**
	 * Get departments
	 */
	static async getDepartments(req: Request, res: Response) {
		try {
			const results = await LookupService.getDepartments();
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Get colleges
	 */
	static async getColleges(req: Request, res: Response) {
		try {
			const results = await LookupService.getColleges();
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Get all roles
	 */
	static async getRoles(req: Request, res: Response) {
		try {
			const results = await LookupService.getRoles();
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

}