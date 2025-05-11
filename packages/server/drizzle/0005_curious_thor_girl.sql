CREATE TABLE `course_prefixes` (
	`prefix` text PRIMARY KEY NOT NULL,
	`department` text NOT NULL,
	`college` text NOT NULL,
	FOREIGN KEY (`department`) REFERENCES `departments`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college`) REFERENCES `colleges`(`code`) ON UPDATE no action ON DELETE no action
);
