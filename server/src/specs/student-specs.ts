import { z } from 'zod';
import 'zod-openapi/extend';

// Common schema for Mnumber parameter
const MnumberRequestParamsSchema = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	})
});

// Query parameters for student listing
const StudentsQuerySchema = z.object({
	department: z.string().optional().openapi({
		description: 'Department code to filter students by',
		example: 'CSC'
	}),
	program: z.string().optional().openapi({
		description: 'Program code to filter students by',
		example: 'CSBS'
	}),
	term: z.string().optional().openapi({
		description: 'Term code to filter students by',
		example: '10'
	}),
	year: z.string().optional().openapi({
		description: 'Year to filter students by',
		example: '2023'
	}),
	search: z.string().optional().openapi({
		description: 'Search query to find students by name, ID, or email',
		example: 'Smith'
	}),
	page: z.string().optional().openapi({
		description: 'Page number for pagination',
		example: '1'
	}),
	limit: z.string().optional().openapi({
		description: 'Number of results per page',
		example: '20'
	})
});

// Student list response schema
const GetStudentsResponse = z.object({
	students: z.array(
		z.object({
			mnumber: z.string().openapi({
				description: 'Unique student identifier',
				example: 'M123456'
			}),
			firstName: z.string().openapi({
				description: 'Student first name',
				example: 'John'
			}),
			lastName: z.string().openapi({
				description: 'Student last name',
				example: 'Smith'
			}),
			email: z.string().email().openapi({
				description: 'Student email address',
				example: 'john.smith@example.edu'
			}),
			overallGpa: z.number().nullable().openapi({
				description: 'Overall GPA',
				example: 3.75
			}),
			academicStanding: z.string().nullable().openapi({
				description: 'Academic standing code',
				example: 'GS'
			}),
			earnedHours: z.number().nullable().openapi({
				description: 'Total earned credit hours',
				example: 90
			}),
			standingDescription: z.string().nullable().openapi({
				description: 'Academic standing description',
				example: 'Good Standing'
			}),
			programs: z.array(
				z.object({
					programCode: z.string().openapi({
						description: 'Program code',
						example: 'CSBS'
					}),
					programDescription: z.string().openapi({
						description: 'Program description',
						example: 'Computer Science, BS'
					}),
					departmentCode: z.string().openapi({
						description: 'Department code',
						example: 'CSC'
					}),
					departmentDescription: z.string().openapi({
						description: 'Department description',
						example: 'Computer Science'
					}),
					type: z.string().openapi({
						description: 'Program type (MAJOR/MINOR)',
						example: 'MAJOR'
					}),
					term: z.string().openapi({
						description: 'Term code',
						example: '10'
					}),
					year: z.number().openapi({
						description: 'Year',
						example: 2023
					}),
					termDescription: z.string().optional().openapi({
						description: 'Term description',
						example: 'Spring 2023'
					})
				})
			).openapi({
				description: 'List of student programs',
			})
		})
	).openapi({
		description: 'List of students matching the criteria',
	}),
	pagination: z.object({
		page: z.number().openapi({
			description: 'Current page number',
			example: 1
		}),
		limit: z.number().openapi({
			description: 'Number of results per page',
			example: 20
		}),
		totalItems: z.number().openapi({
			description: 'Total number of items',
			example: 150
		}),
		totalPages: z.number().openapi({
			description: 'Total number of pages',
			example: 8
		})
	}).openapi({
		description: 'Pagination information',
	})
});

// Student information response schema
const GetStudentResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	firstName: z.string().openapi({
		description: 'Student first name',
		example: 'John'
	}),
	lastName: z.string().openapi({
		description: 'Student last name',
		example: 'Smith'
	}),
	email: z.string().email().openapi({
		description: 'Student email address',
		example: 'john.smith@example.edu'
	}),
	phone: z.string().nullable().openapi({
		description: 'Student phone number',
		example: '555-123-4567'
	}),
	dateOfBirth: z.string().nullable().openapi({
		description: 'Student date of birth',
		example: '1999-05-15'
	}),
	gender: z.string().nullable().openapi({
		description: 'Student gender',
		example: 'M'
	}),
	address: z.object({
		line1: z.string().nullable().openapi({
			description: 'Address line 1',
			example: '123 University Ave'
		}),
		line2: z.string().nullable().openapi({
			description: 'Address line 2',
			example: 'Apt 456'
		}),
		city: z.string().nullable().openapi({
			description: 'City',
			example: 'College Town'
		}),
		state: z.string().nullable().openapi({
			description: 'State code',
			example: 'KY'
		}),
		zip: z.string().nullable().openapi({
			description: 'ZIP/Postal code',
			example: '40506'
		}),
		country: z.string().nullable().openapi({
			description: 'Country',
			example: 'USA'
		})
	}).nullable().openapi({
		description: 'Student address information'
	}),
	programs: z.array(
		z.object({
			programCode: z.string().openapi({
				description: 'Program code',
				example: 'CSBS'
			}),
			programDescription: z.string().openapi({
				description: 'Program description',
				example: 'Computer Science, BS'
			}),
			departmentCode: z.string().openapi({
				description: 'Department code',
				example: 'CSC'
			}),
			departmentDescription: z.string().openapi({
				description: 'Department description',
				example: 'Computer Science'
			}),
			collegeCode: z.string().openapi({
				description: 'College code',
				example: 'AS'
			}),
			collegeDescription: z.string().openapi({
				description: 'College description',
				example: 'College of Arts & Sciences'
			}),
			type: z.string().openapi({
				description: 'Program type (MAJOR/MINOR)',
				example: 'MAJOR'
			}),
			term: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			year: z.number().openapi({
				description: 'Year',
				example: 2023
			}),
			termDescription: z.string().openapi({
				description: 'Term description',
				example: 'Spring 2023'
			})
		})
	).openapi({
		description: 'List of student programs',
	}),
	academicInfo: z.object({
		overallGpa: z.number().nullable().openapi({
			description: 'Overall GPA',
			example: 3.75
		}),
		msuGpa: z.number().nullable().openapi({
			description: 'MSU GPA',
			example: 3.8
		}),
		earnedHours: z.number().nullable().openapi({
			description: 'Total earned credit hours',
			example: 90
		}),
		academicStanding: z.string().nullable().openapi({
			description: 'Academic standing code',
			example: 'GS'
		}),
		standingDescription: z.string().nullable().openapi({
			description: 'Academic standing description',
			example: 'Good Standing'
		}),
		classification: z.string().nullable().openapi({
			description: 'Student classification',
			example: 'Junior'
		})
	}).nullable().openapi({
		description: 'Student academic information'
	})
});

// Enrollment status response schema
const EnrollmentStatusResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	currentTerm: z.object({
		code: z.string().openapi({
			description: 'Current term code',
			example: '10'
		}),
		description: z.string().openapi({
			description: 'Current term description',
			example: 'Spring 2023'
		}),
		year: z.number().openapi({
			description: 'Current term year',
			example: 2023
		})
	}).openapi({
		description: 'Current term information'
	}),
	enrollmentStatus: z.string().openapi({
		description: 'Current enrollment status',
		example: 'Enrolled'
	}),
	registrationHold: z.boolean().openapi({
		description: 'Whether student has a registration hold',
		example: false
	}),
	totalEnrolledCredits: z.number().openapi({
		description: 'Total credits enrolled in current term',
		example: 15
	}),
	enrolledCourses: z.array(
		z.object({
			courseId: z.string().openapi({
				description: 'Course ID',
				example: 'CSC 530'
			}),
			courseTitle: z.string().openapi({
				description: 'Course title',
				example: 'Software Engineering'
			}),
			crn: z.string().openapi({
				description: 'Course registration number',
				example: '12345'
			}),
			credits: z.number().openapi({
				description: 'Credit hours',
				example: 3
			}),
			instructorName: z.string().nullable().openapi({
				description: 'Instructor name',
				example: 'Dr. Jane Doe'
			})
		})
	).openapi({
		description: 'Courses student is currently enrolled in'
	})
});

// Academic summary response schema
const AcademicSummaryResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	gpa: z.object({
		overall: z.number().openapi({
			description: 'Overall GPA',
			example: 3.75
		}),
		msu: z.number().openapi({
			description: 'MSU GPA',
			example: 3.8
		})
	}).openapi({
		description: 'GPA information'
	}),
	credits: z.object({
		attempted: z.number().openapi({
			description: 'Total credits attempted',
			example: 95
		}),
		earned: z.number().openapi({
			description: 'Total credits earned',
			example: 90
		}),
		gradePoints: z.number().openapi({
			description: 'Total grade points',
			example: 337.5
		})
	}).openapi({
		description: 'Credit information'
	}),
	academicStanding: z.object({
		code: z.string().openapi({
			description: 'Academic standing code',
			example: 'GS'
		}),
		description: z.string().openapi({
			description: 'Academic standing description',
			example: 'Good Standing'
		})
	}).openapi({
		description: 'Academic standing information'
	}),
	classification: z.string().openapi({
		description: 'Student classification',
		example: 'Junior'
	})
});

// Advisors response schema
const AdvisorsResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	advisors: z.array(
		z.object({
			mnumber: z.string().openapi({
				description: 'Advisor M-number',
				example: 'M654321'
			}),
			firstName: z.string().openapi({
				description: 'Advisor first name',
				example: 'Jane'
			}),
			lastName: z.string().openapi({
				description: 'Advisor last name',
				example: 'Doe'
			}),
			email: z.string().email().openapi({
				description: 'Advisor email',
				example: 'jane.doe@example.edu'
			}),
			department: z.string().openapi({
				description: 'Advisor department',
				example: 'Computer Science'
			}),
			office: z.string().nullable().openapi({
				description: 'Advisor office location',
				example: 'Science Building 301'
			}),
			phone: z.string().nullable().openapi({
				description: 'Advisor phone',
				example: '555-987-6543'
			})
		})
	).openapi({
		description: 'List of student advisors'
	})
});

// GPA trend response schema
const GpaTrendResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	gpaTrend: z.array(
		z.object({
			term: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			termDescription: z.string().openapi({
				description: 'Term description',
				example: 'Spring 2022'
			}),
			year: z.number().openapi({
				description: 'Year',
				example: 2022
			}),
			gpa: z.number().openapi({
				description: 'Term GPA',
				example: 3.8
			}),
			cumulativeGpa: z.number().openapi({
				description: 'Cumulative GPA as of this term',
				example: 3.75
			}),
			creditsAttempted: z.number().openapi({
				description: 'Credits attempted this term',
				example: 15
			}),
			creditsEarned: z.number().openapi({
				description: 'Credits earned this term',
				example: 15
			})
		})
	).openapi({
		description: 'GPA trend data by term'
	})
});

// Performance metrics response schema
const PerformanceMetricsResponse = z.object({
	department: z.string().optional().openapi({
		description: 'Department code (if filtered by department)',
		example: 'CSC'
	}),
	program: z.string().optional().openapi({
		description: 'Program code (if filtered by program)',
		example: 'CSBS'
	}),
	term: z.string().optional().openapi({
		description: 'Term code (if filtered by term)',
		example: '10'
	}),
	year: z.number().optional().openapi({
		description: 'Year (if filtered by year)',
		example: 2023
	}),
	metrics: z.object({
		averageGpa: z.number().openapi({
			description: 'Average GPA',
			example: 3.2
		}),
		medianGpa: z.number().openapi({
			description: 'Median GPA',
			example: 3.3
		}),
		gpaDistribution: z.array(
			z.object({
				range: z.string().openapi({
					description: 'GPA range',
					example: '3.5-4.0'
				}),
				count: z.number().openapi({
					description: 'Number of students in this range',
					example: 45
				}),
				percentage: z.number().openapi({
					description: 'Percentage of students in this range',
					example: 30
				})
			})
		).openapi({
			description: 'GPA distribution by range'
		}),
		standingDistribution: z.array(
			z.object({
				standing: z.string().openapi({
					description: 'Academic standing description',
					example: 'Good Standing'
				}),
				count: z.number().openapi({
					description: 'Number of students with this standing',
					example: 120
				}),
				percentage: z.number().openapi({
					description: 'Percentage of students with this standing',
					example: 80
				})
			})
		).openapi({
			description: 'Academic standing distribution'
		}),
		totalStudents: z.number().openapi({
			description: 'Total students included in metrics',
			example: 150
		})
	}).openapi({
		description: 'Performance metrics data'
	})
});

// Student enrollment history response schema
const EnrollmentHistoryResponse = z.object({
	mnumber: z.string().openapi({
		description: 'Unique student identifier',
		example: 'M123456'
	}),
	enrollmentHistory: z.array(
		z.object({
			term: z.string().openapi({
				description: 'Term code',
				example: '10'
			}),
			termDescription: z.string().openapi({
				description: 'Term description',
				example: 'Spring 2022'
			}),
			year: z.number().openapi({
				description: 'Year',
				example: 2022
			}),
			courses: z.array(
				z.object({
					subject: z.string().openapi({
						description: 'Course subject',
						example: 'CSC'
					}),
					number: z.string().openapi({
						description: 'Course number',
						example: '530'
					}),
					title: z.string().openapi({
						description: 'Course title',
						example: 'Software Engineering'
					}),
					crn: z.string().openapi({
						description: 'Course registration number',
						example: '12345'
					}),
					credits: z.number().openapi({
						description: 'Credit hours',
						example: 3
					}),
					grade: z.string().nullable().openapi({
						description: 'Course grade',
						example: 'A'
					}),
					instructor: z.string().nullable().openapi({
						description: 'Instructor name',
						example: 'Dr. Jane Doe'
					})
				})
			).openapi({
				description: 'Courses taken in this term'
			}),
			totalCredits: z.number().openapi({
				description: 'Total credits for term',
				example: 15
			}),
			termGpa: z.number().nullable().openapi({
				description: 'Term GPA',
				example: 3.8
			})
		})
	).openapi({
		description: 'Enrollment history by term'
	})
});

export const StudentAPISpecs = {
	'/api/student': {
		get: {
			tags: ['Student'],
			operationId: 'getStudents',
			summary: 'Get students',
			description: 'Retrieve a list of students. Access restricted to authorized users only.',
			responses: {
				'200': {
					description: 'Successful response with student data',
					content: {
						'application/json': {
							schema: GetStudentsResponse
						}
					}
				}
			}

		}
	},
	'/api/student/{mnumber}': {
		get: {
			tags: ['Student'],
			operationId: 'getStudent',
			summary: 'Get student details',
			description: 'Retrieve detailed information for a specific student. Access restricted to authorized users only.',
			requestParams: {
				path: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with student data',
					content: {
						'application/json': {
							schema: GetStudentResponse
						}
					}
				}
			}

		}
	}
};
