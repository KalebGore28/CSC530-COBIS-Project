import { Request } from "express";

/**
 * Interface for authenticated requests.
 * Adds a `session` object and a `user` object to the request.
 */
export interface AuthenticatedRequest extends Request {
	session: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null | undefined;
		userAgent?: string | null | undefined;
	};
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image?: string | null | undefined;
		createdAt: Date;
		updatedAt: Date;
		department: string | null;
		college: string | null;
	};
}

/**
 * Interface for requests that require authentication and permissions.
 * Extends `AuthenticatedRequest` with `permissions` and `roles` properties.
 */
export interface AuthAndPermissionsRequest extends AuthenticatedRequest {
	permissions: { table_name: string; column_name: string }[];
	roles: { role_id: number; role_name: string }[];
}
