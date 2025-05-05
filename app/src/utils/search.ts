// utils/search.ts

// This file is to house the functions for the search-input.tsx component.
// It will contain the API calls to fetch data for the search input.
// It will also contain the interfaces for the data you expect to receive.
import { fetchGraphQL } from "@/utils/fetch-graphql";

// Define the interfaces for the data you expect to receive
export interface Department {
	code: string;
	description: string;
}
export interface Course {
	subject: string;
	number: string;
	suffix: string;
	title: string;
	hours: number;
	fee: number;
	web_fee: number;
	last_updated: string;
	department: string;
	college: string;
}
export interface Program {
	code: string;
	description: string;
	cip_code: string;
	is_major: boolean;
	is_minor: boolean;
	has_concentration: boolean;
	is_discontinued: boolean;
	is_aacsb: boolean;
	department: {
		code: string;
		description: string;
	}
	college: {
		code: string;
		description: string;
	}
	added_on: string;
}

// For Departments:
export const searchDepartments = async (query: string) => {
	const data = await fetchGraphQL(
    /* GraphQL */ `
      query SearchDepartments($query: String!) {
        searchDepartments(query: $query) {
          code
          description
        }
      }
    `,
		{ query }
	);
	return data.searchDepartments as Department[];
};

// For Courses:
export const searchCourses = async (query: string) => {
	const data = await fetchGraphQL(
    /* GraphQL */ `
      query SearchCourses($query: String!) {
        searchCourses(query: $query) {
          subject
          number
          title
        }
      }
    `,
		{ query }
	);
	return data.searchCourses as Course[];
};

// For Programs:
export const searchPrograms = async (query: string) => {
	const data = await fetchGraphQL(
	  /* GraphQL */ `
		query SearchPrograms($query: String!) {
		  searchPrograms(query: $query) {
			code
			description
			is_major
			is_minor
			has_concentration
			is_discontinued
			is_aacsb
			department { code description }
		  }
		}
	  `,
	  { query }
	);
	return data.searchPrograms as Program[];
  };

