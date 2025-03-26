import { advisors, colleges, courses, departments, terms } from "../../db/schema";

// Role-specific access definitions
export const roleAccessDefinitions = {
    faculty: {
        advisors: [
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'suffix'
        ],
        colleges: [
            'code',
            'description'
        ],
        courses: [
            'subject',
            'number',
            'suffix',
            'title',
            'hours',
            'fee',
            'web_fee',
            'last_updated',
        ],
        departments: [
            'code',
            'description',
            'prefixes',
            'canvas_id',
            'college'
        ],
        instructor_courses: [
            'instructor_mnumber',
            'term',
            'year',
            'course_subject',
            'course_number',
            'course_suffix',
            'role'
        ],
        registration_status: [
            'code',
            'description'
        ],
        student_academic_info: [
            'mnumber',
            'admit_term',
            'admit_year',
            'admit_code',
            'academic_standing',
            'msu_attempted_hours',
            'msu_earned_hours',
            'msu_quality_points',
            'msu_gpa',
            'overall_attempted_hours',
            'overall_earned_hours',
            'overall_quality_points',
            'overall_gpa'
        ],
        student_advisors: [
            'mnumber',
            'term',
            'year',
            'advisor_id',
        ],
        student_courses: [
            'mnumber',
            'term',
            'year',
            'part_of_term',
            'crn',
            'course_subject',
            'course_number',
            'course_suffix',
            'course_section',
            'course_hours',
            'course_level',
            'registration_status',
            'instructional_method',
            'last_attendance',
            'midterm_grade',
            'final_grade'
        ],
        students: [
            'mnumber',
            'first_name',
            'last_name',
            'middle_name',
            'suffix'
        ],
        terms: [
            'code',
            'description'
        ],
        instructional_methods: [
            'code',
            'description'
        ],
        part_of_term: [
            'code',
            'description'
        ],
    },
    advisor: {
        student_academic_info: [
            'mnumber',
            'admit_term'
        ],
    }
};