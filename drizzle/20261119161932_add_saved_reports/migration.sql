CREATE TABLE `saved_reports` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`page` varchar(100) NOT NULL,
	`search` json NOT NULL,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `ux_saved_reports_name_idx` UNIQUE INDEX(`user_id`,`name`),
	CONSTRAINT `saved_reports_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
