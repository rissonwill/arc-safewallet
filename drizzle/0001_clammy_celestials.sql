CREATE TABLE `contractTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`templateType` varchar(32) NOT NULL,
	`sourceCode` text NOT NULL,
	`defaultParams` json,
	`category` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`sourceCode` text,
	`abi` json,
	`bytecode` text,
	`contractAddress` varchar(42),
	`chainId` int,
	`templateType` varchar(32),
	`version` varchar(20) NOT NULL DEFAULT '1.0.0',
	`s3SourceKey` text,
	`s3AbiKey` text,
	`s3BytecodeKey` text,
	`aiDocumentation` text,
	`deployedAt` timestamp,
	`status` enum('draft','compiled','deployed','verified') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gasPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chainId` int NOT NULL,
	`slow` varchar(32) NOT NULL,
	`standard` varchar(32) NOT NULL,
	`fast` varchar(32) NOT NULL,
	`baseFee` varchar(32),
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gasPrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chainId` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`rpcUrl` text,
	`explorerUrl` text,
	`isTestnet` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`iconUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `networks_id` PRIMARY KEY(`id`),
	CONSTRAINT `networks_chainId_unique` UNIQUE(`chainId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`chainId` int NOT NULL DEFAULT 1,
	`rpcProvider` varchar(32),
	`rpcUrl` text,
	`status` enum('active','archived','draft') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contractId` int,
	`projectId` int,
	`txHash` varchar(66) NOT NULL,
	`chainId` int NOT NULL,
	`fromAddress` varchar(42) NOT NULL,
	`toAddress` varchar(42),
	`value` varchar(78),
	`gasUsed` varchar(32),
	`gasPrice` varchar(32),
	`blockNumber` int,
	`txType` enum('deploy','call','transfer','approve','other') NOT NULL DEFAULT 'other',
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`notificationSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` varchar(42) NOT NULL,
	`chainId` int NOT NULL,
	`walletType` varchar(32) NOT NULL,
	`label` varchar(100),
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
