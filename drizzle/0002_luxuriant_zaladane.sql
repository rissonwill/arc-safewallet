CREATE TABLE `faucet_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAddress` varchar(42) NOT NULL,
	`chainId` int NOT NULL,
	`amount` varchar(78) NOT NULL,
	`txHash` varchar(66),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faucet_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enableTransactionAlerts` boolean NOT NULL DEFAULT true,
	`enableGasAlerts` boolean NOT NULL DEFAULT true,
	`enableSecurityAlerts` boolean NOT NULL DEFAULT true,
	`gasAlertThreshold` int NOT NULL DEFAULT 20,
	`preferredChains` json DEFAULT ('[1,5042002,137]'),
	`emailNotifications` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
