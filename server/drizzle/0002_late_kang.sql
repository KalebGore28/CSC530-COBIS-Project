PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_instructor_courses` (
	`mnumber` text NOT NULL,
	`term` text NOT NULL,
	`year` integer NOT NULL,
	`crn` text NOT NULL,
	`course_subject` text NOT NULL,
	`course_number` text NOT NULL,
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
PRAGMA foreign_keys=ON;