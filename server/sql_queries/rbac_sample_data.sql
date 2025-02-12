DELETE FROM role_permissions;
DELETE FROM user_permissions;
DELETE FROM user_roles;
DELETE FROM permissions;
DELETE FROM roles;
DELETE FROM users;

-- Permissions
INSERT INTO permissions (table_name, column_name, can_read, can_write, description) VALUES
-- ✅ General Student Information (Allowed for Most Roles)
('students', 'first_name', 1, 0, 'View student first name'),
('students', 'last_name', 1, 0, 'View student last name'),
('students', 'gender', 1, 0, 'View student gender'),
('students', 'birth_date', 1, 0, 'View student birth date (Restricted to Chairs & Admins)'),
('students', 'citizenship', 1, 0, 'View student citizenship status'),
-- 🚨 FERPA-Sensitive Information (Restricted)
('student_academic_info', 'msu_gpa', 1, 0, 'View MSU GPA (FERPA-Protected)'),
('student_academic_info', 'overall_gpa', 1, 0, 'View Overall GPA (FERPA-Protected)'),
('student_courses', 'midterm_grade', 0, 0, 'View student midterm grades (FERPA-Protected)'),
('student_courses', 'final_grade', 0, 0, 'View student final grades (FERPA-Protected)'),
-- ✅ Course and Enrollment Information
('student_courses', 'subject', 1, 0, 'View course subject'),
('student_courses', 'course_number', 1, 0, 'View course number'),
('student_courses', 'section', 1, 0, 'View section number'),
('student_courses', 'hours', 1, 0, 'View course credit hours'),
-- ✅ Faculty Course Access
('faculty_courses', NULL, 1, 0, 'View courses taught by faculty'),
-- ✅ Academic and Enrollment Information
('student_academic_info', 'academic_standing', 1, 0, 'View academic standing'),
-- ✅ Advisor-Specific Actions
('student_advisors', NULL, 1, 1, 'Modify assigned advisors');

-- Roles
INSERT INTO roles (role_name) VALUES
('Faculty'),
('Advisor'),
('Program Coordinator'),
('Department Chair'),
('Administrator'),
('COBIS Administrator');

-- Users
INSERT INTO users (user_id, email, display_name, is_active, sso_provider) VALUES
('U001', 'faculty1@university.edu', 'Dr. John Faculty', 1, 'AzureAD'),
('U002', 'advisor1@university.edu', 'Jane Advisor', 1, 'AzureAD'),
('U003', 'chair1@university.edu', 'Dr. Emily Chair', 1, 'AzureAD'),
('U004', 'admin1@university.edu', 'Admin Assistant', 1, 'AzureAD');

-- User roles
INSERT INTO user_roles (user_id, role_id)
SELECT 'U001', role_id FROM roles WHERE role_name = 'Faculty'
UNION ALL
SELECT 'U002', role_id FROM roles WHERE role_name = 'Advisor'
UNION ALL
SELECT 'U003', role_id FROM roles WHERE role_name IN ('Department Chair', 'Faculty')
UNION ALL
SELECT 'U004', role_id FROM roles WHERE role_name = 'Administrator';

-- Role Permissions
-- 📌 Faculty: Can access their own course enrollments but NOT FERPA data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'Faculty' 
AND p.table_name IN ('faculty_courses', 'student_courses') 
AND p.column_name NOT IN ('midterm_grade', 'final_grade', 'msu_gpa', 'overall_gpa');
-- 📌 Advisors: Can view student names and **MSU GPA** (but NOT final grades)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'Advisor' 
AND p.column_name IN ('first_name', 'last_name', 'msu_gpa');
-- 📌 Program Coordinators & Department Chairs: Can view **MSU & Overall GPA**
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name IN ('Program Coordinator', 'Department Chair') 
AND p.column_name IN ('msu_gpa', 'overall_gpa');
-- 📌 Administrators: Can view student info but NOT **GPA or Grades (FERPA restriction)**
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'Administrator'
AND p.column_name NOT IN ('msu_gpa', 'overall_gpa', 'midterm_grade', 'final_grade');

-- User Permisssions
-- Give Advisor (U002) permission to view Overall GPA (normally restricted)
INSERT INTO user_permissions (user_id, permission_id)
SELECT 'U002', permission_id FROM permissions WHERE column_name = 'overall_gpa';

-- Allow Faculty (U001) to view Final Grades for research purposes
INSERT INTO user_permissions (user_id, permission_id)
SELECT 'U001', permission_id FROM permissions WHERE column_name = 'final_grade';