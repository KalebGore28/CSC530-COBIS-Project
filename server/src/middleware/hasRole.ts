import { Request, Response, NextFunction } from "express";
import { AuthandPermissionsRequest } from "../types/requests";

/**
 * Middleware to check if the user has the required role.
 * @param role_id The role_id to check for.
 */
export const hasRole = (role_id: number) => {
	return (req: Request, res: Response, next: NextFunction) => {

		const hasRole = (req as AuthandPermissionsRequest).roles.some((role) => role.role_id === role_id);
		if (!hasRole) {
			return res.status(403).json({ error: "Forbidden: User does not have the required role" });
		}
		next();
	};
}