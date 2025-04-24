export interface UserRole {
	role_id: number;
	role_name: string;
}

export interface User {
	id: string;
	mnumber: string | null;
	name: string;
	email: string;
	image: string | null;
	isEnabled: boolean;
	lastLogin: string | null;
	createdAt: string;
	college_code: string | null;
	college: string | null;
	department_code: string | null;
	department: string | null;
	roles: UserRole[] | null;
}

export interface UserFilters {
	isEnabled?: boolean;
	college?: string;
	department?: string;
	name?: string;
	email?: string;
	mnumber?: string;
}

export interface UserData {
	id: string;
	mnumber?: string | null;
	name?: string;
	email?: string;
	image?: string;
	isEnabled?: boolean;
	lastLogin?: string;
	createdAt?: string;
	updatedAt?: string;
	roles?: { role_id: string; role_name: string }[];
	department_code?: string | null;
	department?: string | null;
	college_code?: string | null;
	college?: string | null;
}