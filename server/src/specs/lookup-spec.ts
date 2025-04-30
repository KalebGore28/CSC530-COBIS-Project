import { z } from 'zod';
import 'zod-openapi/extend';

export const LookupAPISpecs = {
	'/api/lookup/departments': {
		get: {
			tags: ['Lookup'],
			operationId: 'getDepartments',
			summary: 'Get all departments',
			description: 'Fetches a list of all departments from the database.',
			responses: {
				'200': {
					description: 'A list of departments',
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									code: z.string().openapi({
										description: 'The department code',
										example: '0000',
									}),
									description: z.string().openapi({
										description: 'The department description',
										example: 'Unassigned',
									}),
								})
							)
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
									example: 'Internal server error',
								}),
							})
						}
					}
				}
			},
		}
	},
	'/api/lookup/colleges': {
		get: {
			tags: ['Lookup'],
			operationId: 'getColleges',
			summary: 'Get all colleges',
			description: 'Fetches a list of all colleges from the database.',
			responses: {
				'200': {
					description: 'A list of colleges',
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									code: z.string().openapi({
										description: 'The college code',
										example: '0',
									}),
									description: z.string().openapi({
										description: 'The college description',
										example: 'Unassigned',
									}),
								})
							)
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
									example: 'Internal server error',
								}),
							})
						}
					}
				}
			}
		}
	},
	'/api/lookup/roles': {
		get: {
			tags: ['Lookup'],
			operationId: 'getRoles',
			summary: 'Get all roles',
			description: 'Fetches a list of all roles from the database.',
			responses: {
				'200': {
					description: 'A list of roles',
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									code: z.string().openapi({
										description: 'The role code',
										example: '0',
									}),
									description: z.string().openapi({
										description: 'The role description',
										example: 'Unassigned',
									}),
								})
							)
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
									example: 'Internal server error',
								}),
							})
						}
					}
				}
			}
		}
	}
}