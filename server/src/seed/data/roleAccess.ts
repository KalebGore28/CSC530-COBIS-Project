// Role-specific access definitions
export const roleAccessDefinitions = {
    faculty: {
        instructor_courses: ['user_id', 'term', 'course_subject', 'course_number'],
        student_courses: ['mnumber', 'term'],
        students: ['mnumber', 'first_name']
    },
    advisor: {
        student_academic_info: ['mnumber', 'admit_term']
    }
};