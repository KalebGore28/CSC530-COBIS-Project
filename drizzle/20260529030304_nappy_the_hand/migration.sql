ALTER TABLE `import_jobs` ADD `total_rows` int;--> statement-breakpoint
ALTER TABLE `import_jobs` ADD `error_count` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `import_jobs` ADD `warning_count` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `import_jobs` ADD `file_name` varchar(255);