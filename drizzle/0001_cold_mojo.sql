CREATE TABLE `instructor_courses` (
	`mnumber` varchar(10) NOT NULL,
	`term` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`course_subject` varchar(50) NOT NULL,
	`course_number` int NOT NULL,
	`course_suffix` varchar(50) NOT NULL DEFAULT '',
	`course_section` varchar(50) NOT NULL DEFAULT '',
	`role` varchar(50) NOT NULL DEFAULT 'Instructor',
	CONSTRAINT `pk_instructor_courses` PRIMARY KEY(`mnumber`,`term`,`year`,`course_subject`,`course_number`,`course_suffix`,`course_section`)
);
--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_mnumber_faculty_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_term_terms_code_fk` FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `fk_instructor_courses_course` FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON DELETE no action ON UPDATE no action;