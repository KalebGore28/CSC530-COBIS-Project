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
	if(!(req as AuthAndPermissionsRequest).mnumber) {
		res.status(401).json({ error: "Denied: Your account is missing an MNumber." });
		return;
	}
	return next();
}
