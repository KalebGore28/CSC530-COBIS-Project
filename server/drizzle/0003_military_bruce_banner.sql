PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_faculty` (
	`mnumber` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`college` text DEFAULT '0',
	`department` text DEFAULT '0000',
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_faculty`("mnumber", "first_name", "last_name", "college", "department") SELECT "mnumber", "first_name", "last_name", "college", "department" FROM `faculty`;--> statement-breakpoint
DROP TABLE `faculty`;--> statement-breakpoint
ALTER TABLE `__new_faculty` RENAME TO `faculty`;--> statement-breakpoint
PRAGMA foreign_keys=ON;