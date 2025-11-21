ALTER TABLE `student_courses` ADD `instructor_mnumber` varchar(10) NOT NULL;--> statement-breakpoint

UPDATE student_courses sc
JOIN instructor_courses ic
  ON sc.term_code = ic.term_code
 AND sc.year = ic.year
 AND sc.course_id = ic.course_id
 AND sc.course_section = ic.course_section
SET sc.instructor_mnumber = ic.mnumber;--> statement-breakpoint

ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_instructor_mnumber_faculty_mnumber_fk` FOREIGN KEY (`instructor_mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_instructor` FOREIGN KEY (`instructor_mnumber`) REFERENCES `faculty`(`mnumber`) ON DELETE no action ON UPDATE no action;