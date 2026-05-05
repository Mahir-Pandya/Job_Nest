CREATE TABLE `saved_candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employer_id` int NOT NULL,
	`applicant_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `saved_candidates` ADD CONSTRAINT `saved_candidates_employer_id_employers_id_fk` FOREIGN KEY (`employer_id`) REFERENCES `employers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_candidates` ADD CONSTRAINT `saved_candidates_applicant_id_applicants_id_fk` FOREIGN KEY (`applicant_id`) REFERENCES `applicants`(`id`) ON DELETE cascade ON UPDATE no action;