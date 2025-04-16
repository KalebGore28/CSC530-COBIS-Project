PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_instructor_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`crn` text NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` integer NOT NULL,
	`course_suffix` text DEFAULT '' NOT NULL,
	`course_section` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'Instructor' NOT NULL,
	PRIMARY KEY(`mnumber`, `term`, `year`, `crn`),
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_instructor_courses`("mnumber", "term", "year", "crn", "course_subject", "course_number", "course_suffix", "course_section", "role") SELECT "mnumber", "term", "year", "crn", "course_subject", "course_number", "course_suffix", "course_section", "role" FROM `instructor_courses`;--> statement-breakpoint
DROP TABLE `instructor_courses`;--> statement-breakpoint
ALTER TABLE `__new_instructor_courses` RENAME TO `instructor_courses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_student_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`part_of_term` text NOT NULL,
	`crn` text NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` integer NOT NULL,
	`course_suffix` text DEFAULT '' NOT NULL,
	`course_section` text NOT NULL,
	`course_hours` integer NOT NULL,
	`course_level` text NOT NULL,
	`registration_status` text NOT NULL,
	`instructional_method` text NOT NULL,
	`last_attendance` text,
	`midterm_grade` text,
	`final_grade` text,
	PRIMARY KEY(`mnumber`, `term`, `year`, `crn`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term`) REFERENCES `terms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`part_of_term`) REFERENCES `part_of_term`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registration_status`) REFERENCES `registration_status`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`instructional_method`) REFERENCES `instructional_methods`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_subject`,`course_number`,`course_suffix`) REFERENCES `courses`(`subject`,`number`,`suffix`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_student_courses`("mnumber", "term", "year", "part_of_term", "crn", "course_subject", "course_number", "course_suffix", "course_section", "course_hours", "course_level", "registration_status", "instructional_method", "last_attendance", "midterm_grade", "final_grade") SELECT "mnumber", "term", "year", "part_of_term", "crn", "course_subject", "course_number", "course_suffix", "course_section", "course_hours", "course_level", "registration_status", "instructional_method", "last_attendance", "midterm_grade", "final_grade" FROM `student_courses`;--> statement-breakpoint
DROP TABLE `student_courses`;--> statement-breakpoint
ALTER TABLE `__new_student_courses` RENAME TO `student_courses`;