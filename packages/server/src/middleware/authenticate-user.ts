// src/middleware/authenticate-and-load-user.ts
import { fromNodeHeaders } from "better-auth/node";
import { authPromise } from "../lib/auth";
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
		const auth = await authPromise();
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
		const userRowArr = await db
			.select({
				mnumber: user.mnumber,
				isEnabled: user.isEnabled,
			})
			.from(user)
			.where(eq(user.id, userId));

		const userRow = userRowArr[0];

		if (!userRow) {
			res.status(403).json({ error: "Forbidden: User not found" });
			return;
		}

		// Now fetch userRolesRows and facultyRow in parallel
		const [userRolesRows, facultyRow] = await Promise.all([
			db
				.select({
					id: userRoles.role_id,
					name: roles.name,
				})
				.from(userRoles)
				.innerJoin(roles, eq(roles.id, userRoles.role_id))
				.where(eq(userRoles.user_id, userId)),
			db
				.select({
					department: faculty.department,
					college: faculty.college,
				})
				.from(faculty)
				.where(eq(faculty.mnumber, userRow.mnumber || "")), // Now userRow.mnumber is available
		]);

		// 3) Attach exactly the same shape you had before
		(req as AuthAndPermissionsRequest).roles = userRolesRows;
		(req as AuthAndPermissionsRequest).department = facultyRow?.[0]?.department ?? null;
		(req as AuthAndPermissionsRequest).college = facultyRow?.[0]?.college ?? null;
		(req as AuthAndPermissionsRequest).mnumber = userRow.mnumber;
		(req as AuthAndPermissionsRequest).isEnabled = userRow.isEnabled;

		next();
	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
	}
};
