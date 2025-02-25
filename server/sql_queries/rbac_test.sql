SELECT s.mnumber, s.first_name, s.last_name, sa.msu_gpa, sa.overall_gpa, sc.final_grade
FROM students s
LEFT JOIN student_academic_info sa ON s.mnumber = sa.mnumber
LEFT JOIN student_courses sc ON s.mnumber = sc.mnumber
WHERE EXISTS (
    SELECT 1 FROM permissions p
    JOIN (
        SELECT permission_id FROM role_permissions 
        WHERE role_id IN (SELECT role_id FROM user_roles WHERE user_id = 'U002')

        UNION

        SELECT permission_id FROM user_permissions WHERE user_id = 'U002'
    ) AS advisor_perms ON p.permission_id = advisor_perms.permission_id
    WHERE p.table_name = 'student_academic_info'
    AND p.column_name IN ('msu_gpa', 'overall_gpa')
);

SELECT sc.mnumber, sc.subject, sc.course_number, sc.section, sc.hours, sc.final_grade
FROM student_courses sc
WHERE EXISTS (
    SELECT 1 FROM permissions p
    JOIN (
        SELECT permission_id FROM role_permissions 
        WHERE role_id IN (SELECT role_id FROM user_roles WHERE user_id = 'U001')

        UNION

        SELECT permission_id FROM user_permissions WHERE user_id = 'U001'
    ) AS faculty_perms ON p.permission_id = faculty_perms.permission_id
    WHERE p.table_name = 'student_courses'
    AND p.column_name IN ('subject', 'course_number', 'section', 'hours')
);