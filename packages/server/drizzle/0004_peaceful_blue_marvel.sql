ALTER TABLE `instructor_courses` DROP FOREIGN KEY `instructor_courses_mnumber_user_mnumber_fk`;
--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_mnumber_faculty_mnumber_fk` FOREIGN KEY (`mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;