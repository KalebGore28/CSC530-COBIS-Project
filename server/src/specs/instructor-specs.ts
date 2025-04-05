import { max } from 'drizzle-orm';
import { request } from 'http';
import { z } from 'zod';
import 'zod-openapi/extend';
import { registrationStatus } from '../db/schema';

const MnumberRequestParamsSchema = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	})
});

const RosterQuerySchema = z.object({
	subject: z.string().openapi({
		description: 'Course subject code',
		example: 'CSC'
	}),
	number: z.string().openapi({
		description: 'Course number',
		example: '101'
	}),
	suffix: z.string().optional().openapi({
		description: 'Course suffix (if applicable)',
		example: 'A'
	}),
	term: z.string().openapi({
		description: 'Term when the course was taught',
		example: '10'
	}),
	year: z.string().openapi({
		description: 'Year when the course was taught',
		example: '2023'
	}),
})

// Endpoint-specific schemas
const GetInstructors = z.array(
	z.object({
		mnumber: z.string().openapi({
			description: 'Unique instructor identifier',
			example: 'M123456'
		}),
		name: z.string().openapi({
			description: 'Full name of the instructor',
			example: 'John Doe'
		}),
		firstName: z.string().openapi({
			description: 'Instructor first name',
			example: 'John'
		}),
		lastName: z.string().openapi({
			description: 'Instructor last name',
			example: 'Doe'
		}),
		department: z.string().openapi({
			description: 'Full name of the department',
			example: 'Computer Science'
		}),
		departmentCode: z.string().openapi({
			description: 'Department code',
			example: 'CS'
		}),
		college: z.string().openapi({
			description: 'Full name of the college',
			example: 'College of Engineering'
		}),
		collegeCode: z.string().openapi({
			description: 'College code',
			example: 'ENG'
		}),
		email: z.string().email().optional().openapi({
			description: 'Instructor email address',
			example: 'johndoe@example.com'
		}),
		image: z.string().url().optional().openapi({
			description: 'URL to instructor profile image',
			example: 'https://example.com/images/johndoe.jpg'
		}),
	})
)
const InstructorBasicInfo = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	instructorInfo: z.object({
		name: z.string().openapi({
			description: 'Full name of the instructor',
			example: 'John Doe'
		}),
		firstName: z.string().openapi({
			description: 'Instructor first name',
			example: 'John'
		}),
		lastName: z.string().openapi({
			description: 'Instructor last name',
			example: 'Doe'
		}),
		department: z.string().openapi({
			description: 'Full name of the department',
			example: 'Computer Science'
		}),
		departmentCode: z.string().openapi({
			description: 'Department code',
			example: 'CSC'
		}),
		college: z.string().openapi({
			description: 'Full name of the college',
			example: 'College of Engineering'
		}),
		collegeCode: z.string().openapi({
			description: 'College code',
			example: 'ENG'
		}),
		email: z.string().email().optional().openapi({
			description: 'Instructor email address',
			example: 'john.doe@university.edu'
		}),
		image: z.string().url().optional().openapi({
			description: 'URL to instructor profile image',
			example: 'https://university.edu/images/john-doe.jpg'
		}),
	})
});
const CurrentStatus = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	currentStatus: z.object({
		currentTerm: z.string().openapi({
			description: 'Current term and year',
			example: 'FALL'
		}),
		currentYear: z.number().openapi({
			description: 'Current year',
			example: 2023
		}),
		isCurrentlyTeaching: z.boolean().openapi({
			description: 'Indicates if the instructor is currently teaching',
			example: true
		}),
		currentCourseCount: z.number().openapi({
			description: 'Number of courses the instructor is currently teaching',
			example: 2
		}),
	})
});
const TeachingSummary = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	teachingSummary: z.object({
		totalCoursesTaught: z.number().openapi({
			description: 'Total number of courses taught by the instructor',
			example: 10
		}),
		uniqueCoursesTaught: z.number().openapi({
			description: 'Number of unique courses taught by the instructor',
			example: 5
		}),
		totalStudentsTaught: z.number().openapi({
			description: 'Total number of students taught by the instructor',
			example: 200
		}),
		totalCreditHoursDelivered: z.number().openapi({
			description: 'Total credit hours delivered by the instructor',
			example: 30
		}),
		averageClassSize: z.number().openapi({
			description: 'Average class size for the instructor',
			example: 20
		}),
		mostTaughtCourses: z.array(
			z.object({
				courseId: z.string().openapi({
					description: 'Unique course identifier',
					example: 'CS101'
				}),
				courseTitle: z.string().openapi({
					description: 'Title of the course',
					example: 'Introduction to Computer Science'
				}),
				timesTaught: z.number().openapi({
					description: 'Number of times the course has been taught by the instructor',
					example: 5
				}),
			})
		).openapi({
			description: 'List of most taught courses by the instructor',
			example: [
				{
					courseId: 'CS101',
					courseTitle: 'Introduction to Computer Science',
					timesTaught: 5
				},
				{
					courseId: 'CS102',
					courseTitle: 'Data Structures',
					timesTaught: 4
				}
			]
		}),
	})
})
const GetCourseDetails = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	courseDetails: z.array(
		z.object({
			termName: z.string().openapi({
				description: 'Term and year when the course was taught',
				example: 'FALL'
			}),
			termCode: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			year: z.number().openapi({
				description: 'Year when the course was taught',
				example: 2023
			}),
			courseId: z.string().openapi({
				description: 'Unique course identifier',
				example: 'CS101'
			}),
			courseTitle: z.string().openapi({
				description: 'Title of the course',
				example: 'Introduction to Computer Science'
			}),
			courseSubject: z.string().openapi({
				description: 'Course subject code',
				example: 'CS'
			}),
			courseNumber: z.string().openapi({
				description: 'Course number',
				example: '101'
			}),
			courseSuffix: z.string().optional().openapi({
				description: 'Course suffix (if applicable)',
				example: 'A'
			}),
			crn: z.string().openapi({
				description: 'Course Registration Number',
				example: '12345'
			}),
			creditHours: z.number().openapi({
				description: 'Number of credit hours for the course',
				example: 3
			}),
			studentCount: z.number().openapi({
				description: 'Number of students enrolled in the course',
				example: 30
			}),
			totalCreditHours: z.number().openapi({
				description: 'Total credit hours for the course',
				example: 90
			}),
		})
	).openapi({
		description: 'List of courses taught by the instructor',
		example: [
			{
				termName: 'FALL',
				termCode: '80',
				year: 2023,
				courseId: 'CS101',
				courseTitle: 'Introduction to Computer Science',
				courseSubject: 'CS',
				courseNumber: '101',
				courseSuffix: 'A',
				crn: '12345',
				creditHours: 3,
				studentCount: 30,
				totalCreditHours: 90
			},
			{
				termName: 'SPRING',
				termCode: '50',
				year: 2024,
				courseId: 'CS102',
				courseTitle: 'Data Structures',
				courseSubject: 'CS',
				courseNumber: '102',
				courseSuffix: '',
				crn: '67890',
				creditHours: 4,
				studentCount: 25,
				totalCreditHours: 100
			}
		]
	})
});
const GetTermSummaries = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	termSummaries: z.array(
		z.object({
			termCode: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			termName: z.string().openapi({
				description: 'Term and year when the course was taught',
				example: 'FALL'
			}),
			year: z.number().openapi({
				description: 'Year when the course was taught',
				example: 2023
			}),
			courseCount: z.number().openapi({
				description: 'Number of courses taught in the term',
				example: 3
			}),
			studentCount: z.number().openapi({
				description: 'Number of students enrolled in the courses',
				example: 90
			}),
			creditHoursDelivered: z.number().openapi({
				description: 'Total credit hours delivered in the term',
				example: 90
			}),
		}).openapi({
			description: 'List of term summaries for the instructor',
			example: {
				termCode: '80',
				termName: 'FALL',
				year: 2023,
				courseCount: 3,
				studentCount: 90,
				creditHoursDelivered: 90
			}
		})
	)
})
const GetClassRoster = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	classRoster: z.object({
		course: z.object({
			courseId: z.string().openapi({
				description: 'Unique course identifier',
				example: 'CS101'
			}),
			courseSubject: z.string().openapi({
				description: 'Course subject code',
				example: 'CSC'
			}),
			courseNumber: z.string().openapi({
				description: 'Course number',
				example: '101'
			}),
			courseSuffix: z.string().optional().openapi({
				description: 'Course suffix (if applicable)',
				example: 'A'
			}),
			courseTitle: z.string().openapi({
				description: 'Title of the course',
				example: 'Introduction to Computer Science'
			}),
			termCode: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			termName: z.string().openapi({
				description: 'Term and year when the course was taught',
				example: 'FALL'
			}),
			year: z.number().openapi({
				description: 'Year when the course was taught',
				example: 2023
			}),
			creditHours: z.number().openapi({
				description: 'Number of credit hours for the course',
				example: 3
			}),
		}),
		roster: z.array(
			z.object({
				mnumber: z.string().openapi({
					description: 'Unique student identifier',
					example: 'M123456'
				}),
				name: z.string().openapi({
					description: 'Full name of the student',
					example: 'Jane Smith'
				}),
				firstName: z.string().openapi({
					description: 'Student first name',
					example: 'Jane'
				}),
				middleName: z.string().optional().openapi({
					description: 'Student middle name',
					example: 'A'
				}),
				lastName: z.string().openapi({
					description: 'Student last name',
					example: 'Smith'
				}),
				suffix: z.string().optional().openapi({
					description: 'Student suffix (if applicable)',
					example: 'Jr.'
				}),
				email: z.string().email().optional().openapi({
					description: 'Student email address',
					example: 'janesmith@example.com'
				}),
				major: z.string().openapi({
					description: 'Student major',
					example: 'A010'
				}),
				finalGrade: z.string().optional().openapi({
					description: 'Final grade received in the course',
					example: 'A'
				}),
				midtermGrade: z.string().optional().openapi({
					description: 'Midterm grade received in the course',
					example: 'B'
				}),
				registrationStatus: z.string().openapi({
					description: 'Registration status of the student',
					example: 'Registered'
				}),
				instructionalMethods: z.string().openapi({
					description: 'Instructional methods used in the course',
					example: 'Traditional Classroom'
				}),
				lastAttendance: z.string().optional().openapi({
					description: 'Date of last attendance',
					example: '2023-10-01'
				}),
				overallGpa: z.number().openapi({
					description: 'Overall GPA of the student',
					example: 3.8
				}),
				overallEarnedHours: z.number().openapi({
					description: 'Total earned hours for the student',
					example: 60
				}),
			})
		),
		stats: z.object({
			totalStudents: z.number().openapi({
				description: 'Total number of students in the class',
				example: 30
			}),
			totalGraded: z.number().openapi({
				description: 'Total number of students graded',
				example: 25
			}),
			overallGpa: z.number().openapi({
				description: 'Overall GPA of the class',
				example: 3.5
			}),
			gradeDistribution: z.object({
				A: z.number().openapi({
					description: 'Number of students with grade A',
					example: 10
				}),
				B: z.number().openapi({
					description: 'Number of students with grade B',
					example: 8
				}),
				C: z.number().openapi({
					description: 'Number of students with grade C',
					example: 5
				}),
				D: z.number().openapi({
					description: 'Number of students with grade D',
					example: 2
				}),
				F: z.number().openapi({
					description: 'Number of students with grade F',
					example: 5
				}),
			})
		})
	})
})

// Error response schemas
const Error403ResponseSchema = z.object({
	error: z.string().openapi({
		description: 'Error message',
		example: 'Access denied. Insufficient permissions to view this instructor data.'
	})
})
const Error404ResponseSchema = z.object({
	error: z.string().openapi({
		description: 'Error message',
		example: 'Instructor not found'
	})
})
const Error500ResponseSchema = z.object({
	error: z.string().openapi({
		description: 'Error message',
		example: 'Internal server error'
	})
})

export const instructorApiSpec = {
	'/api/instructor': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructors',
			summary: 'Get instructors',
			description: 'Retrieve a list of instructors. Access restricted to authorized users only.',
			responses: {
				'200': {
					description: 'Successful response with instructor data',
					content: {
						'application/json': {
							schema: GetInstructors
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Access denied. Insufficient permissions.'
								})
							})
						}
					}
				},
			},
		}
	},
	'/api/instructor/{mnumber}': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorBasicInfo',
			summary: 'Get basic instructor information',
			description: 'Retrieve basic information for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				path: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with instructor information',
					content: {
						'application/json': {
							schema: InstructorBasicInfo
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/current-status': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCurrentStatus',
			summary: 'Get current teaching status',
			description: 'Retrieve the current teaching status and course load for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				path: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with current status information',
					content: {
						'application/json': {
							schema: CurrentStatus
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/teaching-summary': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorTeachingSummary',
			summary: 'Get teaching summary',
			description: 'Retrieve the teaching summary for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				mnumber: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with teaching summary information',
					content: {
						'application/json': {
							schema: TeachingSummary
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			},
		}
	},
	'/api/instructor/{mnumber}/courses': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCourseDetails',
			summary: 'Get course details',
			description: 'Retrieve course details for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				mnumber: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with course details',
					content: {
						'application/json': {
							schema: GetCourseDetails
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/terms': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorTermSummaries',
			summary: 'Get term summaries',
			description: 'Retrieve term summaries for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				mnumber: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with term summaries',
					content: {
						'application/json': {
							schema: GetTermSummaries
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/class-roster': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorClassRoster',
			summary: 'Get class roster for a specific course',
			description: 'Retrieve the class roster for a specific course taught by an instructor. Access restricted to authorized users only.',
			requestParams: {
				mnumber: MnumberRequestParamsSchema,
				query: RosterQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with class roster information',
					content: {
						'application/json': {
							schema: GetClassRoster
						}
					}
				},
				'403': {
					description: 'Access denied',
					content: {
						'application/json': {
							schema: Error403ResponseSchema
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: Error404ResponseSchema
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: Error500ResponseSchema
						}
					}
				}
			}
		}
	}
};