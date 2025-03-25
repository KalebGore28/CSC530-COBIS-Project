import { Request, Response, NextFunction } from "express";
import { AuthAndPermissionsRequest } from "../types/requests";

/**
 * Middleware to check if the user has the required role(s).
 * @param role_id The role_id or array of role_ids to check for.
 */
export const hasRole = (role_id: number | number[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// Get the user's roles from the request
		const userRoles = (req as AuthAndPermissionsRequest).roles;

		// Check if userRoles is defined and is an array
		if (!userRoles || !Array.isArray(userRoles)) {
			return res.status(403).json({ error: "Forbidden: User roles are not defined" });
		}

		// Determine if the user has the required role(s)
		let hasRequiredRole = false;
		if (Array.isArray(role_id)) {
			// If role_id is an array, check if any user role matches any role in the array
			hasRequiredRole = userRoles.some((role) => role_id.includes(role.role_id));
		} else if (typeof role_id === "number") {
			// If role_id is a single number, check if the user has that role
			hasRequiredRole = userRoles.some((role) => role.role_id === role_id);
		} else {
			// Invalid role_id type
			return res.status(400).json({ error: "Invalid role_id type" });
		}

		// If the user doesn't have the required role(s), return a 403 error
		if (!hasRequiredRole) {
			return res.status(403).json({ error: "Forbidden: User does not have the required role" });
		}

		// Proceed to the next middleware or route handler
		next();
	};
};