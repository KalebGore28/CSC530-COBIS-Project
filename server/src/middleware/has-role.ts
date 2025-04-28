import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthAndPermissionsRequest } from "../types/requests";

/**
 * Middleware to check if the user has the required role(s).
 * @param role_name The role_name or array of role_names to check for.
 */
export const hasRole = (role_name: string | string[]): RequestHandler => {
	// Validate role_name type at middleware creation
	if (Array.isArray(role_name)) {
		if (!role_name.every((name) => typeof name === "string")) {
			throw new Error("role_name array must contain only strings");
		}
	} else if (typeof role_name !== "string") {
		throw new Error("role_name must be a string or an array of strings");
	}

	return (req: Request, res: Response, next: NextFunction) => {
		// Get the user's roles from the request
		const userRoles = (req as AuthAndPermissionsRequest).roles;

		// Check if userRoles is defined and is an array
		if (!userRoles || !Array.isArray(userRoles)) {
			res.status(403).json({ error: "Forbidden: User roles are not defined" });
			return;
		}

		// Determine if the user has the required role(s)
		let hasRequiredRole = false;
		if (Array.isArray(role_name)) {
			// If role_name is an array, check if any user role matches any role in the array
			hasRequiredRole = userRoles.some((role) => role_name.includes(role.role_name));
		} else {
			// If role_name is a single string, check if the user has that role
			hasRequiredRole = userRoles.some((role) => role.role_name === role_name);
		}

		// If the user doesn't have the required role(s), return a 403 error
		if (!hasRequiredRole) {
			res.status(403).json({ error: "Forbidden: User does not have the required role" });
			return;
		}

		// Proceed to the next middleware or route handler
		next();
	};
};