import { z } from 'zod';
import 'zod-openapi/extend'; // Ensures .openapi() extension is available
import { getAdvisedStudentsQuerySchema } from '../controllers/advisor-controller';

/**
 * Schema for a single student object returned in the response.
 * Matches the fields selected in AdvisorService.getAdvisedStudents.
 */
const StudentSchema = z.object({
    mnumber: z.string().openapi({
        description: "Student's unique M-Number identifier",
        example: 'M00123456'
    }),
    firstName: z.string().openapi({
        description: "Student's first name",
        example: 'Jane'
    }),
    middleName: z.string().openapi({
        description: "Student's middle name",
        example: 'Marie'
    }),
    lastName: z.string().openapi({
        description: "Student's last name",
        example: 'Doe'
    }),
    suffix: z.string().nullable().openapi({ // Assuming suffix can be null or empty
        description: "Student's suffix (e.g., Jr., Sr., III)",
        example: null
    }),
    gender: z.string().openapi({
        description: "Student's gender",
        example: 'F'
    }),
    birthdate: z.string().openapi({ // Assuming birthdate is stored/returned as a string
        description: "Student's date of birth (YYYY-MM-DD or other format)",
        example: '2003-05-15'
    }),
    citizenship: z.string().openapi({
        description: "Student's citizenship status code or description",
        example: 'US'
    }),
    raceCode: z.string().openapi({
        description: "Student's race code",
        example: 'W'
    }),
    raceDescription: z.string().openapi({
        description: "Student's race description",
        example: 'White'
    }),
    residencyCode: z.string().openapi({
        description: "Student's residency code",
        example: 'I' // Example: In-state
    }),
    residencyDescription: z.string().openapi({
        description: "Student's residency description",
        example: 'In State'
    }),
    age: z.number().int().openapi({
        description: "Student's age",
        example: 21
    }),
    cellPhone: z.string().nullable().openapi({ // Assuming phone might be optional/null
        description: "Student's cell phone number",
        example: '555-123-4567'
    }),
    email: z.string().email().openapi({
        description: "Student's email address",
        example: 'jane.doe@example.edu'
    })
    // Add term/year here if you decide to select them in the service query
    // term: z.string().optional().openapi({...}),
    // year: z.number().int().optional().openapi({...}),
})

/**
 * Schema for the overall response of the GET /api/advisor/students endpoint.
 * Returns an array of student objects.
 */
const AdvisedStudentsResponseSchema = z.array(StudentSchema)

// --- Error Schemas (Common errors) ---

const ErrorResponseSchema = z.object({
    error: z.string().openapi({ description: 'Description of the error' })
})

// --- API Endpoint Specification ---

/**
 * OpenAPI specifications for the Advisor API endpoints.
 */
export const AdvisorAPISpecs = {
    '/api/advisor/students': {
        get: {
            tags: ['Advisor'], // Group this endpoint under 'Advisor' in OpenAPI UI
            operationId: 'getAdvisedStudents',
            summary: 'Get students advised by the current user',
            description: 'Retrieves a list of students currently assigned to the logged-in advisor. Requires authentication and advisor privileges. Can be filtered by term and year.',
            security: [
                { bearerAuth: [] } // Assuming Bearer token authentication
            ],
            requestParams: {
                query: getAdvisedStudentsQuerySchema // Reference the query schema
            },
            responses: {
                '200': {
                    description: 'Successful response containing the list of advised students.',
                    content: {
                        'application/json': {
                            schema: AdvisedStudentsResponseSchema // Reference the response schema
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: ErrorResponseSchema
                        }
                    }
                },
                '403': {
                    description: 'Forbidden. User does not have sufficient permissions (e.g., not an advisor).',
                    content: {
                        'application/json': {
                            schema: ErrorResponseSchema
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An unexpected error occurred on the server.',
                     content: {
                        'application/json': {
                            schema: ErrorResponseSchema
                        }
                    }
                }
                // Add other potential status codes like 400 Bad Request if needed
            }
        }
    }
    // Add specifications for other advisor endpoints here
};