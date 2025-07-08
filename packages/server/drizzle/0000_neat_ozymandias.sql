CREATE TABLE `academic_standing` (
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `academic_standing_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `admit_codes` (
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `admit_codes_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`code` varchar(50) NOT NULL,
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
	`fee` real NOT NULL DEFAULT 0,
	`web_fee` real NOT NULL DEFAULT 0,
	`last_updated` datetime NOT NULL DEFAULT NOW(),
	`department` varchar(50) DEFAULT '0000',
	`college` varchar(50) DEFAULT '0',
	CONSTRAINT `courses_subject_number_suffix_pk` PRIMARY KEY(`subject`,`number`,`suffix`)
);
--> statement-breakpoint
CREATE TABLE `course_prefixes` (
	`prefix` varchar(50) NOT NULL,
	`department` varchar(50) NOT NULL,
	`college` varchar(50) NOT NULL,
	CONSTRAINT `course_prefixes_prefix` PRIMARY KEY(`prefix`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	`college` varchar(50) NOT NULL DEFAULT '0',
	CONSTRAINT `departments_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `instructional_methods` (
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `instructional_methods_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `instructor_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`crn` varchar(50) NOT NULL,
	`course_subject` varchar(50) NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` varchar(50) NOT NULL DEFAULT '',
	`course_section` varchar(50) NOT NULL DEFAULT '',
	`role` varchar(50) NOT NULL DEFAULT 'Instructor',
	CONSTRAINT `instructor_courses_mnumber_term_year_crn_pk` PRIMARY KEY(`mnumber`,`term`,`year`,`crn`)
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`mnumber` varchar(10) NOT NULL,
	`first_name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`college` varchar(50) DEFAULT '0',
	`department` varchar(50) DEFAULT '0000',
	CONSTRAINT `faculty_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `nations` (
	`code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `nations_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `part_of_term` (
	`code` varchar(50) NOT NULL,
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
	`department` varchar(50) NOT NULL,
	`college` varchar(50) NOT NULL,
	`added_on` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `programs_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `registration_status` (
	`code` varchar(50) NOT NULL,
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
CREATE TABLE `student_academic_info` (
	`mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`admit_term` varchar(50) NOT NULL,
	`admit_year` int NOT NULL,
	`admit_code` varchar(50) NOT NULL,
	`academic_standing` varchar(50) NOT NULL,
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
	`mnumber` varchar(10) NOT NULL,
	`type` varchar(50) NOT NULL,
	`street1` varchar(100) NOT NULL,
	`street2` varchar(100),
	`city` varchar(50) NOT NULL,
	`state` varchar(50) NOT NULL,
	`zip` varchar(10) NOT NULL,
	`nation` varchar(50) NOT NULL,
	`phone` varchar(15) NOT NULL,
	CONSTRAINT `student_addresses_mnumber_type_pk` PRIMARY KEY(`mnumber`,`type`),
	CONSTRAINT `address_type` CHECK(`student_addresses`.`type` IN ('HOME', 'LOCAL'))
);
--> statement-breakpoint
CREATE TABLE `student_advisors` (
	`student_mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`advisor_mnumber` varchar(10) NOT NULL,
	CONSTRAINT `student_advisors_student_mnumber_term_year_advisor_mnumber_pk` PRIMARY KEY(`student_mnumber`,`term`,`year`,`advisor_mnumber`)
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`part_of_term` varchar(50) NOT NULL,
	`crn` varchar(50) NOT NULL,
	`course_subject` varchar(50) NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` varchar(50) NOT NULL DEFAULT '',
	`course_section` varchar(50) NOT NULL,
	`course_hours` int NOT NULL,
	`course_level` varchar(50) NOT NULL,
	`registration_status` varchar(50) NOT NULL,
	`instructional_method` varchar(50) NOT NULL,
	`last_attendance` varchar(50),
	`midterm_grade` varchar(50),
	`final_grade` varchar(50),
	CONSTRAINT `student_courses_mnumber_term_year_crn_pk` PRIMARY KEY(`mnumber`,`term`,`year`,`crn`)
);
--> statement-breakpoint
CREATE TABLE `student_programs` (
	`mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`level` varchar(50) NOT NULL,
	`program` varchar(50) NOT NULL,
	CONSTRAINT `student_programs_mnumber_type_program_pk` PRIMARY KEY(`mnumber`,`type`,`program`),
	CONSTRAINT `program_type` CHECK(`student_programs`.`type` IN ('MAJOR', 'MINOR')),
	CONSTRAINT `program_level` CHECK(`student_programs`.`level` IN ('UG', 'GR', 'PB'))
);
--> statement-breakpoint
CREATE TABLE `students` (
	`mnumber` varchar(10) NOT NULL,
	`first_name` varchar(50) NOT NULL,
	`middle_name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`suffix` varchar(10) NOT NULL,
	`gender` varchar(10) NOT NULL,
	`birthdate` varchar(10) NOT NULL,
	`citizenship` varchar(50) NOT NULL,
	`race_code` varchar(50) NOT NULL,
	`race_description` varchar(50) NOT NULL,
	`residency_code` varchar(50) NOT NULL,
	`residency_description` varchar(50) NOT NULL,
	`age` int NOT NULL,
	`cell_phone` varchar(15) NOT NULL,
	`email` varchar(100) NOT NULL,
	CONSTRAINT `students_mnumber` PRIMARY KEY(`mnumber`)
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`code` varchar(10) NOT NULL,
	`description` varchar(255) NOT NULL,
	CONSTRAINT `terms_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(50) NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(50) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`access_token` varchar(255),
	`refresh_token` varchar(255),
	`id_token` varchar(255),
	`access_token_expires_at` int,
	`refresh_token_expires_at` int,
	`scope` varchar(255),
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(50) NOT NULL,
	`expires_at` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`user_id` varchar(50) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(50) NOT NULL,
	`mnumber` varchar(10),
	`name` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` varchar(255) NOT NULL DEFAULT '',
	`created_at` int NOT NULL,
	`updated_at` int NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`last_login` int NOT NULL DEFAULT 0,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_mnumber_unique` UNIQUE(`mnumber`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(50) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
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
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_mnumber_user_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `user`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_courses_subject_number_suffix_fk` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_department_departments_code_fk` FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_college_colleges_code_fk` FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_term_terms_code_fk` FOREIGN KEY (`admit_term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_admit_code_fk` FOREIGN KEY (`admit_code`) REFERENCES `admit_codes`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `student_academic_info_standing_code_fk` FOREIGN KEY (`academic_standing`) REFERENCES `academic_standing`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `student_addresses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `student_addresses_nation_nations_code_fk` FOREIGN KEY (`nation`) REFERENCES `nations`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_student_mnumber_students_mnumber_fk` FOREIGN KEY (`student_mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `student_advisors_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_part_of_term_part_of_term_code_fk` FOREIGN KEY (`part_of_term`) REFERENCES `part_of_term`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_registration_status_code_fk` FOREIGN KEY (`registration_status`) REFERENCES `registration_status`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_instructional_method_code_fk` FOREIGN KEY (`instructional_method`) REFERENCES `instructional_methods`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_courses_subject_number_suffix_fk` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_mnumber_students_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `student_programs_program_programs_code_fk` FOREIGN KEY (`program`) REFERENCES `programs`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;