CREATE TABLE `academic_standing` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(50) PRIMARY KEY,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`access_token` varchar(2048),
	`refresh_token` varchar(2048),
	`id_token` varchar(2048),
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admit_codes` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `course_prefixes` (
	`id` varchar(10) PRIMARY KEY,
	`department_id` varchar(10),
	`college_id` varchar(10)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(100) PRIMARY KEY,
	`subject` varchar(50) NOT NULL,
	`number` int NOT NULL,
	`suffix` varchar(50) NOT NULL DEFAULT '',
	`title` varchar(255) NOT NULL,
	`hours` int NOT NULL,
	`last_updated` datetime NOT NULL DEFAULT (NOW()),
	`department_id` varchar(10),
	`college_id` varchar(10),
	CONSTRAINT `ux_courses_idx` UNIQUE INDEX(`subject`,`number`,`suffix`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL,
	`college_id` varchar(10)
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`mnumber` varchar(10) PRIMARY KEY,
	`first_name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`college_id` varchar(10),
	`department_id` varchar(10)
);
--> statement-breakpoint
CREATE TABLE `instructional_methods` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `part_of_term` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL,
	`cip_code` varchar(255),
	`is_major` boolean NOT NULL DEFAULT false,
	`is_minor` boolean NOT NULL DEFAULT false,
	`has_concentration` boolean NOT NULL DEFAULT false,
	`is_discontinued` boolean NOT NULL DEFAULT false,
	`is_aacsb` boolean NOT NULL DEFAULT false,
	`department_id` varchar(10),
	`college_id` varchar(10),
	`last_updated` datetime NOT NULL DEFAULT (NOW()),
	`coordinator` varchar(10)
);
--> statement-breakpoint
CREATE TABLE `registration_status` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int PRIMARY KEY,
	`name` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(50) PRIMARY KEY,
	`expires_at` datetime NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`user_id` varchar(50) NOT NULL,
	CONSTRAINT `token_unique` UNIQUE INDEX(`token`)
);
--> statement-breakpoint
CREATE TABLE `student_academic_info` (
	`mnumber` varchar(10) NOT NULL,
	`term_id` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`admit_term_id` varchar(10),
	`admit_year` int,
	`admit_id` varchar(10),
	`academic_standing_id` varchar(10),
	`msu_attempted_hours` real,
	`msu_earned_hours` real,
	`msu_quality_points` real,
	`msu_gpa` real,
	`overall_attempted_hours` real,
	`overall_earned_hours` real,
	`overall_quality_points` real,
	`overall_gpa` real,
	CONSTRAINT `ux_student_academic_info_idx` UNIQUE INDEX(`mnumber`,`term_id`,`year`)
);
--> statement-breakpoint
CREATE TABLE `student_advisors` (
	`mnumber` varchar(10) NOT NULL,
	`term_id` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`advisor_mnumber` varchar(10) NOT NULL,
	CONSTRAINT `ux_student_advisors_idx` UNIQUE INDEX(`mnumber`,`term_id`,`year`)
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term_id` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`part_of_term_id` varchar(10),
	`course_id` varchar(100) NOT NULL,
	`course_section` varchar(50) NOT NULL,
	`course_hours` int NOT NULL,
	`course_level` varchar(50),
	`registration_status_id` varchar(10),
	`instructional_method_id` varchar(10),
	`instructor_mnumber` varchar(10) NOT NULL,
	`last_attendance` datetime,
	`midterm_grade` varchar(50),
	`final_grade` varchar(50),
	CONSTRAINT `ux_student_courses_idx` UNIQUE INDEX(`mnumber`,`term_id`,`year`,`course_id`,`course_section`)
);
--> statement-breakpoint
CREATE TABLE `student_programs` (
	`mnumber` varchar(10) NOT NULL,
	`term_id` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`level` varchar(50) NOT NULL,
	`program_id` varchar(10) NOT NULL,
	CONSTRAINT `ux_student_programs_idx` UNIQUE INDEX(`mnumber`,`term_id`,`year`),
	CONSTRAINT `program_type` CHECK(`student_programs`.`type` IN ('MAJOR', 'MINOR')),
	CONSTRAINT `program_level` CHECK(`student_programs`.`level` IN ('UG', 'GR', 'PB'))
);
--> statement-breakpoint
CREATE TABLE `students` (
	`mnumber` varchar(10) PRIMARY KEY,
	`first_name` varchar(50) NOT NULL,
	`middle_name` varchar(50),
	`last_name` varchar(50) NOT NULL,
	`suffix` varchar(10),
	`gender` varchar(10),
	`email` varchar(100)
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`id` varchar(10) PRIMARY KEY,
	`description` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(50) PRIMARY KEY,
	`mnumber` varchar(10),
	`name` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` varchar(255) NOT NULL DEFAULT '',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`last_login` datetime,
	CONSTRAINT `mnumber_unique` UNIQUE INDEX(`mnumber`),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(50) NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `ux_user_roles_idx` UNIQUE INDEX(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(50) PRIMARY KEY,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(2048) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `course_prefixes_department_id_departments_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `course_prefixes_college_id_colleges_id_fkey` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_department_id_departments_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_college_id_colleges_id_fkey` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_college_id_colleges_id_fkey` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_college_id_colleges_id_fkey` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_department_id_departments_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_department_id_departments_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_college_id_colleges_id_fkey` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_coordinator_faculty_mnumber_fkey` FOREIGN KEY (`coordinator`) REFERENCES `faculty`(`mnumber`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_mnumber_students_mnumber_fkey` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_term_id_terms_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_term_id_terms_id_fkey` FOREIGN KEY (`admit_term_id`) REFERENCES `terms`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_id_admit_codes_id_fkey` FOREIGN KEY (`admit_id`) REFERENCES `admit_codes`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_g73GBAei8SW8_fkey` FOREIGN KEY (`academic_standing_id`) REFERENCES `academic_standing`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_mnumber_students_mnumber_fkey` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_term_id_terms_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_advisor_mnumber_faculty_mnumber_fkey` FOREIGN KEY (`advisor_mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_mnumber_students_mnumber_fkey` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_term_id_terms_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_part_of_term_id_part_of_term_id_fkey` FOREIGN KEY (`part_of_term_id`) REFERENCES `part_of_term`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_course_id_courses_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_RGgcuxN3Vn0a_fkey` FOREIGN KEY (`registration_status_id`) REFERENCES `registration_status`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_u28ABesaZ4OX_fkey` FOREIGN KEY (`instructional_method_id`) REFERENCES `instructional_methods`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_instructor_mnumber_faculty_mnumber_fkey` FOREIGN KEY (`instructor_mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_mnumber_students_mnumber_fkey` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_term_id_terms_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE;