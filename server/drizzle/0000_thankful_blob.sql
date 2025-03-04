CREATE TABLE `academic_standing` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admit_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `advisors` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`suffix` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `college_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`subject` text NOT NULL,
	`number` integer NOT NULL,
	`suffix` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`hours` integer NOT NULL,
	`fee` real DEFAULT 0 NOT NULL,
	`web_fee` real DEFAULT 0 NOT NULL,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`subject`, `number`, `suffix`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`prefixes` text,
	`canvas_id` text,
	`college` text DEFAULT '0' NOT NULL,
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`file_name` text NOT NULL,
	`total_records` integer NOT NULL,
	`error_details` text NOT NULL,
	`import_status` text NOT NULL,
	`imported_by` text NOT NULL,
	`import_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`imported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instructional_methods` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `instructor_courses` (
	`user_id` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` text NOT NULL,
	`course_suffix` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'Instructor' NOT NULL,
	PRIMARY KEY(`user_id`, `term`, `year`, `course_subject`, `course_number`, `course_suffix`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nations` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `overrides` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`crn` text NOT NULL,
	`subject` text NOT NULL,
	`number` text NOT NULL,
	`suffix` text DEFAULT '' NOT NULL,
	`section` text NOT NULL,
	`override_type` text NOT NULL,
	`granted_by` text NOT NULL,
	`override_date` text NOT NULL,
	PRIMARY KEY(`mnumber`, `term`, `year`, `crn`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject`,`number`,`suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `part_of_term` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table_name` text NOT NULL,
	`column_name` text NOT NULL,
	`can_read` integer DEFAULT false NOT NULL,
	`can_write` integer DEFAULT false NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `previous_colleges` (
	`mnumber` text NOT NULL,
	`college_code` text NOT NULL,
	`college_description` text NOT NULL,
	`degree` text NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`mnumber`, `college_code`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college_code`) REFERENCES `college_codes`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`cip_code` text,
	`is_major` integer DEFAULT false NOT NULL,
	`is_minor` integer DEFAULT false NOT NULL,
	`has_concentration` integer DEFAULT false NOT NULL,
	`is_discontinued` integer DEFAULT false NOT NULL,
	`is_aacsb` integer DEFAULT false NOT NULL,
	`department` text NOT NULL,
	`college` text NOT NULL,
	`added_on` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registration_status` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_academic_info` (
	`mnumber` text NOT NULL,
	`admit_term` text NOT NULL,
	`admit_year` integer NOT NULL,
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
	PRIMARY KEY(`mnumber`, `admit_term`, `admit_year`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`admit_term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`admit_code`) REFERENCES `admit_codes`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_standing`) REFERENCES `academic_standing`(`code`) ON UPDATE no action ON DELETE no action
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
	`nation_code` text NOT NULL,
	`phone` text NOT NULL,
	PRIMARY KEY(`mnumber`, `type`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nation_code`) REFERENCES `nations`(`code`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "address_type" CHECK("student_addresses"."type" IN ('HOME', 'LOCAL'))
);
--> statement-breakpoint
CREATE TABLE `student_advisors` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`advisor_id` text NOT NULL,
	PRIMARY KEY(`mnumber`, `term`, `year`, `advisor_id`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`advisor_id`) REFERENCES `advisors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`part_of_term` text NOT NULL,
	`crn` text NOT NULL,
	`subject` text NOT NULL,
	`number` text NOT NULL,
	`suffix` text NOT NULL,
	`section` text NOT NULL,
	`hours` integer NOT NULL,
	`level` text NOT NULL,
	`registration_status` text NOT NULL,
	`instructional_method` text NOT NULL,
	`last_attendance` text,
	`midterm_grade` real,
	`final_grade` real,
	PRIMARY KEY(`mnumber`, `term`, `year`, `crn`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`part_of_term`) REFERENCES `part_of_term`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registration_status`) REFERENCES `registration_status`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructional_method`) REFERENCES `instructional_methods`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject`,`number`,`suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_programs` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`study` text NOT NULL,
	`type` text NOT NULL,
	`level` text NOT NULL,
	`program` text NOT NULL,
	`department` text NOT NULL,
	`college` text NOT NULL,
	PRIMARY KEY(`mnumber`, `term`, `year`, `type`, `program`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program`) REFERENCES `programs`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "program_type" CHECK("student_programs"."type" IN ('MAJOR', 'MINOR')),
	CONSTRAINT "program_level" CHECK("student_programs"."level" IN ('UG', 'GR', 'PB'))
);
--> statement-breakpoint
CREATE TABLE `student_types` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`next_student_type` text NOT NULL,
	FOREIGN KEY (`next_student_type`) REFERENCES `student_types`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`mnumber` text PRIMARY KEY NOT NULL,
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
	`age` integer NOT NULL,
	`cell_phone` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subject_prefixes` (
	`college` text NOT NULL,
	`department` text NOT NULL,
	`prefix` text NOT NULL,
	PRIMARY KEY(`college`, `department`, `prefix`),
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `test_scores` (
	`mnumber` text NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`score` real NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`mnumber`, `code`, `date`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`user_id` text NOT NULL,
	`permission_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `permission_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`last_login` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);