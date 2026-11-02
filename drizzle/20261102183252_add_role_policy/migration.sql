CREATE TABLE `role_capabilities` (
	`role_id` int NOT NULL,
	`capability` varchar(100) NOT NULL,
	CONSTRAINT `ux_role_capabilities_idx` UNIQUE INDEX(`role_id`,`capability`)
);
--> statement-breakpoint
CREATE TABLE `role_data_access` (
	`role_id` int NOT NULL,
	`relationship` enum('teaches_course','course_in_department','advises_student','coordinates_program','student_in_department') NOT NULL,
	`category` enum('identity','demographics','programs','courses','grades','attendance','academic_info','advisors') NOT NULL,
	CONSTRAINT `ux_role_data_access_idx` UNIQUE INDEX(`role_id`,`relationship`,`category`)
);
--> statement-breakpoint
ALTER TABLE `role_capabilities` ADD CONSTRAINT `role_capabilities_role_id_roles_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `role_data_access` ADD CONSTRAINT `role_data_access_role_id_roles_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE;