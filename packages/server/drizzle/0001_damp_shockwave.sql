ALTER TABLE `account` MODIFY COLUMN `access_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `refresh_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `created_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `updated_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `session` MODIFY COLUMN `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `session` MODIFY COLUMN `created_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `session` MODIFY COLUMN `updated_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `created_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `updated_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `last_login` datetime;--> statement-breakpoint
ALTER TABLE `verification` MODIFY COLUMN `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` MODIFY COLUMN `created_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` MODIFY COLUMN `updated_at` datetime NOT NULL;