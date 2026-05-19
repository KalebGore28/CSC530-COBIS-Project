CREATE TABLE `import_jobs` (
	`id` varchar(36) PRIMARY KEY,
	`status` enum('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
	`error` text,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`completed_at` datetime
);
