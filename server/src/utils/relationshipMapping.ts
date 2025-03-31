/**
 * This contains the mapping of relationships between tables in the database.
 * The relationships are used for the frontend to determine how to join tables together.
 */
export const relationshipsMapping: Record<string, Array<{ relatedTable: string; on: Record<string, string> }>> = {
	instructor_courses: [
		{
			relatedTable: "student_courses",
			on: {
				"instructor_courses.term": "term",
				"instructor_courses.year": "year",
				"instructor_courses.course_subject": "course_subject",
				"instructor_courses.course_number": "course_number",
				"instructor_courses.course_suffix": "course_suffix"
			}
		},
		{
			relatedTable: "courses",
			on: {
				"instructor_courses.course_subject": "subject",
				"instructor_courses.course_number": "number",
				"instructor_courses.course_suffix": "suffix"
			}
		},
		{
			relatedTable: "users",
			on: {
				"instructor_courses.user_id": "id"
			}
		}
	],
	student_courses: [
		{
			relatedTable: "students",
			on: {
				"student_courses.mnumber": "mnumber"
			}
		},
		{
			relatedTable: "courses",
			on: {
				"student_courses.course_subject": "subject",
				"student_courses.course_number": "number",
				"student_courses.course_suffix": "suffix"
			}
		},
		{
			relatedTable: "part_of_term",
			on: {
				"student_courses.part_of_term": "code"
			}
		},
		{
			relatedTable: "terms",
			on: {
				"student_courses.term": "code"
			}
		},
		{
			relatedTable: "instructional_methods",
			on: {
				"student_courses.instructional_method": "code"
			}
		},
		{
			relatedTable: "registration_status",
			on: {
				"student_courses.registration_status": "code"
			}
		}
	],
	students: [
		{
			relatedTable: "student_courses",
			on: {
				"students.mnumber": "mnumber"
			}
		}
	]
};