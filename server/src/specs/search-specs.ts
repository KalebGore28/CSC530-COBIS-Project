import { z } from 'zod';
import 'zod-openapi/extend';

// Common query parameter schema for all search endpoints
const SearchQuerySchema = z.object({
	query: z.string().openapi({
		description: 'Search string to find matching records',
		example: 'comp'
	})
});

// Response schemas for different entities
const AcademicStandingResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Academic standing code',
			example: 'GS'
		}),
		description: z.string().openapi({
			description: 'Academic standing description',
			example: 'Good Standing'
		})
	})
).openapi({
	description: 'List of academic standings matching the search criteria'
});

const AdmitCodeResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Admit code',
			example: 'FR'
		}),
		description: z.string().openapi({
			description: 'Admit code description',
			example: 'First-time Freshman'
		})
	})
).openapi({
	description: 'List of admit codes matching the search criteria'
});

const CollegeResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'College code',
			example: 'BUS'
		}),
		name: z.string().openapi({
			description: 'College name',
			example: 'College of Business'
		})
	})
).openapi({
	description: 'List of colleges matching the search criteria'
});

const CollegeCodeResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'College code',
			example: 'BU'
		}),
		name: z.string().openapi({
			description: 'College name or description',
			example: 'Business'
		})
	})
).openapi({
	description: 'List of college codes matching the search criteria'
});

const CourseResponse = z.array(
	z.object({
		subject: z.string().openapi({
			description: 'Course subject code',
			example: 'CSC'
		}),
		number: z.string().openapi({
			description: 'Course number',
			example: '430'
		}),
		suffix: z.string().nullable().openapi({
			description: 'Course suffix',
			example: 'H'
		}),
		title: z.string().openapi({
			description: 'Course title',
			example: 'Database Management Systems'
		})
	})
).openapi({
	description: 'List of courses matching the search criteria'
});

const DepartmentResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		name: z.string().openapi({
			description: 'Department name',
			example: 'Computer Science'
		})
	})
).openapi({
	description: 'List of departments matching the search criteria'
});

const NationResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Nation code',
			example: 'US'
		}),
		name: z.string().openapi({
			description: 'Nation name',
			example: 'United States'
		})
	})
).openapi({
	description: 'List of nations matching the search criteria'
});

const PartOfTermResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Part of term code',
			example: '1'
		}),
		description: z.string().openapi({
			description: 'Part of term description',
			example: 'Full Term'
		})
	})
).openapi({
	description: 'List of part of terms matching the search criteria'
});

const FacultyResponse = z.array(
	z.object({
		mnumber: z.string().openapi({
			description: 'Faculty member number',
			example: '123456'
		}),
		firstName: z.string().openapi({
			description: 'Faculty first name',
			example: 'John'
		}),
		lastName: z.string().openapi({
			description: 'Faculty last name',
			example: 'Doe'
		}),
	})
).openapi({
	description: 'List of faculty members matching the search criteria'
});

const ProgramResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Program code',
			example: 'CSBS'
		}),
		description: z.string().openapi({
			description: 'Program description',
			example: 'Computer Science, BS'
		}),
		cipCode: z.string().nullable().openapi({
			description: 'CIP code',
			example: '11.0701'
		}),
		isMajor: z.boolean().openapi({
			description: 'Whether the program is a major',
			example: true
		}),
		isMinor: z.boolean().openapi({
			description: 'Whether the program is a minor',
			example: false
		}),
		hasConcentration: z.boolean().openapi({
			description: 'Whether the program has concentrations',
			example: false
		}),
		isDiscontinued: z.boolean().openapi({
			description: 'Whether the program is discontinued',
			example: false
		}),
		isAacsb: z.boolean().openapi({
			description: 'Whether the program is AACSB accredited',
			example: false
		}),
		department: z.string().nullable().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		college: z.string().nullable().openapi({
			description: 'College code',
			example: 'SCI'
		})
	})
).openapi({
	description: 'List of programs matching the search criteria'
});

const RegistrationStatusResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Registration status code',
			example: 'RE'
		}),
		description: z.string().openapi({
			description: 'Registration status description',
			example: 'Registered'
		})
	})
).openapi({
	description: 'List of registration statuses matching the search criteria'
});

const TermResponse = z.array(
	z.object({
		code: z.string().openapi({
			description: 'Term code',
			example: '10'
		}),
		description: z.string().openapi({
			description: 'Term description',
			example: 'Spring'
		})
	})
).openapi({
	description: 'List of terms matching the search criteria'
});

export const SearchAPISpecs = {
	'/api/search/academic-standings': {
		get: {
			tags: ['Search'],
			operationId: 'searchAcademicStandings',
			summary: 'Search academic standings',
			description: 'Search for academic standings by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with academic standings data',
					content: {
						'application/json': {
							schema: AcademicStandingResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/admit-codes': {
		get: {
			tags: ['Search'],
			operationId: 'searchAdmitCodes',
			summary: 'Search admit codes',
			description: 'Search for admit codes by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with admit codes data',
					content: {
						'application/json': {
							schema: AdmitCodeResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/colleges': {
		get: {
			tags: ['Search'],
			operationId: 'searchColleges',
			summary: 'Search colleges',
			description: 'Search for colleges by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with colleges data',
					content: {
						'application/json': {
							schema: CollegeResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/college-codes': {
		get: {
			tags: ['Search'],
			operationId: 'searchCollegeCodes',
			summary: 'Search college codes',
			description: 'Search for college codes by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with college codes data',
					content: {
						'application/json': {
							schema: CollegeCodeResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/courses': {
		get: {
			tags: ['Search'],
			operationId: 'searchCourses',
			summary: 'Search courses',
			description: 'Search for courses by subject+number+suffix or title. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with courses data',
					content: {
						'application/json': {
							schema: CourseResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/departments': {
		get: {
			tags: ['Search'],
			operationId: 'searchDepartments',
			summary: 'Search departments',
			description: 'Search for departments by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with departments data',
					content: {
						'application/json': {
							schema: DepartmentResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/nations': {
		get: {
			tags: ['Search'],
			operationId: 'searchNations',
			summary: 'Search nations',
			description: 'Search for nations by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with nations data',
					content: {
						'application/json': {
							schema: NationResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/part-of-terms': {
		get: {
			tags: ['Search'],
			operationId: 'searchPartOfTerms',
			summary: 'Search part of terms',
			description: 'Search for part of terms by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with part of terms data',
					content: {
						'application/json': {
							schema: PartOfTermResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/programs': {
		get: {
			tags: ['Search'],
			operationId: 'searchPrograms',
			summary: 'Search programs',
			description: 'Search for programs by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with programs data',
					content: {
						'application/json': {
							schema: ProgramResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/registration-statuses': {
		get: {
			tags: ['Search'],
			operationId: 'searchRegistrationStatuses',
			summary: 'Search registration statuses',
			description: 'Search for registration statuses by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with registration statuses data',
					content: {
						'application/json': {
							schema: RegistrationStatusResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/terms': {
		get: {
			tags: ['Search'],
			operationId: 'searchTerms',
			summary: 'Search terms',
			description: 'Search for terms by code or description. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with terms data',
					content: {
						'application/json': {
							schema: TermResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/search/faculty': {
		get: {
			tags: ['Search'],
			operationId: 'searchFaculty',
			summary: 'Search faculty members',
			description: 'Search for faculty members by mnumber, first name, or last name. Results are limited to 10 items.',
			requestParams: {
				query: SearchQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with faculty data',
					content: {
						'application/json': {
							schema: FacultyResponse
						}
					}
				},
				'400': {
					description: 'Missing or invalid query parameter',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	}
};