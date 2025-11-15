-- Add a new column 'code' to the 'courses' table that combines subject, number, and suffix
ALTER TABLE `courses` ADD `code` varchar(100) NULL;--> statement-breakpoint
UPDATE `courses`
SET `code` = CONCAT(subject, number, suffix);--> statement-breakpoint
ALTER TABLE `courses` MODIFY `code` varchar(100) NOT NULL FIRST; --> statement-breakpoint

-- Add 'course_id' to student_courses and instructor_courses and populate it
ALTER TABLE `student_courses` ADD `course_id` varchar(100) NULL;--> statement-breakpoint
UPDATE `student_courses`
SET `course_id` = CONCAT(course_subject, course_number, course_suffix);--> statement-breakpoint
ALTER TABLE `student_courses` MODIFY `course_id` varchar(100) NOT NULL; --> statement-breakpoint

ALTER TABLE `instructor_courses` ADD `course_id` varchar(100) NULL;--> statement-breakpoint
UPDATE `instructor_courses`
SET `course_id` = CONCAT(course_subject, course_number, course_suffix);--> statement-breakpoint
ALTER TABLE `instructor_courses` MODIFY `course_id` varchar(100) NOT NULL; --> statement-breakpoint

-- Add unique constraint on courses.code temporarily to ensure uniqueness for changing foreign key references
ALTER TABLE `courses` ADD CONSTRAINT `ux_courses_code` UNIQUE(`code`);--> statement-breakpoint

-- Clean up foreign keys and primary keys on student_courses
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_course`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_term`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_part_of_term`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_registration_status`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_instructional_method`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `student_courses_mnumber_students_mnumber_fk`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP INDEX `fk_student_courses_course`;--> statement-breakpoint
ALTER TABLE `student_courses` DROP PRIMARY KEY;--> statement-breakpoint

-- Add new foreign key referencing courses.code
ALTER TABLE `student_courses`
ADD CONSTRAINT `fk_student_courses_course_id`
FOREIGN KEY (`course_id`) REFERENCES `courses`(`code`);--> statement-breakpoint

-- Set new primary key on student_courses
ALTER TABLE `student_courses` ADD PRIMARY KEY(`mnumber`, `term_code`, `year`, `course_id`, `course_section`);--> statement-breakpoint

-- Readd foreign keys for student_courses
ALTER TABLE `student_courses`
ADD CONSTRAINT `fk_student_courses_term`
FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`);--> statement-breakpoint
ALTER TABLE `student_courses`
ADD CONSTRAINT `fk_student_courses_part_of_term`
FOREIGN KEY (`part_of_term_code`) REFERENCES `part_of_term`(`code`);--> statement-breakpoint
ALTER TABLE `student_courses`
ADD CONSTRAINT `fk_student_courses_registration_status`
FOREIGN KEY (`registration_status_code`) REFERENCES `registration_status`(`code`);--> statement-breakpoint
ALTER TABLE `student_courses`
ADD CONSTRAINT `fk_student_courses_instructional_method`
FOREIGN KEY (`instructional_method_code`) REFERENCES `instructional_methods`(`code`);--> statement-breakpoint
ALTER TABLE `student_courses`
ADD CONSTRAINT `student_courses_mnumber_students_mnumber_fk`
FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`);--> statement-breakpoint

-- Clean up foreign keys and primary keys on instructor_courses
ALTER TABLE `instructor_courses` DROP FOREIGN KEY `fk_instructor_courses_course`;--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP FOREIGN KEY `instructor_courses_term_code_terms_code_fk`;--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP FOREIGN KEY `instructor_courses_mnumber_faculty_mnumber_fk`;--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP INDEX `fk_instructor_courses_course`;--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP PRIMARY KEY;--> statement-breakpoint

-- Add new foreign key referencing courses.code
ALTER TABLE `instructor_courses`
ADD CONSTRAINT `fk_instructor_courses_course_id`
FOREIGN KEY (`course_id`) REFERENCES `courses`(`code`);--> statement-breakpoint

-- Set new primary key on instructor_courses
ALTER TABLE `instructor_courses` ADD PRIMARY KEY(`mnumber`, `term_code`, `year`, `course_id`, `course_section`);--> statement-breakpoint

-- Drop old primary key on courses and set new primary key to 'code'
ALTER TABLE `courses` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `courses` ADD PRIMARY KEY(`code`);--> statement-breakpoint

-- Finally, drop the temporary unique constraint on courses.code
ALTER TABLE `courses` DROP INDEX `ux_courses_code`;