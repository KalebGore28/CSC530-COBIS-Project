CREATE TABLE `academic_standing` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `academic_standing_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(50) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`access_token` varchar(255),
	`refresh_token` varchar(255),
	`id_token` varchar(2048),
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admit_codes` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `admit_codes_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `colleges_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`subject` varchar(50) NOT NULL,
	`number` int NOT NULL,
	`suffix` varchar(50) NOT NULL DEFAULT '',
	`title` varchar(255) NOT NULL,
	`hours` int NOT NULL,
	`last_updated` datetime NOT NULL DEFAULT NOW(),
	`department_code` varchar(10),
	`college_code` varchar(10),
	CONSTRAINT `pk_courses` PRIMARY KEY(`subject`,`number`,`suffix`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	`college_code` varchar(10),
	CONSTRAINT `departments_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`mnumber` varchar(10) NOT NULL,
	`first_name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`college_code` varchar(10),
	`department_code` varchar(10),
	CONSTRAINT `faculty_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `instructional_methods` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `instructional_methods_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `instructor_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term_code` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`course_subject` varchar(50) NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` varchar(50) NOT NULL DEFAULT '',
	`course_section` varchar(50) NOT NULL DEFAULT '',
	CONSTRAINT `pk_instructor_courses` PRIMARY KEY(`mnumber`,`term_code`,`year`,`course_subject`,`course_number`,`course_suffix`,`course_section`)
);
--> statement-breakpoint
CREATE TABLE `nations` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `nations_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `part_of_term` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `part_of_term_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	`cip_code` varchar(255),
	`is_major` boolean NOT NULL DEFAULT false,
	`is_minor` boolean NOT NULL DEFAULT false,
	`has_concentration` boolean NOT NULL DEFAULT false,
	`is_discontinued` boolean NOT NULL DEFAULT false,
	`is_aacsb` boolean NOT NULL DEFAULT false,
	`department_code` varchar(10),
	`college_code` varchar(10),
	`last_updated` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `programs_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `registration_status` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `registration_status_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(50) NOT NULL,
	`expires_at` datetime NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`user_id` varchar(50) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `student_academic_info` (
	`mnumber` varchar(10) NOT NULL,
	`term_code` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`admit_term_code` varchar(10),
	`admit_year` int,
	`admit_code` varchar(10),
	`academic_standing_code` varchar(10),
	`msu_attempted_hours` real,
	`msu_earned_hours` real,
	`msu_quality_points` real,
	`msu_gpa` real,
	`overall_attempted_hours` real,
	`overall_earned_hours` real,
	`overall_quality_points` real,
	`overall_gpa` real,
	CONSTRAINT `pk_student_academic_info` PRIMARY KEY(`mnumber`,`term_code`,`year`)
);
--> statement-breakpoint
CREATE TABLE `student_addresses` (
	`mnumber` varchar(10) NOT NULL,
	`street1` varchar(100),
	`street2` varchar(100),
	`city` varchar(50),
	`state` varchar(50),
	`zip` varchar(10),
	`nation_code` varchar(10),
	`phone` varchar(15),
	CONSTRAINT `student_addresses_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `student_advisors` (
	`student_mnumber` varchar(10) NOT NULL,
	`term_code` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`advisor_mnumber` varchar(10) NOT NULL,
	CONSTRAINT `pk_student_advisors` PRIMARY KEY(`student_mnumber`,`term_code`,`year`,`advisor_mnumber`)
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term_code` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`part_of_term_code` varchar(10),
	`course_subject` varchar(50) NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` varchar(50) NOT NULL DEFAULT '',
	`course_section` varchar(50) NOT NULL,
	`course_hours` int NOT NULL,
	`course_level` varchar(50),
	`registration_status_code` varchar(10),
	`instructional_method_code` varchar(10),
	`last_attendance` varchar(50),
	`midterm_grade` varchar(50),
	`final_grade` varchar(50),
	CONSTRAINT `pk_student_courses` PRIMARY KEY(`mnumber`,`term_code`,`year`,`course_subject`,`course_number`,`course_suffix`,`course_section`)
);
--> statement-breakpoint
CREATE TABLE `student_programs` (
	`mnumber` varchar(10) NOT NULL,
	`term_code` varchar(10) NOT NULL,
	`year` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`level` varchar(50) NOT NULL,
	`program_code` varchar(10) NOT NULL,
	CONSTRAINT `pk_student_programs` PRIMARY KEY(`mnumber`,`type`,`program_code`),
	CONSTRAINT `program_type` CHECK(`student_programs`.`type` IN ('MAJOR', 'MINOR')),
	CONSTRAINT `program_level` CHECK(`student_programs`.`level` IN ('UG', 'GR', 'PB'))
);
--> statement-breakpoint
CREATE TABLE `students` (
	`mnumber` varchar(10) NOT NULL,
	`first_name` varchar(50) NOT NULL,
	`middle_name` varchar(50),
	`last_name` varchar(50) NOT NULL,
	`suffix` varchar(10),
	`gender` varchar(10),
	`birthdate` varchar(10),
	`citizenship` varchar(50),
	`race` varchar(50),
	`residency` varchar(50),
	`cell_phone` varchar(15),
	`email` varchar(100),
	CONSTRAINT `students_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `terms_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(50) NOT NULL,
	`mnumber` varchar(10),
	`name` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` varchar(255) NOT NULL DEFAULT '',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`last_login` datetime,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_mnumber_unique` UNIQUE(`mnumber`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(50) NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `pk_user_roles` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(50) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(2048) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `fk_courses_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `fk_departments_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `fk_faculty_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `fk_faculty_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_mnumber_faculty_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_term_code_terms_code_fk` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `fk_instructor_courses_course` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `fk_programs_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `fk_programs_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_student` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_admit_term` FOREIGN KEY (`admit_term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_admit_code` FOREIGN KEY (`admit_code`) REFERENCES `admit_codes`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_academic_standing` FOREIGN KEY (`academic_standing_code`) REFERENCES `academic_standing`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `student_addresses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `fk_student_addresses_nation` FOREIGN KEY (`nation_code`) REFERENCES `nations`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_student_mnumber_students_mnumber_fk` FOREIGN KEY (`student_mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `fk_student_advisors_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `fk_student_advisors_faculty` FOREIGN KEY (`advisor_mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `fk_student_advisors_student` FOREIGN KEY (`student_mnumber`) REFERENCES `students`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_part_of_term` FOREIGN KEY (`part_of_term_code`) REFERENCES `part_of_term`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_registration_status` FOREIGN KEY (`registration_status_code`) REFERENCES `registration_status`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_instructional_method` FOREIGN KEY (`instructional_method_code`) REFERENCES `instructional_methods`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_course` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `fk_student_programs_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `fk_student_programs_program` FOREIGN KEY (`program_code`) REFERENCES `programs`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;