export type Term = {
	code: string;
	description: string;
}

export type Course = {
	subject: string;
	number: number;
	suffix: string;
	title: string;
	hours: number;
	fee: number;
	web_fee: number;
	last_updated: string;
	department: string;
	college: string;
}

export type Student = {
	mnumber: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	suffix: string;
	gender: string;
	birthdate: string;
	citizenship: string;
	race_code: string;
	race_description: string;
	residency_code: string;
	residency_description: string;
	age: number;
	cell_phone: string;
	email: string;
}

export type StudentAcademicInfo = {
	mnumber: string;
	term: string;
	year: number;
	admit_term: string;
	admit_year: number;
	admit_code: string;
	academic_standing: string;
	msu_attempted_hours: number;
	msu_earned_hours: number;
	msu_quality_points: number;
	msu_gpa: number;
	overall_attempted_hours: number;
	overall_earned_hours: number;
	overall_quality_points: number;
	overall_gpa: number;
}