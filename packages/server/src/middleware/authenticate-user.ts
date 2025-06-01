// src/middleware/authenticate-and-load-user.ts
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { Request, Response, NextFunction } from "express";
import { getDbConnection } from "../db/connection";
import { eq } from "drizzle-orm";
import {
	user,
	userRoles,
	roles,
	faculty,
} from "../db/schema";
import {
	AuthenticatedRequest,
	AuthAndPermissionsRequest,
} from "../types/requests";

export const authenticateAndLoadUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// 1) Authenticate via Better Auth
		const sessionResult = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!sessionResult) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const { session, user: betterUser } = sessionResult;
		(req as AuthenticatedRequest).session = session;
		(req as AuthenticatedRequest).user = betterUser;
		const userId = betterUser.id;

		// 2) In parallel, fetch
		//   a) basic user row
		//   b) roles array
		//   c) faculty info
		const db = (await getDbConnection()).orm;

		// Fetch userRow first
		const userRow = await db
			.select({
				mnumber: user.mnumber,
				isEnabled: user.isEnabled,
			})
			.from(user)
			.where(eq(user.id, userId))
			.get(); // returns single row or undefined

		if (!userRow) {
			res.status(403).json({ error: "Forbidden: User not found" });
			return;
		}

		// Now fetch userRolesRows and facultyRow in parallel
		const [userRolesRows, facultyRow] = await Promise.all([
			db
				.select({
					role_id: userRoles.role_id,
					role_name: roles.name,
				})
				.from(userRoles)
				.innerJoin(roles, eq(roles.id, userRoles.role_id))
				.where(eq(userRoles.user_id, userId))
				.all(), // returns array
			db
				.select({
					department: faculty.department,
					college: faculty.college,
				})
				.from(faculty)
				.where(eq(faculty.mnumber, userRow.mnumber || "")) // Now userRow.mnumber is available
				.get(),
		]);

		// 3) Attach exactly the same shape you had before
		const info = req as AuthAndPermissionsRequest;
		info.roles = userRolesRows;
		info.department = facultyRow?.department ?? null;
		info.college = facultyRow?.college ?? null;
		info.mnumber = userRow.mnumber;
		info.isEnabled = userRow.isEnabled;

		// 4) (Optional) lastLogin update should happen only on an explicit "login" action
		//    — remove it from here so you don’t pay per-request.
		next();
	} catch (err) {
		console.error("Authentication/permission error:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
