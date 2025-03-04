export const facultyPermissions = [
	// Permissions for instructor_courses table:
	{
		table_name: 'instructor_courses',
		column_name: 'user_id',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.user_id'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'term',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.term'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'year',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.year'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'course_subject',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.course_subject'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'course_number',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.course_number'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'course_suffix',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.course_suffix'
	},
	{
		table_name: 'instructor_courses',
		column_name: 'role',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view instructor_courses.role'
	},
	// Permissions for courses table:
	{
		table_name: 'courses',
		column_name: 'subject',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.subject'
	},
	{
		table_name: 'courses',
		column_name: 'number',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.number'
	},
	{
		table_name: 'courses',
		column_name: 'suffix',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.suffix'
	},
	{
		table_name: 'courses',
		column_name: 'title',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.title'
	},
	{
		table_name: 'courses',
		column_name: 'hours',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.hours'
	},
	{
		table_name: 'courses',
		column_name: 'fee',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.fee'
	},
	{
		table_name: 'courses',
		column_name: 'web_fee',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.web_fee'
	},
	{
		table_name: 'courses',
		column_name: 'last_updated',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view courses.last_updated'
	},
	// Permissions for student_courses table:
	{
		table_name: 'student_courses',
		column_name: 'mnumber',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.mnumber'
	},
	{
		table_name: 'student_courses',
		column_name: 'term',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.term'
	},
	{
		table_name: 'student_courses',
		column_name: 'year',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.year'
	},
	{
		table_name: 'student_courses',
		column_name: 'crn',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.crn'
	},
	{
		table_name: 'student_courses',
		column_name: 'course_subject',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.course_subject'
	},
	{
		table_name: 'student_courses',
		column_name: 'course_number',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.course_number'
	},
	{
		table_name: 'student_courses',
		column_name: 'course_suffix',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.course_suffix'
	},
	{
		table_name: 'student_courses',
		column_name: 'course_section',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.course_section'
	},
	{
		table_name: 'student_courses',
		column_name: 'course_hours',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.course_hours'
	},
	{
		table_name: 'student_courses',
		column_name: 'registration_status',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.registration_status'
	},
	{
		table_name: 'student_courses',
		column_name: 'instructional_method',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.instructional_method'
	},
	{
		table_name: 'student_courses',
		column_name: 'last_attendance',
		can_read: true,
		can_write: false,
		description: 'Faculty permission to view student_courses.last_attendance'
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