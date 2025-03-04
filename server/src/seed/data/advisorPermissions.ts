export const advisorPermissions = [
	// Permissions for student_academic_info table:
	{
		table_name: 'student_academic_info',
		column_name: 'mnumber',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.mnumber'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'admit_term',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.admit_term'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'admit_year',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.admit_year'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'admit_code',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.admit_code'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'academic_standing',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.academic_standing'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'msu_attempted_hours',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.msu_attempted_hours'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'msu_earned_hours',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.msu_earned_hours'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'msu_quality_points',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.msu_quality_points'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'overall_attempted_hours',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.overall_attempted_hours'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'overall_earned_hours',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.overall_earned_hours'
	},
	{
		table_name: 'student_academic_info',
		column_name: 'overall_quality_points',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_academic_info.overall_quality_points'
	},
	// Permissions for student_advisors table:
	{
		table_name: 'student_advisors',
		column_name: 'mnumber',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_advisors.mnumber'
	},
	{
		table_name: 'student_advisors',
		column_name: 'term',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_advisors.term'
	},
	{
		table_name: 'student_advisors',
		column_name: 'year',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_advisors.year'
	},
	{
		table_name: 'student_advisors',
		column_name: 'advisor_id',
		can_read: true,
		can_write: false,
		description: 'Advisor permission to view student_advisors.advisor_id'
	},

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