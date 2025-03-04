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
		}
	],
	student_courses: [
		{
			relatedTable: "students",
			on: {
				"student_courses.mnumber": "mnumber"
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