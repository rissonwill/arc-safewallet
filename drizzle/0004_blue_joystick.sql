ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('free','pro','enterprise') DEFAULT 'free' NOT NULL;