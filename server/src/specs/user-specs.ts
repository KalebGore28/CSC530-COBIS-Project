import { z } from 'zod';
import 'zod-openapi/extend';

// Schema for the current user response
const CurrentUserResponse = z.object({
	id: z.string().openapi({
		description: 'User ID',
		example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
	}),
	user: z.object({
		id: z.string().openapi({
			description: 'User ID',
			example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
		}),
		name: z.string().openapi({
			description: 'User name',
			example: 'John Doe'
		}),
		email: z.string().email().openapi({
			description: 'User email',
			example: 'john.doe@example.edu'
		}),
		emailVerified: z.boolean().openapi({
			description: 'Whether the email is verified',
			example: true
		}),
		image: z.string().nullable().optional().openapi({
			description: 'User profile image URL',
			example: 'https://example.com/profile.jpg'
		}),
		createdAt: z.string().openapi({
			description: 'User creation timestamp',
			example: '2023-01-01T00:00:00.000Z'
		}),
		updatedAt: z.string().openapi({
			description: 'User last update timestamp',
			example: '2023-01-01T00:00:00.000Z'
		})
	}).openapi({
		description: 'User information'
	}),
	roles: z.array(
		z.object({
			role_id: z.number().openapi({
				description: 'Role ID',
				example: 1
			}),
			role_name: z.string().openapi({
				description: 'Role name',
				example: 'faculty'
			})
		})
	).openapi({
		description: 'User roles'
	}),
	permissions: z.array(
		z.object({
			table_name: z.string().openapi({
				description: 'Table name',
				example: 'students'
			}),
			column_name: z.string().openapi({
				description: 'Column name',
				example: 'mnumber'
			})
		})
	).openapi({
		description: 'User permissions'
	}),
	department: z.string().nullable().openapi({
		description: 'User department',
		example: 'CSC'
	}),
	college: z.string().nullable().openapi({
		description: 'User college',
		example: 'SCI'
	}),
	mnumber: z.string().nullable().openapi({
		description: 'User M-number',
		example: 'M12345678'
	}),
	isEnabled: z.boolean().nullable().openapi({
		description: 'Whether the user is enabled',
		example: true
	})
}).nullable().openapi({
	description: 'Current user information or null if not authenticated'
});

// Schema for updating M-number request
const UpdateMnumberRequest = z.object({
	mnumber: z.string().openapi({
		description: 'The M-number to update',
		example: 'M12345678'
	})
});

// Schema for updating M-number response
const UpdateMnumberResponse = z.object({
	success: z.boolean().openapi({
		description: 'Whether the operation was successful',
		example: true
	}),
	message: z.string().openapi({
		description: 'Message describing the result',
		example: 'M-number updated successfully'
	})
});

// Add these new schemas after the existing ones
const EnableDisableUserResponse = z.object({
	success: z.boolean().openapi({
		description: 'Whether the operation was successful',
		example: true
	}),
	message: z.string().openapi({
		description: 'Message describing the result',
		example: 'User enabled successfully'
	})
});

export const UserAPISpecs = {
	'/api/user/me': {
		get: {
			tags: ['User'],
			operationId: 'getCurrentUser',
			summary: 'Get current user',
			description: 'Retrieve information about the currently authenticated user.',
			responses: {
				'200': {
					description: 'Successful response with user data or null if not authenticated',
					content: {
						'application/json': {
							schema: CurrentUserResponse
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Internal server error'
								})
							})
						}
					}
				}
			}
		}
	},
	'/api/user/update-mnumber': {
		post: {
			tags: ['User'],
			operationId: 'updateMnumber',
			summary: 'Update user M-number',
			description: 'Update the current user\'s M-number. Can only be done once per user.',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: UpdateMnumberRequest
					}
				}
			},
			responses: {
				'200': {
					description: 'M-number updated successfully',
					content: {
						'application/json': {
							schema: UpdateMnumberResponse
						}
					}
				},
				'400': {
					description: 'Invalid request',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									description: 'Operation status',
									example: false
								}),
								message: z.string().openapi({
									description: 'Error message',
									example: 'M-number is required and must be a string'
								})
							})
						}
					}
				},
				'403': {
					description: 'Forbidden - User already has an M-number',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									description: 'Operation status',
									example: false
								}),
								message: z.string().openapi({
									description: 'Error message',
									example: 'Cannot change M-number. Contact admin to change.'
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
									description: 'Operation status',
									example: false
								}),
								message: z.string().openapi({
									description: 'Error message',
									example: 'User not found'
								})
							})
						}
					}
				},
				'409': {
					description: 'Conflict - M-number already taken',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									description: 'Operation status',
									example: false
								}),
								message: z.string().openapi({
									description: 'Error message',
									example: 'M-number already taken. If this is yours, contact admin to fix.'
								})
							})
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean().openapi({
									description: 'Operation status',
									example: false
								}),
								message: z.string().openapi({
									description: 'Error message',
									example: 'An error occurred while updating your M-number'
								})
							})
						}
					}
				}
			}
		}
	},
	'/api/user/enable/{userId}': {
		post: {
			tags: ['User'],
			operationId: 'enableUser',
			summary: 'Enable a user',
			description: 'Enable a user account by their ID. Requires admin privileges.',
			parameters: [{
				name: 'userId',
				in: 'path',
				required: true,
				schema: z.string().openapi({
					description: 'The ID of the user to enable',
					example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
				})
			}],
			responses: {
				'200': {
					description: 'User enabled successfully',
					content: {
						'application/json': {
							schema: EnableDisableUserResponse
						}
					}
				},
				'403': {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string()
							})
						}
					}
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/user/disable/{userId}': {
		post: {
			tags: ['User'],
			operationId: 'disableUser',
			summary: 'Disable a user',
			description: 'Disable a user account by their ID. Requires admin privileges.',
			parameters: [{
				name: 'userId',
				in: 'path',
				required: true,
				schema: z.string().openapi({
					description: 'The ID of the user to disable',
					example: 'user_2XQo9jk8JtYmIi3qSEoRYgVpnGn'
				})
			}],
			responses: {
				'200': {
					description: 'User disabled successfully',
					content: {
						'application/json': {
							schema: EnableDisableUserResponse
						}
					}
				},
				'403': {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string()
							})
						}
					}
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: z.object({
								success: z.boolean(),
								message: z.string()
							})
						}
					}
				}
			}
		}
	}
};

export const UserSpecs = {
	CurrentUserResponse,
	UpdateMnumberRequest,
	UpdateMnumberResponse
}; 