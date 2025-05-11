export interface User {
	id: string;
	name: string;
	email: string;
}

export type Role = 'student' | 'instructor' | 'advisor';

export interface Course {
	id: string;
	code: string;
	title: string;
}