CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_units` (
	`class_id` text NOT NULL,
	`unit_id` text NOT NULL,
	PRIMARY KEY(`class_id`, `unit_id`),
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`unit_id` text,
	`word_id` text,
	`kind` text NOT NULL,
	`correct` integer,
	`detail` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`occurred_at` integer NOT NULL,
	`processed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_student_time` ON `events` (`student_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`student_id` text NOT NULL,
	`word_id` text NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`due` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`student_id`, `word_id`),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_student_due` ON `reviews` (`student_id`,`due`);--> statement-breakpoint
CREATE TABLE `student_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_student` ON `student_sessions` (`student_id`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	`code_hash` text NOT NULL,
	`last_seen` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_students_code` ON `students` (`code_hash`);--> statement-breakpoint
CREATE INDEX `idx_students_class` ON `students` (`class_id`);--> statement-breakpoint
CREATE TABLE `unit_words` (
	`unit_id` text NOT NULL,
	`word_id` text NOT NULL,
	`sentence` text DEFAULT '' NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`unit_id`, `word_id`),
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`title` text NOT NULL,
	`readings` text DEFAULT '[]' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_units_book` ON `units` (`book_id`);--> statement-breakpoint
CREATE TABLE `words` (
	`id` text PRIMARY KEY NOT NULL,
	`en` text NOT NULL,
	`zh` text NOT NULL,
	`icon` text DEFAULT '📖' NOT NULL,
	`sentence` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'Lesson 单元' NOT NULL
);
