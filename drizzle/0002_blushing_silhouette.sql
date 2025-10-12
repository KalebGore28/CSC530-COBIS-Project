ALTER TABLE `student_addresses` RENAME COLUMN `nation` TO `nation_code`;--> statement-breakpoint
ALTER TABLE `student_addresses` DROP FOREIGN KEY `fk_student_addresses_nation`;
--> statement-breakpoint
ALTER TABLE `student_addresses` ADD CONSTRAINT `fk_student_addresses_nation` FOREIGN KEY (`nation_code`) REFERENCES `nations`(`code`) ON DELETE no action ON UPDATE no action;