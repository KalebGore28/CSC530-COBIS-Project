CREATE TABLE `course_prefixes` (
	`code` varchar(10) PRIMARY KEY,
	`department_code` varchar(10),
	`college_code` varchar(10),
	CONSTRAINT `course_prefixes_department_code_departments_code_fkey` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`),
	CONSTRAINT `course_prefixes_college_code_colleges_code_fkey` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`)
);
