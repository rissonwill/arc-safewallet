import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Web3 Wallets connected to users
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  address: varchar("address", { length: 42 }).notNull(),
  chainId: int("chainId").notNull(),
  walletType: varchar("walletType", { length: 32 }).notNull(), // metamask, walletconnect, arc
  label: varchar("label", { length: 100 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

// Web3 Projects
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  chainId: int("chainId").default(1).notNull(), // Default to Ethereum mainnet
  rpcProvider: varchar("rpcProvider", { length: 32 }), // alchemy, quicknode, blockdaemon
  rpcUrl: text("rpcUrl"),
  status: mysqlEnum("status", ["active", "archived", "draft"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Smart Contracts
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  sourceCode: text("sourceCode"), // Solidity source code
  abi: json("abi"), // Compiled ABI
  bytecode: text("bytecode"), // Compiled bytecode
  contractAddress: varchar("contractAddress", { length: 42 }),
  chainId: int("chainId"),
  templateType: varchar("templateType", { length: 32 }), // erc20, erc721, erc1155, custom
  version: varchar("version", { length: 20 }).default("1.0.0").notNull(),
  s3SourceKey: text("s3SourceKey"), // S3 key for source code
  s3AbiKey: text("s3AbiKey"), // S3 key for ABI
  s3BytecodeKey: text("s3BytecodeKey"), // S3 key for bytecode
  aiDocumentation: text("aiDocumentation"), // LLM-generated documentation
  deployedAt: timestamp("deployedAt"),
  status: mysqlEnum("status", ["draft", "compiled", "deployed", "verified"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// Blockchain Transactions
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contractId: int("contractId"),
  projectId: int("projectId"),
  txHash: varchar("txHash", { length: 66 }).notNull(),
  chainId: int("chainId").notNull(),
  fromAddress: varchar("fromAddress", { length: 42 }).notNull(),
  toAddress: varchar("toAddress", { length: 42 }),
  value: varchar("value", { length: 78 }), // Wei value as string
  gasUsed: varchar("gasUsed", { length: 32 }),
  gasPrice: varchar("gasPrice", { length: 32 }),
  blockNumber: int("blockNumber"),
  txType: mysqlEnum("txType", ["deploy", "call", "transfer", "approve", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  notificationSent: boolean("notificationSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Contract Templates
export const contractTemplates = mysqlTable("contractTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  templateType: varchar("templateType", { length: 32 }).notNull(), // erc20, erc721, erc1155
  sourceCode: text("sourceCode").notNull(),
  defaultParams: json("defaultParams"), // Default constructor parameters
  category: varchar("category", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = typeof contractTemplates.$inferInsert;

// Gas Price History for monitoring
export const gasPrices = mysqlTable("gasPrices", {
  id: int("id").autoincrement().primaryKey(),
  chainId: int("chainId").notNull(),
  slow: varchar("slow", { length: 32 }).notNull(),
  standard: varchar("standard", { length: 32 }).notNull(),
  fast: varchar("fast", { length: 32 }).notNull(),
  baseFee: varchar("baseFee", { length: 32 }),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type GasPrice = typeof gasPrices.$inferSelect;
export type InsertGasPrice = typeof gasPrices.$inferInsert;

// Network configurations
export const networks = mysqlTable("networks", {
  id: int("id").autoincrement().primaryKey(),
  chainId: int("chainId").notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  rpcUrl: text("rpcUrl"),
  explorerUrl: text("explorerUrl"),
  isTestnet: boolean("isTestnet").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  iconUrl: text("iconUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Network = typeof networks.$inferSelect;
export type InsertNetwork = typeof networks.$inferInsert;
