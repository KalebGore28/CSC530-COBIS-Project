export const advisorPermissions = [
	// Permissions for students table:
	{
		table_name: 'students',
		column_name: 'mnumber',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view students.mnumber'
	},
	{
		table_name: 'students',
		column_name: 'first_name',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view students.first_name'
	},
	{
		table_name: 'students',
		column_name: 'last_name',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view students.last_name'
	},
	{
		table_name: 'students',
		column_name: 'middle_name',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view students.middle_name'
	}
]