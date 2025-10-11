ALTER TABLE `course_prefixes` RENAME COLUMN `department` TO `department_code`;--> statement-breakpoint
ALTER TABLE `course_prefixes` RENAME COLUMN `college` TO `college_code`;--> statement-breakpoint
ALTER TABLE `courses` RENAME COLUMN `department` TO `department_code`;--> statement-breakpoint
ALTER TABLE `courses` RENAME COLUMN `college` TO `college_code`;--> statement-breakpoint
ALTER TABLE `departments` RENAME COLUMN `college` TO `college_code`;--> statement-breakpoint
ALTER TABLE `faculty` RENAME COLUMN `college` TO `college_code`;--> statement-breakpoint
ALTER TABLE `faculty` RENAME COLUMN `department` TO `department_code`;--> statement-breakpoint
ALTER TABLE `instructor_courses` RENAME COLUMN `term` TO `term_code`;--> statement-breakpoint
ALTER TABLE `programs` RENAME COLUMN `department` TO `department_code`;--> statement-breakpoint
ALTER TABLE `programs` RENAME COLUMN `college` TO `college_code`;--> statement-breakpoint
ALTER TABLE `student_academic_info` RENAME COLUMN `term` TO `term_code`;--> statement-breakpoint
ALTER TABLE `student_academic_info` RENAME COLUMN `admit_term` TO `admit_term_code`;--> statement-breakpoint
ALTER TABLE `student_academic_info` RENAME COLUMN `academic_standing` TO `academic_standing_code`;--> statement-breakpoint
ALTER TABLE `student_advisors` RENAME COLUMN `term` TO `term_code`;--> statement-breakpoint
ALTER TABLE `student_courses` RENAME COLUMN `term` TO `term_code`;--> statement-breakpoint
ALTER TABLE `student_courses` RENAME COLUMN `part_of_term` TO `part_of_term_code`;--> statement-breakpoint
ALTER TABLE `student_courses` RENAME COLUMN `registration_status` TO `registration_status_code`;--> statement-breakpoint
ALTER TABLE `student_courses` RENAME COLUMN `instructional_method` TO `instructional_method_code`;--> statement-breakpoint
ALTER TABLE `student_programs` RENAME COLUMN `term` TO `term_code`;--> statement-breakpoint
ALTER TABLE `student_programs` RENAME COLUMN `program` TO `program_code`;--> statement-breakpoint
ALTER TABLE `course_prefixes` DROP FOREIGN KEY `fk_course_prefixes_department`;
--> statement-breakpoint
ALTER TABLE `course_prefixes` DROP FOREIGN KEY `fk_course_prefixes_college`;
--> statement-breakpoint
ALTER TABLE `courses` DROP FOREIGN KEY `fk_courses_department`;
--> statement-breakpoint
ALTER TABLE `courses` DROP FOREIGN KEY `fk_courses_college`;
--> statement-breakpoint
ALTER TABLE `departments` DROP FOREIGN KEY `fk_departments_college`;
--> statement-breakpoint
ALTER TABLE `faculty` DROP FOREIGN KEY `fk_faculty_college`;
--> statement-breakpoint
ALTER TABLE `faculty` DROP FOREIGN KEY `fk_faculty_department`;
--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP FOREIGN KEY `instructor_courses_term_terms_code_fk`;
--> statement-breakpoint
ALTER TABLE `programs` DROP FOREIGN KEY `fk_programs_department`;
--> statement-breakpoint
ALTER TABLE `programs` DROP FOREIGN KEY `fk_programs_college`;
--> statement-breakpoint
ALTER TABLE `student_academic_info` DROP FOREIGN KEY `fk_student_academic_info_term`;
--> statement-breakpoint
ALTER TABLE `student_academic_info` DROP FOREIGN KEY `fk_student_academic_info_admit_term`;
--> statement-breakpoint
ALTER TABLE `student_academic_info` DROP FOREIGN KEY `fk_student_academic_info_academic_standing`;
--> statement-breakpoint
ALTER TABLE `student_advisors` DROP FOREIGN KEY `fk_student_advisors_term`;
--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_term`;
--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_part_of_term`;
--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_registration_status`;
--> statement-breakpoint
ALTER TABLE `student_courses` DROP FOREIGN KEY `fk_student_courses_instructional_method`;
--> statement-breakpoint
ALTER TABLE `student_programs` DROP FOREIGN KEY `fk_student_programs_term`;
--> statement-breakpoint
ALTER TABLE `student_programs` DROP FOREIGN KEY `fk_student_programs_program`;
--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `fk_course_prefixes_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_prefixes` ADD CONSTRAINT `fk_course_prefixes_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `fk_courses_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `fk_departments_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `fk_faculty_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faculty` ADD CONSTRAINT `fk_faculty_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` ADD CONSTRAINT `instructor_courses_term_code_terms_code_fk` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `fk_programs_department` FOREIGN KEY (`department_code`) REFERENCES `departments`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `fk_programs_college` FOREIGN KEY (`college_code`) REFERENCES `colleges`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_admit_term` FOREIGN KEY (`admit_term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_academic_info` ADD CONSTRAINT `fk_student_academic_info_academic_standing` FOREIGN KEY (`academic_standing_code`) REFERENCES `academic_standing`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_advisors` ADD CONSTRAINT `fk_student_advisors_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_part_of_term` FOREIGN KEY (`part_of_term_code`) REFERENCES `part_of_term`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_registration_status` FOREIGN KEY (`registration_status_code`) REFERENCES `registration_status`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_instructional_method` FOREIGN KEY (`instructional_method_code`) REFERENCES `instructional_methods`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `fk_student_programs_term` FOREIGN KEY (`term_code`) REFERENCES `terms`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_programs` ADD CONSTRAINT `fk_student_programs_program` FOREIGN KEY (`program_code`) REFERENCES `programs`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instructor_courses` DROP PRIMARY KEY, ADD PRIMARY KEY(`mnumber`,`term_code`,`year`,`course_subject`,`course_number`,`course_suffix`,`course_section`);--> statement-breakpoint
ALTER TABLE `student_academic_info` DROP PRIMARY KEY, ADD PRIMARY KEY(`mnumber`,`term_code`,`year`);--> statement-breakpoint
ALTER TABLE `student_advisors` DROP PRIMARY KEY, ADD PRIMARY KEY(`student_mnumber`,`term_code`,`year`,`advisor_mnumber`);--> statement-breakpoint
ALTER TABLE `student_courses` DROP PRIMARY KEY, ADD PRIMARY KEY(`mnumber`,`term_code`,`year`,`course_subject`,`course_number`,`course_suffix`,`course_section`);--> statement-breakpoint
ALTER TABLE `student_programs` DROP PRIMARY KEY, ADD PRIMARY KEY(`mnumber`,`type`,`program_code`);