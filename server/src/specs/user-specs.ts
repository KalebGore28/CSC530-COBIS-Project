import { z } from 'zod';
import 'zod-openapi/extend';


export const UserAPISpecs = {
	'/api/user/me': {
		get: {
			tags: ['User'],
			operationId: 'getCurrentUser',
			summary: 'Get current user',
			description: 'Retrieve information about the currently authenticated user.',
			responses: {
				'200': {
					description: 'User enabled successfully',
					content: {
						'application/json': {
							schema: z.object({
								roles: z.array(z.string()),
								department: z.string(),
								college: z.string(),
								mnumber: z.string(),
								isEnabled: z.boolean()
							})
						}
					}
				}
			}
		}
	},
	'/api/user': {
		get: {
			tags: ['User'],
			operationId: 'getAllUsers',
			summary: 'Get all users',
			description: 'Retrieve a list of all users, with optional filters. Requires admin privileges.',
			requestQuery: {
				query: z.object({
					isEnabled: z.boolean().optional().openapi({
						description: 'Filter users by their enabled status.',
						example: true // Example for the boolean value
					}),
					college: z.string().optional().openapi({
						description: 'Filter users by college.',
						example: 'College of Engineering'
					}),
					department: z.string().optional().openapi({
						description: 'Filter users by department.',
						example: 'Computer Science'
					}),
					name: z.string().optional().openapi({
						description: 'Filter users by name (case-insensitive partial match).',
						example: 'Jane Doe'
					}),
					email: z.string().email().optional().openapi({ // Added .email() for validation
						description: 'Filter users by email address.',
						example: 'jane.doe@example.com'
					}),
					mnumber: z.string().optional().openapi({
						description: 'Filter users by M-Number.',
						example: 'M00123456'
					})
				})
			},
			responses: {
				'200': {
					description: 'Successfully retrieved list of users.',
					content: {
						'application/json': {
							// Define the schema for the array of users directly here
							schema: z.array(
								z.object({
									// Assuming a user object typically has an ID
									id: z.string().openapi({ description: 'Unique user identifier', example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn' }),
									roles: z.array(z.string()).openapi({ description: 'Roles assigned to the user', example: ['student', 'researcher'] }),
									department: z.string().nullable().openapi({ description: 'User\'s department', example: 'Computer Science' }),
									college: z.string().nullable().openapi({ description: 'User\'s college', example: 'College of Engineering' }),
									mnumber: z.string().nullable().openapi({ description: 'User\'s M-Number', example: 'M00123456' }),
									// Include fields from filters that are likely part of the user object
									name: z.string().nullable().openapi({ description: 'User\'s full name', example: 'Jane Doe' }),
									email: z.string().email().nullable().openapi({ description: 'User\'s email address', example: 'jane.doe@example.com' }),
									isEnabled: z.boolean().openapi({ description: 'Indicates if the user account is enabled' })
								})
							)
						}
					}
				},
				// Document the Forbidden status due to the hasRole middleware
				'403': {
					description: 'Forbidden. User does not have admin privileges.',
					content: {
						'application/json': {
							// Define the error schema directly here
							schema: z.object({
								success: z.boolean().openapi({ example: false }),
								message: z.string().openapi({ example: 'Forbidden: Insufficient privileges' })
							})
						}
					}
				},
				'500': {
					description: 'An error occurred while fetching users.',
					content: {
						'application/json': {
							// Define the error schema directly here
							schema: z.object({
								success: z.boolean().openapi({ example: false }),
								message: z.string().openapi({ example: 'An error occurred while fetching users' })
							})
						}
					}
				}
			}
		}
	},
	'/api/user/{userId}/enable': {
		post: {
			tags: ['User'],
			operationId: 'enableUser',
			summary: 'Enable a user',
			description: 'Enable a user account by their ID. Requires admin privileges.',
			requestParam: z.object({
				query: z.string().openapi({
					example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
				})
			}),
			responses: {
				'200': {
					description: 'User enabled successfully',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string().openapi({
									example: 'User enabled successfully'
								})
							})
						}
					}
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									example: false
								}),
								message: z.string().openapi({
									example: 'User not found'
								})
							})
						}
					}
				},
				'500': {
					description: 'An error occurred while enabling the user',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									example: false
								}),
								message: z.string().openapi({
									example: 'An error occurred while enabling the user'
								})
							})
						}
					}
				}
			}
		},
	},
	'/api/user/{userId}/disable': {
		post: {
			tags: ['User'],
			operationId: 'disableUser',
			summary: 'Disable a user',
			description: 'Disable a user account by their ID. Requires admin privileges.',
			requestParam: z.object({
				query: z.string().openapi({
					example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
				})
			}),
			responses: {
				'200': {
					description: 'User disabled successfully',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string().openapi({
									example: 'User disabled successfully'
								})
							})
						}
					}
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									example: false
								}),
								message: z.string().openapi({
									example: 'User not found'
								})
							})
						}
					}
				},
				'500': {
					description: 'An error occurred while disabling the user',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									example: false
								}),
								message: z.string().openapi({
									example: 'An error occurred while disabling the user'
								})
							})
						}
					}
				}
			}
		}
	},

}