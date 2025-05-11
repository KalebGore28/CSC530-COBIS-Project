import { Request, Response } from "express";
import { UtilityService } from "../services/utility-service";

export class UtilityController {
	static async getCurrentTermAndYear(req: Request, res: Response) {
		try {
			const currentTerm = await UtilityService.getCurrentTermAndYear();
			res.status(200).json(currentTerm);
			return;
		} catch (error) {
			res.status(500).json({
				error: "Failed to retrieve current term and year"
			});
			return;
		}
	}
}