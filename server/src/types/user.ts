/**
 * Interface representing user session information attached to requests
 */
export interface UserSessionInfo {
	roles?: Array<{ role_id: number; role_name: string }>;
	permissions?: Array<{ table_name: string; column_name: string }>;
	department?: string | null;
	college?: string | null;
	mnumber?: string | null;
	isEnabled?: boolean | null;
} 