import { z } from 'zod';
import 'zod-openapi/extend';

// Query parameters for program enrollment listing
const ProgramEnrollmentQuerySchema = z.object({
	department: z.string().openapi({
		description: 'Department code to filter programs by',
		example: 'CSC'
	}),
	term: z.string().optional().openapi({
		description: 'Term code to filter enrollment by',
		example: '10'
	}),
	year: z.string().optional().openapi({
		description: 'Year to filter enrollment by',
		example: '2023'
	}),
	programType: z.string().optional().openapi({
		description: 'Program type to filter by (MAJOR/MINOR)',
		example: 'MAJOR'
	}),
	level: z.string().optional().openapi({
		description: 'Program level to filter by (UG/GR/PB)',
		example: 'UG'
	})
});

// Query parameters for program students listing
const ProgramStudentsQuerySchema = z.object({
	department: z.string().openapi({
		description: 'Department code',
		example: 'CSC'
	}),
	term: z.string().optional().openapi({
		description: 'Term code to filter enrollment by',
		example: '10'
	}),
	year: z.string().optional().openapi({
		description: 'Year to filter enrollment by',
		example: '2023'
	}),
	level: z.string().optional().openapi({
		description: 'Program level to filter by (UG/GR/PB)',
		example: 'UG'
	}),
	page: z.string().optional().openapi({
		description: 'Page number for pagination',
		example: '1'
	}),
	limit: z.string().optional().openapi({
		description: 'Number of results per page',
		example: '50'
	})
});

// Query parameters for program enrollment trends
const ProgramTrendsQuerySchema = z.object({
	department: z.string().openapi({
		description: 'Department code',
		example: 'CSC'
	}),
	programCode: z.string().optional().openapi({
		description: 'Program code to filter trends by',
		example: 'CSBS'
	}),
	yearsBack: z.string().optional().openapi({
		description: 'Number of years to look back',
		example: '5'
	}),
	includeCurrentTerm: z.string().optional().openapi({
		description: 'Whether to include the current term',
		example: 'true'
	})
});

// Path parameters for program students
const ProgramStudentsParamsSchema = z.object({
	programCode: z.string().openapi({
		description: 'Program code to get students for',
		example: 'CSBS'
	})
});

// Program enrollment response schema
const ProgramEnrollmentResponse = z.object({
	department: z.object({
		code: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		description: z.string().openapi({
			description: 'Department description',
			example: 'Computer Science'
		})
	}).openapi({
		description: 'Department information'
	}),
	term: z.object({
		code: z.string().openapi({
			description: 'Term code',
			example: '10'
		}),
		description: z.string().openapi({
			description: 'Term description',
			example: 'Spring 2023'
		})
	}).optional().openapi({
		description: 'Term information if filtered by term'
	}),
	year: z.number().optional().openapi({
		description: 'Year if filtered by year',
		example: 2023
	}),
	programType: z.string().optional().openapi({
		description: 'Program type if filtered',
		example: 'MAJOR'
	}),
	level: z.string().optional().openapi({
		description: 'Program level if filtered',
		example: 'UG'
	}),
	programs: z.array(
		z.object({
			code: z.string().openapi({
				description: 'Program code',
				example: 'CSBS'
			}),
			description: z.string().openapi({
				description: 'Program description',
				example: 'Computer Science, BS'
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
			enrollmentCount: z.number().openapi({
				description: 'Number of students enrolled in this program',
				example: 120
			}),
			distinctStudentCount: z.number().openapi({
				description: 'Number of distinct students enrolled',
				example: 115
			}),
			percentageOfDepartment: z.number().openapi({
				description: 'Percentage of department enrollment',
				example: 35.5
			})
		})
	).openapi({
		description: 'List of programs with enrollment data'
	}),
	totals: z.object({
		totalEnrollment: z.number().openapi({
			description: 'Total enrollment count',
			example: 350
		}),
		distinctStudentCount: z.number().openapi({
			description: 'Total distinct student count',
			example: 300
		}),
		majorCount: z.number().openapi({
			description: 'Number of students in majors',
			example: 250
		}),
		minorCount: z.number().openapi({
			description: 'Number of students in minors',
			example: 100
		}),
		levelCounts: z.record(z.number()).openapi({
			description: 'Enrollment counts by level',
			example: { UG: 280, GR: 70 }
		})
	}).openapi({
		description: 'Enrollment totals and statistics'
	})
});

// Program students response schema
const ProgramStudentsResponse = z.object({
	program: z.object({
		code: z.string().openapi({
			description: 'Program code',
			example: 'CSBS'
		}),
		description: z.string().openapi({
			description: 'Program description',
			example: 'Computer Science, BS'
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
		})
	}).openapi({
		description: 'Program information'
	}),
	department: z.object({
		code: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		description: z.string().openapi({
			description: 'Department description',
			example: 'Computer Science'
		})
	}).openapi({
		description: 'Department information'
	}),
	term: z.object({
		code: z.string().openapi({
			description: 'Term code',
			example: '10'
		}),
		description: z.string().openapi({
			description: 'Term description',
			example: 'Spring 2023'
		})
	}).optional().openapi({
		description: 'Term information if filtered by term'
	}),
	year: z.number().optional().openapi({
		description: 'Year if filtered by year',
		example: 2023
	}),
	level: z.string().optional().openapi({
		description: 'Program level if filtered',
		example: 'UG'
	}),
	pagination: z.object({
		page: z.number().openapi({
			description: 'Current page number',
			example: 1
		}),
		limit: z.number().openapi({
			description: 'Items per page',
			example: 50
		}),
		totalItems: z.number().openapi({
			description: 'Total number of items',
			example: 120
		}),
		totalPages: z.number().openapi({
			description: 'Total number of pages',
			example: 3
		})
	}).openapi({
		description: 'Pagination information'
	}),
	students: z.array(
		z.object({
			mnumber: z.string().openapi({
				description: 'Student M-number',
				example: 'M12345678'
			}),
			firstName: z.string().openapi({
				description: 'Student first name',
				example: 'John'
			}),
			lastName: z.string().openapi({
				description: 'Student last name',
				example: 'Smith'
			}),
			email: z.string().openapi({
				description: 'Student email',
				example: 'john.smith@example.edu'
			}),
			programType: z.string().openapi({
				description: 'Program type (MAJOR/MINOR)',
				example: 'MAJOR'
			}),
			programLevel: z.string().openapi({
				description: 'Program level (UG/GR/PB)',
				example: 'UG'
			}),
			academicInfo: z.object({
				msu_gpa: z.number().nullable().openapi({
					description: 'MSU GPA',
					example: 3.75
				}),
				overall_gpa: z.number().nullable().openapi({
					description: 'Overall GPA',
					example: 3.8
				}),
				earned_hours: z.number().nullable().openapi({
					description: 'Earned hours',
					example: 90
				}),
				academicStanding: z.string().nullable().openapi({
					description: 'Academic standing code',
					example: 'GS'
				})
			}).openapi({
				description: 'Academic information'
			})
		})
	).openapi({
		description: 'List of students in the program'
	})
});

// Program enrollment trends response schema
const ProgramEnrollmentTrendsResponse = z.object({
	department: z.object({
		code: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		description: z.string().openapi({
			description: 'Department description',
			example: 'Computer Science'
		})
	}).openapi({
		description: 'Department information'
	}),
	program: z.object({
		code: z.string().openapi({
			description: 'Program code',
			example: 'CSBS'
		}),
		description: z.string().openapi({
			description: 'Program description',
			example: 'Computer Science, BS'
		})
	}).optional().openapi({
		description: 'Program information if filtered by program'
	}),
	startYear: z.number().openapi({
		description: 'Start year for the trend data',
		example: 2018
	}),
	endYear: z.number().openapi({
		description: 'End year for the trend data',
		example: 2023
	}),
	includesCurrentTerm: z.boolean().openapi({
		description: 'Whether the current term is included',
		example: true
	}),
	trends: z.array(
		z.object({
			program: z.object({
				code: z.string().openapi({
					description: 'Program code',
					example: 'CSBS'
				}),
				description: z.string().openapi({
					description: 'Program description',
					example: 'Computer Science, BS'
				})
			}).openapi({
				description: 'Program information'
			}),
			data: z.array(
				z.object({
					termYear: z.string().openapi({
						description: 'Term and year',
						example: '10-2023'
					}),
					term: z.string().openapi({
						description: 'Term code',
						example: '10'
					}),
					termDescription: z.string().openapi({
						description: 'Term description',
						example: 'Spring'
					}),
					year: z.number().openapi({
						description: 'Year',
						example: 2023
					}),
					count: z.number().openapi({
						description: 'Enrollment count',
						example: 120
					})
				})
			).openapi({
				description: 'Enrollment data by term'
			})
		})
	).openapi({
		description: 'Enrollment trend data by program'
	})
});

// Query parameters for faculty enrollment
const FacultyEnrollmentQuerySchema = z.object({
	department: z.string().openapi({
		description: 'Department code',
		example: 'CSC'
	}),
	term: z.string().optional().openapi({
		description: 'Term code to filter enrollment by',
		example: '10'
	}),
	year: z.string().optional().openapi({
		description: 'Year to filter enrollment by',
		example: '2023'
	})
});

// Faculty enrollment response schema
const FacultyEnrollmentResponse = z.object({
	department: z.object({
		code: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		description: z.string().openapi({
			description: 'Department description',
			example: 'Computer Science'
		})
	}).openapi({
		description: 'Department information'
	}),
	term: z.object({
		code: z.string().openapi({
			description: 'Term code',
			example: '10'
		}),
		description: z.string().openapi({
			description: 'Term description',
			example: 'Spring 2023'
		})
	}).openapi({
		description: 'Term information'
	}),
	year: z.number().openapi({
		description: 'Year',
		example: 2023
	}),
	faculty: z.array(
		z.object({
			mnumber: z.string().openapi({
				description: 'Faculty M-number',
				example: 'M12345678'
			}),
			firstName: z.string().openapi({
				description: 'Faculty first name',
				example: 'Jane'
			}),
			lastName: z.string().openapi({
				description: 'Faculty last name',
				example: 'Smith'
			}),
			courseCount: z.number().openapi({
				description: 'Number of courses taught',
				example: 3
			}),
			studentCount: z.number().openapi({
				description: 'Total number of students taught',
				example: 75
			}),
			courses: z.array(
				z.object({
					courseId: z.string().openapi({
						description: 'Course ID',
						example: 'CSC 430'
					}),
					courseTitle: z.string().openapi({
						description: 'Course title',
						example: 'Database Management Systems'
					}),
					crn: z.string().openapi({
						description: 'Course registration number',
						example: '12345'
					}),
					section: z.string().openapi({
						description: 'Course section',
						example: '01'
					}),
					enrollmentCount: z.number().openapi({
						description: 'Number of students enrolled',
						example: 30
					})
				})
			).openapi({
				description: 'Courses taught by the faculty member'
			})
		})
	).openapi({
		description: 'List of faculty with enrollment data'
	}),
	totals: z.object({
		facultyCount: z.number().openapi({
			description: 'Total number of faculty',
			example: 2
		}),
		totalCourses: z.number().openapi({
			description: 'Total number of courses',
			example: 5
		}),
		totalStudents: z.number().openapi({
			description: 'Total number of students',
			example: 135
		})
	}).openapi({
		description: 'Department totals'
	})
});

export const EnrollmentAPISpecs = {
	'/api/enrollment/programs': {
		get: {
			tags: ['Enrollment'],
			operationId: 'getProgramEnrollment',
			summary: 'Get program enrollment data',
			description: 'Retrieve enrollment data for programs in a department. Access restricted to authorized users only.',
			requestParams: {
				query: ProgramEnrollmentQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with program enrollment data',
					content: {
						'application/json': {
							schema: ProgramEnrollmentResponse
						}
					}
				}
			}
		}
	},
	'/api/enrollment/programs/{programCode}/students': {
		get: {
			tags: ['Enrollment'],
			operationId: 'getProgramStudents',
			summary: 'Get students in a program',
			description: 'Retrieve a list of students enrolled in a specific program. Access restricted to authorized users only.',
			requestParams: {
				path: ProgramStudentsParamsSchema,
				query: ProgramStudentsQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with program students data',
					content: {
						'application/json': {
							schema: ProgramStudentsResponse
						}
					}
				}
			}
		}
	},
	'/api/enrollment/programs/trends': {
		get: {
			tags: ['Enrollment'],
			operationId: 'getProgramEnrollmentTrends',
			summary: 'Get program enrollment trends',
			description: 'Retrieve enrollment trend data for programs over time. Access restricted to authorized users only.',
			requestParams: {
				query: ProgramTrendsQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with program enrollment trend data',
					content: {
						'application/json': {
							schema: ProgramEnrollmentTrendsResponse
						}
					}
				}
			}
		}
	},
	'/api/enrollment/faculty': {
		get: {
			tags: ['Enrollment'],
			operationId: 'getFacultyEnrollment',
			summary: 'Get faculty enrollment data',
			description: 'Retrieve enrollment data by faculty member in a department, showing courses taught and student counts. Access restricted to authorized users only.',
			requestParams: {
				query: FacultyEnrollmentQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with faculty enrollment data',
					content: {
						'application/json': {
							schema: FacultyEnrollmentResponse
						}
					}
				}
			}
		}
	}
};

export const EnrollmentSpecs = {
	ProgramEnrollmentQuerySchema,
	ProgramStudentsQuerySchema,
	ProgramTrendsQuerySchema,
	ProgramStudentsParamsSchema,
	ProgramEnrollmentResponse,
	ProgramStudentsResponse,
	ProgramEnrollmentTrendsResponse,
	FacultyEnrollmentQuerySchema,
	FacultyEnrollmentResponse
}; 