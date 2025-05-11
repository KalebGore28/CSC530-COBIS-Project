PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_courses` (
	`subject` text NOT NULL,
	`number` integer NOT NULL,
	`suffix` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`hours` integer NOT NULL,
	`fee` real DEFAULT 0 NOT NULL,
	`web_fee` real DEFAULT 0 NOT NULL,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`department` text DEFAULT '0000',
	`college` text DEFAULT '0',
	PRIMARY KEY(`subject`, `number`, `suffix`),
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_courses`("subject", "number", "suffix", "title", "hours", "fee", "web_fee", "last_updated", "department", "college") SELECT "subject", "number", "suffix", "title", "hours", "fee", "web_fee", "last_updated", "department", "college" FROM `courses`;--> statement-breakpoint
DROP TABLE `courses`;--> statement-breakpoint
ALTER TABLE `__new_courses` RENAME TO `courses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;