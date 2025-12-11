import { eq, and, desc, sql, or, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertWallet, wallets, Wallet,
  InsertProject, projects, Project,
  InsertContract, contracts, Contract,
  InsertTransaction, transactions, Transaction,
  InsertContractTemplate, contractTemplates, ContractTemplate,
  InsertGasPrice, gasPrices, GasPrice,
  InsertNetwork, networks, Network
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER QUERIES ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== WALLET QUERIES ====================

export async function createWallet(wallet: InsertWallet): Promise<Wallet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(wallets).values(wallet).$returningId();
  const [created] = await db.select().from(wallets).where(eq(wallets.id, result.id));
  return created;
}

export async function getWalletsByUserId(userId: number): Promise<Wallet[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(wallets).where(eq(wallets.userId, userId)).orderBy(desc(wallets.createdAt));
}

export async function deleteWallet(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(wallets).where(and(eq(wallets.id, id), eq(wallets.userId, userId)));
  return true;
}

export async function setDefaultWallet(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(wallets).set({ isDefault: false }).where(eq(wallets.userId, userId));
  await db.update(wallets).set({ isDefault: true }).where(and(eq(wallets.id, id), eq(wallets.userId, userId)));
}

// ==================== PROJECT QUERIES ====================

export async function createProject(project: InsertProject): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(projects).values(project).$returningId();
  const [created] = await db.select().from(projects).where(eq(projects.id, result.id));
  return created;
}

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: number, userId: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [result] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return result;
}

export async function updateProject(id: number, userId: number, data: Partial<InsertProject>): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(projects).set(data).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return getProjectById(id, userId);
}

export async function deleteProject(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return true;
}

// ==================== CONTRACT QUERIES ====================

export async function createContract(contract: InsertContract): Promise<Contract> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(contracts).values(contract).$returningId();
  const [created] = await db.select().from(contracts).where(eq(contracts.id, result.id));
  return created;
}

export async function getContractsByProjectId(projectId: number, userId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contracts)
    .where(and(eq(contracts.projectId, projectId), eq(contracts.userId, userId)))
    .orderBy(desc(contracts.updatedAt));
}

export async function getContractsByUserId(userId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contracts).where(eq(contracts.userId, userId)).orderBy(desc(contracts.updatedAt));
}

export async function getContractById(id: number, userId: number): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [result] = await db.select().from(contracts).where(and(eq(contracts.id, id), eq(contracts.userId, userId)));
  return result;
}

export async function updateContract(id: number, userId: number, data: Partial<InsertContract>): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(contracts).set(data).where(and(eq(contracts.id, id), eq(contracts.userId, userId)));
  return getContractById(id, userId);
}

export async function deleteContract(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.userId, userId)));
  return true;
}

// ==================== TRANSACTION QUERIES ====================

export async function createTransaction(tx: InsertTransaction): Promise<Transaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(transactions).values(tx).$returningId();
  const [created] = await db.select().from(transactions).where(eq(transactions.id, result.id));
  return created;
}

export async function getTransactionsByUserId(userId: number, limit = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionsByProjectId(projectId: number, userId: number): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transactions)
    .where(and(eq(transactions.projectId, projectId), eq(transactions.userId, userId)))
    .orderBy(desc(transactions.createdAt));
}

export async function getTransactionByHash(txHash: string): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [result] = await db.select().from(transactions).where(eq(transactions.txHash, txHash));
  return result;
}

export async function updateTransactionStatus(
  txHash: string, 
  status: "pending" | "confirmed" | "failed",
  data?: { blockNumber?: number; gasUsed?: string; confirmedAt?: Date }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(transactions)
    .set({ status, ...data })
    .where(eq(transactions.txHash, txHash));
}

export async function markNotificationSent(txHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(transactions)
    .set({ notificationSent: true })
    .where(eq(transactions.txHash, txHash));
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transactions).where(eq(transactions.status, "pending"));
}

// Histórico de transações com filtros e paginação
export async function getTransactionHistory(
  userId: number,
  options: {
    page: number;
    limit: number;
    chainId?: number;
    status?: "pending" | "confirmed" | "failed";
    txType?: "deploy" | "call" | "transfer" | "approve" | "other";
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ transactions: Transaction[]; total: number; page: number; totalPages: number }> {
  const db = await getDb();
  if (!db) return { transactions: [], total: 0, page: 1, totalPages: 0 };

  const conditions = [eq(transactions.userId, userId)];
  
  if (options.chainId) {
    conditions.push(eq(transactions.chainId, options.chainId));
  }
  if (options.status) {
    conditions.push(eq(transactions.status, options.status));
  }
  if (options.txType) {
    conditions.push(eq(transactions.txType, options.txType));
  }
  if (options.search) {
    conditions.push(
      or(
        like(transactions.txHash, `%${options.search}%`),
        like(transactions.fromAddress, `%${options.search}%`),
        like(transactions.toAddress, `%${options.search}%`)
      )!
    );
  }
  if (options.startDate) {
    conditions.push(gte(transactions.createdAt, options.startDate));
  }
  if (options.endDate) {
    conditions.push(lte(transactions.createdAt, options.endDate));
  }

  const whereClause = and(...conditions);
  
  // Count total
  const [countResult] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(whereClause);
  const total = countResult?.count || 0;
  
  // Get paginated results
  const offset = (options.page - 1) * options.limit;
  const results = await db.select().from(transactions)
    .where(whereClause)
    .orderBy(desc(transactions.createdAt))
    .limit(options.limit)
    .offset(offset);

  return {
    transactions: results,
    total,
    page: options.page,
    totalPages: Math.ceil(total / options.limit),
  };
}

// Estatísticas de transações do usuário
export async function getTransactionStats(userId: number): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  byChain: { chainId: number; count: number }[];
  byType: { txType: string; count: number }[];
}> {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, confirmed: 0, failed: 0, byChain: [], byType: [] };

  // Total count
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  
  // By status
  const [pendingResult] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "pending")));
  
  const [confirmedResult] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "confirmed")));
  
  const [failedResult] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "failed")));

  // By chain
  const byChainResults = await db.select({
    chainId: transactions.chainId,
    count: sql<number>`count(*)`,
  })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.chainId);

  // By type
  const byTypeResults = await db.select({
    txType: transactions.txType,
    count: sql<number>`count(*)`,
  })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.txType);

  return {
    total: totalResult?.count || 0,
    pending: pendingResult?.count || 0,
    confirmed: confirmedResult?.count || 0,
    failed: failedResult?.count || 0,
    byChain: byChainResults,
    byType: byTypeResults,
  };
}

// ==================== CONTRACT TEMPLATE QUERIES ====================

export async function getContractTemplates(): Promise<ContractTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contractTemplates).where(eq(contractTemplates.isActive, true));
}

export async function getContractTemplateById(id: number): Promise<ContractTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [result] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
  return result;
}

export async function createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(contractTemplates).values(template).$returningId();
  const [created] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, result.id));
  return created;
}

// ==================== GAS PRICE QUERIES ====================

export async function recordGasPrice(gasPrice: InsertGasPrice): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(gasPrices).values(gasPrice);
}

export async function getLatestGasPrices(): Promise<GasPrice[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get latest gas price for each chain using subquery
  const result = await db.execute(sql`
    SELECT g1.* FROM gasPrices g1
    INNER JOIN (
      SELECT chainId, MAX(recordedAt) as maxDate
      FROM gasPrices
      GROUP BY chainId
    ) g2 ON g1.chainId = g2.chainId AND g1.recordedAt = g2.maxDate
  `);
  
  // MySQL2 returns [rows, fields] tuple
  const rows = Array.isArray(result) && result.length > 0 ? result[0] : [];
  return (Array.isArray(rows) ? rows : []) as GasPrice[];
}

export async function getGasPriceHistory(chainId: number, limit = 100): Promise<GasPrice[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(gasPrices)
    .where(eq(gasPrices.chainId, chainId))
    .orderBy(desc(gasPrices.recordedAt))
    .limit(limit);
}

// ==================== NETWORK QUERIES ====================

export async function getNetworks(): Promise<Network[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(networks).where(eq(networks.isActive, true));
}

export async function getNetworkByChainId(chainId: number): Promise<Network | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [result] = await db.select().from(networks).where(eq(networks.chainId, chainId));
  return result;
}

export async function upsertNetwork(network: InsertNetwork): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(networks).values(network).onDuplicateKeyUpdate({
    set: {
      name: network.name,
      symbol: network.symbol,
      rpcUrl: network.rpcUrl,
      explorerUrl: network.explorerUrl,
      isTestnet: network.isTestnet,
      isActive: network.isActive,
      iconUrl: network.iconUrl,
    }
  });
}

// ==================== STATS QUERIES ====================

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return { projects: 0, contracts: 0, transactions: 0, deployedContracts: 0 };
  
  const [projectCount] = await db.select({ count: sql<number>`count(*)` })
    .from(projects).where(eq(projects.userId, userId));
  
  const [contractCount] = await db.select({ count: sql<number>`count(*)` })
    .from(contracts).where(eq(contracts.userId, userId));
  
  const [txCount] = await db.select({ count: sql<number>`count(*)` })
    .from(transactions).where(eq(transactions.userId, userId));
  
  const [deployedCount] = await db.select({ count: sql<number>`count(*)` })
    .from(contracts).where(and(eq(contracts.userId, userId), eq(contracts.status, "deployed")));
  
  return {
    projects: Number(projectCount?.count) || 0,
    contracts: Number(contractCount?.count) || 0,
    transactions: Number(txCount?.count) || 0,
    deployedContracts: Number(deployedCount?.count) || 0,
  };
}
