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