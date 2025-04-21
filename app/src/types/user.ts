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
	college: string | null;
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