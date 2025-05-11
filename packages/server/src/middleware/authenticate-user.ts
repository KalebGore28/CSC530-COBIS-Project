/* v8 ignore next 50 */ // Not easy to test since it uses Better Auth
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth"; // Your Better Auth instance
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/requests";

/**
 * Middleware to ensure users are authenticated before accessing protected routes.
 * Attach the session and user objects to the request object.
 */
export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Retrieve the session using Better Auth's getSession method
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});

		// Check if a session exists
		if (session) {
			// Attach the session to the request object for use in subsequent handlers
			(req as AuthenticatedRequest).session = session.session;
			(req as AuthenticatedRequest).user = session.user;
			next(); // Proceed to the next middleware or route handler
		} else {
			// No session found, return 401 Unauthorized
			res.status(401).json({ message: "Unauthorized" });
		}
	} catch (error) {
		// Handle any errors during session retrieval (e.g., network issues)
		console.error("Authentication error:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};