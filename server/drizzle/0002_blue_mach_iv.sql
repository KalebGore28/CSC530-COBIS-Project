PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_student_addresses` (
	`mnumber` text NOT NULL,
	`type` text NOT NULL,
	`street1` text NOT NULL,
	`street2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip` text NOT NULL,
	`nation` text NOT NULL,
	`phone` text NOT NULL,
	PRIMARY KEY(`mnumber`, `type`),
	FOREIGN KEY (`mnumber`) REFERENCES `students`(`mnumber`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nation`) REFERENCES `nations`(`code`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "address_type" CHECK("__new_student_addresses"."type" IN ('HOME', 'LOCAL'))
);
--> statement-breakpoint
INSERT INTO `__new_student_addresses`("mnumber", "type", "street1", "street2", "city", "state", "zip", "nation", "phone") SELECT "mnumber", "type", "street1", "street2", "city", "state", "zip", "nation_code", "phone" FROM `student_addresses`;--> statement-breakpoint
DROP TABLE `student_addresses`;--> statement-breakpoint
ALTER TABLE `__new_student_addresses` RENAME TO `student_addresses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;