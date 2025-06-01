// src/middleware/requireEnabled.ts
import { Request, Response, NextFunction } from "express";
import { AuthAndPermissionsRequest } from "../types/requests";

export const requireEnabled = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!(req as AuthAndPermissionsRequest).isEnabled) {
		res.status(403).json({ error: "Forbidden: Your account is disabled." });
		return;
	}
	return next();
}
