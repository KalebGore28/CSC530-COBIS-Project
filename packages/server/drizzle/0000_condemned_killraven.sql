CREATE TABLE `academic_standing` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `academic_standing_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `admit_codes` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `admit_codes_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `colleges_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`subject` text NOT NULL,
	`number` int NOT NULL,
	`suffix` text NOT NULL DEFAULT (''),
	`title` text NOT NULL,
	`hours` int NOT NULL,
	`fee` real NOT NULL DEFAULT 0,
	`web_fee` real NOT NULL DEFAULT 0,
	`last_updated` text NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`department` text DEFAULT ('0000'),
	`college` text DEFAULT ('0'),
	CONSTRAINT `courses_subject_number_suffix_pk` PRIMARY KEY(`subject`,`number`,`suffix`)
);
--> statement-breakpoint
CREATE TABLE `course_prefixes` (
	`prefix` text NOT NULL,
	`department` text NOT NULL,
	`college` text NOT NULL,
	CONSTRAINT `course_prefixes_prefix` PRIMARY KEY(`prefix`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	`college` text NOT NULL DEFAULT ('0'),
	CONSTRAINT `departments_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `instructional_methods` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `instructional_methods_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `instructor_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` int NOT NULL,
	`crn` text NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` text NOT NULL DEFAULT (''),
	`course_section` text NOT NULL DEFAULT (''),
	`role` text NOT NULL DEFAULT ('Instructor'),
	CONSTRAINT `instructor_courses_mnumber_term_year_crn_pk` PRIMARY KEY(`mnumber`,`term`,`year`,`crn`)
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`mnumber` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`college` text DEFAULT ('0'),
	`department` text DEFAULT ('0000'),
	CONSTRAINT `faculty_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `nations` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `nations_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `part_of_term` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `part_of_term_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	`cip_code` text,
	`is_major` boolean NOT NULL DEFAULT false,
	`is_minor` boolean NOT NULL DEFAULT false,
	`has_concentration` boolean NOT NULL DEFAULT false,
	`is_discontinued` boolean NOT NULL DEFAULT false,
	`is_aacsb` boolean NOT NULL DEFAULT false,
	`department` text NOT NULL,
	`college` text NOT NULL,
	`added_on` text NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `programs_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `registration_status` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `registration_status_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_academic_info` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` int NOT NULL,
	`admit_term` text NOT NULL,
	`admit_year` int NOT NULL,
	`admit_code` text NOT NULL,
	`academic_standing` text NOT NULL,
	`msu_attempted_hours` real NOT NULL,
	`msu_earned_hours` real NOT NULL,
	`msu_quality_points` real NOT NULL,
	`msu_gpa` real NOT NULL,
	`overall_attempted_hours` real NOT NULL,
	`overall_earned_hours` real NOT NULL,
	`overall_quality_points` real NOT NULL,
	`overall_gpa` real NOT NULL,
	CONSTRAINT `student_academic_info_mnumber_term_year_pk` PRIMARY KEY(`mnumber`,`term`,`year`)
);
--> statement-breakpoint
CREATE TABLE `student_addresses` (
	`mnumber` text NOT NULL,
	`type` text NOT NULL,
	`street1` text NOT NULL,
	`street2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip` text NOT NULL,
	`nation` text NOT NULL,
	`phone` text NOT NULL,
	CONSTRAINT `student_addresses_mnumber_type_pk` PRIMARY KEY(`mnumber`,`type`),
	CONSTRAINT `address_type` CHECK(`student_addresses`.`type` IN ('HOME', 'LOCAL'))
);
--> statement-breakpoint
CREATE TABLE `student_advisors` (
	`student_mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` int NOT NULL,
	`advisor_mnumber` text NOT NULL,
	CONSTRAINT `student_advisors_student_mnumber_term_year_advisor_mnumber_pk` PRIMARY KEY(`student_mnumber`,`term`,`year`,`advisor_mnumber`)
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` int NOT NULL,
	`part_of_term` text NOT NULL,
	`crn` text NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` text NOT NULL DEFAULT (''),
	`course_section` text NOT NULL,
	`course_hours` int NOT NULL,
	`course_level` text NOT NULL,
	`registration_status` text NOT NULL,
	`instructional_method` text NOT NULL,
	`last_attendance` text,
	`midterm_grade` text,
	`final_grade` text,
	CONSTRAINT `student_courses_mnumber_term_year_crn_pk` PRIMARY KEY(`mnumber`,`term`,`year`,`crn`)
);
--> statement-breakpoint
CREATE TABLE `student_programs` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` int NOT NULL,
	`type` text NOT NULL,
	`level` text NOT NULL,
	`program` text NOT NULL,
	CONSTRAINT `student_programs_mnumber_type_program_pk` PRIMARY KEY(`mnumber`,`type`,`program`),
	CONSTRAINT `program_type` CHECK(`student_programs`.`type` IN ('MAJOR', 'MINOR')),
	CONSTRAINT `program_level` CHECK(`student_programs`.`level` IN ('UG', 'GR', 'PB'))
);
--> statement-breakpoint
CREATE TABLE `students` (
	`mnumber` text NOT NULL,
	`first_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`last_name` text NOT NULL,
	`suffix` text NOT NULL,
	`gender` text NOT NULL,
	`birthdate` text NOT NULL,
	`citizenship` text NOT NULL,
	`race_code` text NOT NULL,
	`race_description` text NOT NULL,
	`residency_code` text NOT NULL,
	`residency_description` text NOT NULL,
	`age` int NOT NULL,
	`cell_phone` text NOT NULL,
	`email` text NOT NULL,
	CONSTRAINT `students_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`code` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `terms_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` int,
	`refresh_token_expires_at` int,
	`scope` text,
	`password` text,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text NOT NULL,
	`expires_at` int NOT NULL,
	`token` text NOT NULL,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text NOT NULL,
	`mnumber` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` text,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`last_login` int NOT NULL DEFAULT (strftime('%s','now')),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_mnumber_unique` UNIQUE(`mnumber`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` int NOT NULL,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `course_prefixes_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `course_prefixes_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_course_subject_course_number_course_suffix_courses_subject_number_suffix_fk` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_term_terms_code_fk` FOREIGN KEY (`admit_term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_code_admit_codes_code_fk` FOREIGN KEY (`admit_code`) REFERENCES `admit_codes`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_academic_standing_academic_standing_code_fk` FOREIGN KEY (`academic_standing`) REFERENCES `academic_standing`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `student_addresses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `student_addresses_nation_nations_code_fk` FOREIGN KEY (`nation`) REFERENCES `nations`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_student_mnumber_students_mnumber_fk` FOREIGN KEY (`student_mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_part_of_term_part_of_term_code_fk` FOREIGN KEY (`part_of_term`) REFERENCES `part_of_term`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_registration_status_registration_status_code_fk` FOREIGN KEY (`registration_status`) REFERENCES `registration_status`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_instructional_method_instructional_methods_code_fk` FOREIGN KEY (`instructional_method`) REFERENCES `instructional_methods`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_course_subject_course_number_course_suffix_courses_subject_number_suffix_fk` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_program_programs_code_fk` FOREIGN KEY (`program`) REFERENCES `programs`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;