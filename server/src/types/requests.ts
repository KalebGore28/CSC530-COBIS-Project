import { Request } from "express";
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
	};
}

export interface AuthandPermissionsRequest extends AuthenticatedRequest {
	permissions: { table_name: string; column_name: string }[];
	roles: { role_id: number; role_name: string }[];
}
