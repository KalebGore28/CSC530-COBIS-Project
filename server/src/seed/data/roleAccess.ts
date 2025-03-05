// Role-specific access definitions
export const roleAccessDefinitions = {
    faculty: {
        instructor_courses: ['user_id', 'term', 'year', 'course_subject', 'course_number', 'course_suffix', 'role'],
        student_courses: ['mnumber', 'term', 'year', 'part_of_term', 'crn', 'course_subject', 'course_number', 'course_suffix', 'course_section', 'course_hours', 'course_level', 'registration_status', 'instructional_method', 'last_attendance', 'midterm_grade', 'final_grade'],
        students: ['mnumber', 'first_name', 'last_name', 'middle_name', 'suffix']
    },
    advisor: {
        student_academic_info: ['mnumber', 'admit_term']
    }
};