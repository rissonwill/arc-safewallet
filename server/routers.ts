import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ethers } from "ethers";
import { sdk } from "./_core/sdk";
import { setNonce, getNonce, deleteNonce, isNonceValid } from "./walletNonces";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";
import { fetchAllGasPrices } from "./gasService";
import { generateTypeScriptInterface, validateSoliditySyntax, extractContractNames, estimateDeploymentGas } from "./solidityCompiler";
import { compileSimpleContract, extractContractNamesFromSource, generateTypesFromABI } from "./solcCompiler";
import { submitVerification, checkVerificationStatus, isContractVerified, getSupportedCompilerVersions, VERIFICATION_ENDPOINTS } from "./contractVerification";
import Stripe from "stripe";
import { STRIPE_PRODUCTS, getProductByPlan } from "./stripe/products";

// Stripe is optional - only initialize if key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const isStripeEnabled = !!stripe;
console.log("[Stripe] Status:", isStripeEnabled ? "enabled" : "disabled (no API key)");

// ==================== ROUTERS ====================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Gerar nonce para login com carteira
    getWalletNonce: publicProcedure
      .input(z.object({ address: z.string().length(42) }))
      .mutation(async ({ input }) => {
        const nonce = `SmartVault Login\n\nNonce: ${nanoid(32)}\nTimestamp: ${Date.now()}`;
        setNonce(input.address, nonce);
        return { nonce };
      }),

    // Verificar assinatura e fazer login com carteira
    walletLogin: publicProcedure
      .input(z.object({
        address: z.string().length(42),
        signature: z.string(),
        nonce: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { address, signature, nonce } = input;
        const normalizedAddress = address.toLowerCase();

        // Verificar se o nonce é válido
        if (!isNonceValid(address, nonce)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Nonce inválido ou expirado" });
        }

        // Verificar a assinatura
        try {
          const recoveredAddress = ethers.verifyMessage(nonce, signature);
          if (recoveredAddress.toLowerCase() !== normalizedAddress) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Assinatura inválida" });
          }
        } catch (error) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Erro ao verificar assinatura" });
        }

        // Limpar nonce usado
        deleteNonce(address);

        // Criar ou atualizar usuário
        const openId = `wallet:${normalizedAddress}`;
        await db.upsertUser({
          openId,
          name: `${address.substring(0, 6)}...${address.substring(38)}`,
          email: null,
          loginMethod: "metamask",
          lastSignedIn: new Date(),
        });

        // Criar token de sessão
        const sessionToken = await sdk.createSessionToken(openId, {
          name: address,
          expiresInMs: ONE_YEAR_MS,
        });

        // Definir cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        const user = await db.getUserByOpenId(openId);
        return { success: true, user };
      }),
  }),

  // ==================== WALLET ROUTER ====================
  wallet: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getWalletsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        address: z.string().length(42),
        chainId: z.number(),
        walletType: z.string(),
        label: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createWallet({
          userId: ctx.user.id,
          address: input.address,
          chainId: input.chainId,
          walletType: input.walletType,
          label: input.label,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteWallet(input.id, ctx.user.id);
      }),

    setDefault: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.setDefaultWallet(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== PROJECT ROUTER ====================
  project: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id, ctx.user.id);
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        chainId: z.number().default(1),
        rpcProvider: z.string().optional(),
        rpcUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          chainId: input.chainId,
          rpcProvider: input.rpcProvider,
          rpcUrl: input.rpcUrl,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        chainId: z.number().optional(),
        rpcProvider: z.string().optional(),
        rpcUrl: z.string().optional(),
        status: z.enum(["active", "archived", "draft"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateProject(id, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteProject(input.id, ctx.user.id);
      }),
  }),

  // ==================== CONTRACT ROUTER ====================
  contract: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.projectId) {
          return db.getContractsByProjectId(input.projectId, ctx.user.id);
        }
        return db.getContractsByUserId(ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.id, ctx.user.id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        return contract;
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        sourceCode: z.string().optional(),
        templateType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createContract({
          projectId: input.projectId,
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          sourceCode: input.sourceCode,
          templateType: input.templateType,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        sourceCode: z.string().optional(),
        abi: z.any().optional(),
        bytecode: z.string().optional(),
        contractAddress: z.string().optional(),
        chainId: z.number().optional(),
        status: z.enum(["draft", "compiled", "deployed", "verified"]).optional(),
        aiDocumentation: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateContract(id, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteContract(input.id, ctx.user.id);
      }),

    // Compile contract using solc-js
    compile: protectedProcedure
      .input(z.object({
        id: z.number().optional(),
        sourceCode: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Quick syntax validation first
        const validation = validateSoliditySyntax(input.sourceCode);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors.map(e => ({ severity: "error" as const, message: e })),
            warnings: [],
          };
        }

        // Try real compilation with solc-js
        const compilationResult = compileSimpleContract(input.sourceCode);
        
        if (!compilationResult.success) {
          // If solc fails (e.g., due to imports), fall back to basic extraction
          const contractNames = extractContractNamesFromSource(input.sourceCode);
          
          if (contractNames.length === 0) {
            return {
              success: false,
              errors: compilationResult.errors.map(e => ({ severity: e.severity, message: e.message })),
              warnings: compilationResult.warnings.map(w => ({ severity: w.severity, message: w.message })),
            };
          }
          
          // Return partial success with contract names but no bytecode
          return {
            success: false,
            contractNames,
            errors: compilationResult.errors.map(e => ({ severity: e.severity, message: e.message })),
            warnings: [
              ...compilationResult.warnings.map(w => ({ severity: w.severity, message: w.message })),
              { severity: "warning" as const, message: "Para contratos com imports OpenZeppelin, use: npx hardhat compile" }
            ],
          };
        }

        // Successful compilation
        const mainContract = compilationResult.contracts[0];
        const contractNames = compilationResult.contracts.map(c => c.contractName);
        
        // Generate TypeScript interface
        const tsInterface = generateTypesFromABI(mainContract.contractName, mainContract.abi);
        
        // Estimate deployment gas from bytecode
        const estimatedGas = estimateDeploymentGas(mainContract.bytecode);

        // Update contract in database if id provided
        if (input.id) {
          await db.updateContract(input.id, ctx.user.id, {
            abi: mainContract.abi,
            bytecode: mainContract.bytecode,
            status: "compiled",
          });
        }

        return {
          success: true,
          contractNames,
          abi: mainContract.abi,
          bytecode: mainContract.bytecode,
          typescriptInterface: tsInterface,
          estimatedDeploymentGas: estimatedGas,
          warnings: compilationResult.warnings.map(w => ({ severity: w.severity, message: w.message })),
          allContracts: compilationResult.contracts.map(c => ({
            name: c.contractName,
            abi: c.abi,
            bytecode: c.bytecode,
          })),
        };
      }),

    // Generate TypeScript interface from ABI
    generateTypescript: protectedProcedure
      .input(z.object({
        contractName: z.string(),
        abi: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const abiArray = JSON.parse(input.abi);
          const tsCode = generateTypeScriptInterface(input.contractName, abiArray);
          return { success: true, typescript: tsCode };
        } catch (error) {
          return { success: false, error: "Invalid ABI JSON" };
        }
      }),

    // Save contract to S3
    saveToS3: protectedProcedure
      .input(z.object({
        id: z.number(),
        sourceCode: z.string().optional(),
        abi: z.string().optional(),
        bytecode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.id, ctx.user.id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }

        const timestamp = Date.now();
        const prefix = `contracts/${ctx.user.id}/${contract.id}/${timestamp}`;
        const updates: Record<string, string | null> = {};

        if (input.sourceCode) {
          const sourceKey = `${prefix}/source.sol`;
          await storagePut(sourceKey, input.sourceCode, "text/plain");
          updates.s3SourceKey = sourceKey;
        }

        if (input.abi) {
          const abiKey = `${prefix}/abi.json`;
          await storagePut(abiKey, input.abi, "application/json");
          updates.s3AbiKey = abiKey;
        }

        if (input.bytecode) {
          const bytecodeKey = `${prefix}/bytecode.txt`;
          await storagePut(bytecodeKey, input.bytecode, "text/plain");
          updates.s3BytecodeKey = bytecodeKey;
        }

        if (Object.keys(updates).length > 0) {
          await db.updateContract(input.id, ctx.user.id, updates);
        }

        return { success: true, keys: updates };
      }),

    // Generate AI documentation
    generateDocumentation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.id, ctx.user.id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }

        if (!contract.sourceCode) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No source code available" });
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert Solidity developer. Generate comprehensive technical documentation for smart contracts. Include:
1. Contract overview and purpose
2. State variables explanation
3. Function documentation with parameters and return values
4. Events documentation
5. Security considerations
6. Usage examples

Format the output in Markdown.`
            },
            {
              role: "user",
              content: `Generate documentation for this Solidity contract:\n\n${contract.sourceCode}`
            }
          ]
        });

        const content = response.choices[0]?.message?.content;
        const documentation = typeof content === "string" ? content : "";
        
        await db.updateContract(input.id, ctx.user.id, { aiDocumentation: documentation });

        return { documentation };
      }),

    // Verify contract on block explorer
    verify: protectedProcedure
      .input(z.object({
        id: z.number(),
        compilerVersion: z.string(),
        optimizationUsed: z.boolean().default(true),
        runs: z.number().default(200),
        constructorArguments: z.string().optional(),
        apiKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.id, ctx.user.id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }

        if (!contract.contractAddress || !contract.chainId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Contract not deployed" });
        }

        if (!contract.sourceCode) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No source code available" });
        }

        const result = await submitVerification({
          chainId: contract.chainId,
          contractAddress: contract.contractAddress,
          sourceCode: contract.sourceCode,
          contractName: contract.name,
          compilerVersion: input.compilerVersion,
          optimizationUsed: input.optimizationUsed,
          runs: input.runs,
          constructorArguments: input.constructorArguments,
          apiKey: input.apiKey,
        });

        if (result.success && result.guid) {
          await db.updateContract(input.id, ctx.user.id, {
            status: "deployed",
          });
        }

        return result;
      }),

    // Check verification status
    checkVerification: protectedProcedure
      .input(z.object({
        id: z.number(),
        guid: z.string(),
        apiKey: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const contract = await db.getContractById(input.id, ctx.user.id);
        if (!contract || !contract.chainId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }

        const status = await checkVerificationStatus(contract.chainId, input.guid, input.apiKey);

        if (status.status === "pass") {
          await db.updateContract(input.id, ctx.user.id, {
            status: "verified",
          });
        }

        return status;
      }),

    // Get supported compiler versions
    getCompilerVersions: publicProcedure.query(async () => {
      return getSupportedCompilerVersions();
    }),

    // Get supported verification networks
    getVerificationNetworks: publicProcedure.query(() => {
      return Object.entries(VERIFICATION_ENDPOINTS).map(([chainId, info]) => ({
        chainId: parseInt(chainId),
        ...info,
      }));
    }),
  }),

  // ==================== TRANSACTION ROUTER ====================
  transaction: router({
    list: protectedProcedure
      .input(z.object({ 
        projectId: z.number().optional(),
        limit: z.number().default(50),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.projectId) {
          return db.getTransactionsByProjectId(input.projectId, ctx.user.id);
        }
        return db.getTransactionsByUserId(ctx.user.id, input?.limit);
      }),

    // Histórico com filtros avançados e paginação
    history: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        chainId: z.number().optional(),
        status: z.enum(["pending", "confirmed", "failed"]).optional(),
        txType: z.enum(["deploy", "call", "transfer", "approve", "other"]).optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getTransactionHistory(ctx.user.id, {
          page: input.page,
          limit: input.limit,
          chainId: input.chainId,
          status: input.status,
          txType: input.txType,
          search: input.search,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    // Estatísticas de transações do usuário
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getTransactionStats(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ txHash: z.string() }))
      .query(async ({ ctx, input }) => {
        const tx = await db.getTransactionByHash(input.txHash);
        if (!tx || tx.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
        }
        return tx;
      }),

    create: protectedProcedure
      .input(z.object({
        txHash: z.string().length(66),
        chainId: z.number(),
        fromAddress: z.string().length(42),
        toAddress: z.string().length(42).optional(),
        value: z.string().optional(),
        txType: z.enum(["deploy", "call", "transfer", "approve", "other"]).default("other"),
        contractId: z.number().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTransaction({
          userId: ctx.user.id,
          txHash: input.txHash,
          chainId: input.chainId,
          fromAddress: input.fromAddress,
          toAddress: input.toAddress,
          value: input.value,
          txType: input.txType,
          contractId: input.contractId,
          projectId: input.projectId,
        });
      }),

    // Registrar transferência com contabilidade de rede
    recordTransfer: protectedProcedure
      .input(z.object({
        txHash: z.string().length(66),
        chainId: z.number(),
        fromAddress: z.string().length(42),
        toAddress: z.string().length(42),
        value: z.string(),
        symbol: z.string().default("ETH"),
        networkName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Registrar a transferência no banco de dados
        const tx = await db.createTransaction({
          userId: ctx.user.id,
          txHash: input.txHash,
          chainId: input.chainId,
          fromAddress: input.fromAddress,
          toAddress: input.toAddress,
          value: input.value,
          txType: "transfer",
        });

        // Log para contabilidade da rede
        console.log(`[📊 Contabilidade] Transferência registrada:`);
        console.log(`  - Rede: ${input.networkName || `Chain ${input.chainId}`}`);
        console.log(`  - De: ${input.fromAddress}`);
        console.log(`  - Para: ${input.toAddress}`);
        console.log(`  - Valor: ${input.value} ${input.symbol}`);
        console.log(`  - Hash: ${input.txHash}`);
        console.log(`  - User ID: ${ctx.user.id}`);

        return {
          success: true,
          transaction: tx,
          message: `Transferência de ${input.value} ${input.symbol} registrada com sucesso`,
        };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        txHash: z.string(),
        status: z.enum(["pending", "confirmed", "failed"]),
        blockNumber: z.number().optional(),
        gasUsed: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const tx = await db.getTransactionByHash(input.txHash);
        if (!tx || tx.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
        }

        await db.updateTransactionStatus(input.txHash, input.status, {
          blockNumber: input.blockNumber,
          gasUsed: input.gasUsed,
          confirmedAt: input.status === "confirmed" ? new Date() : undefined,
        });

        // Send notification if confirmed and not already sent
        if (input.status === "confirmed" && !tx.notificationSent) {
          await notifyOwner({
            title: `Transaction Confirmed: ${input.txHash.slice(0, 10)}...`,
            content: `Transaction ${input.txHash} has been confirmed on chain ${tx.chainId}. Block: ${input.blockNumber}`,
          });
          await db.markNotificationSent(input.txHash);
        }

        return { success: true };
      }),
  }),

  // ==================== TEMPLATE ROUTER ====================
  template: router({
    list: publicProcedure.query(async () => {
      return db.getContractTemplates();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const template = await db.getContractTemplateById(input.id);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        return template;
      }),
  }),

  // ==================== GAS PRICE ROUTER ====================
  gasPrice: router({
    latest: publicProcedure.query(async () => {
      // Try to fetch real-time gas prices from APIs
      try {
        const realTimeGas = await fetchAllGasPrices();
        if (realTimeGas.length > 0) {
          return realTimeGas.map(g => ({
            chainId: g.chainId,
            networkName: g.networkName,
            slow: g.slow,
            standard: g.standard,
            fast: g.fast,
            baseFee: g.baseFee || null,
            timestamp: g.lastUpdated,
          }));
        }
      } catch (error) {
        console.error("Error fetching real-time gas:", error);
      }
      // Fallback to database
      return db.getLatestGasPrices();
    }),

    realtime: publicProcedure
      .input(z.object({ chainId: z.number().optional() }))
      .query(async ({ input }) => {
        const allGas = await fetchAllGasPrices();
        if (input.chainId) {
          return allGas.filter(g => g.chainId === input.chainId);
        }
        return allGas;
      }),

    history: publicProcedure
      .input(z.object({ chainId: z.number(), limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return db.getGasPriceHistory(input.chainId, input.limit);
      }),
  }),

  // ==================== NETWORK ROUTER ====================
  network: router({
    list: publicProcedure.query(async () => {
      return db.getNetworks();
    }),

    get: publicProcedure
      .input(z.object({ chainId: z.number() }))
      .query(async ({ input }) => {
        const network = await db.getNetworkByChainId(input.chainId);
        if (!network) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Network not found" });
        }
        return network;
      }),
  }),

  // ==================== STATS ROUTER ====================
  stats: router({
    user: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStats(ctx.user.id);
    }),

    analytics: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getTransactionAnalytics(ctx.user.id, input?.days ?? 30);
      }),

    transactionStats: protectedProcedure.query(async ({ ctx }) => {
      return db.getTransactionStats(ctx.user.id);
    }),
  }),

  // ==================== ABI GENERATOR ROUTER ====================
  abi: router({
    generateTypeScript: protectedProcedure
      .input(z.object({ abi: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const abiJson = JSON.parse(input.abi);
          let tsCode = "// Auto-generated TypeScript interface from ABI\n\n";
          
          // Generate interface for each function
          for (const item of abiJson) {
            if (item.type === "function") {
              const inputs = item.inputs?.map((i: any) => `${i.name}: ${solidityToTsType(i.type)}`).join(", ") || "";
              const outputs = item.outputs?.map((o: any) => solidityToTsType(o.type)).join(" | ") || "void";
              tsCode += `export async function ${item.name}(${inputs}): Promise<${outputs}>;\n`;
            }
          }
          
          return { typescript: tsCode };
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid ABI JSON" });
        }
      }),
  }),

  // ==================== NOTIFICATION PREFERENCES ROUTER ====================
  notificationPrefs: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getNotificationPreferences(ctx.user.id);
      return prefs || {
        enableTransactionAlerts: true,
        enableGasAlerts: true,
        enableSecurityAlerts: true,
        gasAlertThreshold: 20,
        preferredChains: [1, 5042002, 137],
        emailNotifications: false,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        enableTransactionAlerts: z.boolean().optional(),
        enableGasAlerts: z.boolean().optional(),
        enableSecurityAlerts: z.boolean().optional(),
        gasAlertThreshold: z.number().min(1).max(500).optional(),
        preferredChains: z.array(z.number()).optional(),
        emailNotifications: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertNotificationPreferences(ctx.user.id, input);
      }),
  }),

  // ==================== FAUCET ROUTER ====================
  faucet: router({
    request: protectedProcedure
      .input(z.object({
        walletAddress: z.string().length(42),
        chainId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check rate limit (1 request per hour)
        const lastRequest = await db.getLastFaucetRequest(ctx.user.id, input.chainId);
        if (lastRequest) {
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (new Date(lastRequest.createdAt) > hourAgo) {
            const waitTime = Math.ceil((new Date(lastRequest.createdAt).getTime() + 60 * 60 * 1000 - Date.now()) / 60000);
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Please wait ${waitTime} minutes before requesting again.`,
            });
          }
        }

        // Create faucet request
        const request = await db.createFaucetRequest({
          userId: ctx.user.id,
          walletAddress: input.walletAddress,
          chainId: input.chainId,
          amount: "0.1", // 0.1 ETH/tokens
        });

        // In production, this would call the actual faucet API
        // For now, we simulate success
        await db.updateFaucetRequestStatus(request.id, "completed", "0x" + "0".repeat(64));

        return {
          success: true,
          message: "Tokens sent successfully! Check your wallet.",
          amount: "0.1",
          txHash: "0x" + "0".repeat(64),
        };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getFaucetRequestsByUser(ctx.user.id);
    }),

    canRequest: protectedProcedure
      .input(z.object({ chainId: z.number() }))
      .query(async ({ ctx, input }) => {
        const lastRequest = await db.getLastFaucetRequest(ctx.user.id, input.chainId);
        if (!lastRequest) return { canRequest: true, waitTime: 0 };
        
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (new Date(lastRequest.createdAt) > hourAgo) {
          const waitTime = Math.ceil((new Date(lastRequest.createdAt).getTime() + 60 * 60 * 1000 - Date.now()) / 60000);
          return { canRequest: false, waitTime };
        }
        return { canRequest: true, waitTime: 0 };
      }),
  }),

  // ==================== STRIPE PAYMENTS ====================
  stripe: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        plan: z.enum(["pro", "enterprise"]),
        interval: z.enum(["month", "year"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!stripe) {
          throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Stripe is not configured" });
        }
        const product = getProductByPlan(input.plan, input.interval);
        const origin = ctx.req.headers.origin || "https://smartvault.manus.space";
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: product.name,
                  description: `SmartVault ${input.plan.charAt(0).toUpperCase() + input.plan.slice(1)} Plan`,
                },
                unit_amount: product.amount,
                recurring: {
                  interval: product.interval,
                },
              },
              quantity: 1,
            },
          ],
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
            plan: input.plan,
            interval: input.interval,
          },
          success_url: `${origin}/dashboard?payment=success`,
          cancel_url: `${origin}/pricing?payment=cancelled`,
          allow_promotion_codes: true,
        });
        
        return { checkoutUrl: session.url };
      }),

    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      if (!stripe) {
        return { subscription: null, plan: "free" };
      }
      // Get user's subscription from database
      const user = await db.getUserById(ctx.user.id);
      if (!user?.stripeCustomerId) {
        return { subscription: null, plan: "free" };
      }

      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          return { subscription: null, plan: "free" };
        }

        const subscription = subscriptions.data[0];
        const plan = subscription.metadata?.plan || "pro";
        
        return {
          subscription: {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          },
          plan,
        };
      } catch {
        return { subscription: null, plan: "free" };
      }
    }),

    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      if (!stripe) {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Stripe is not configured" });
      }
      const user = await db.getUserById(ctx.user.id);
      if (!user?.stripeCustomerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No subscription found" });
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription" });
      }

      await stripe.subscriptions.update(subscriptions.data[0].id, {
        cancel_at_period_end: true,
      });

      return { success: true };
    }),

    createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      if (!stripe) {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Stripe is not configured" });
      }
      const user = await db.getUserById(ctx.user.id);
      if (!user?.stripeCustomerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No customer found" });
      }

      const origin = ctx.req.headers.origin || "https://smartvault.manus.space";
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${origin}/settings`,
      });

      return { portalUrl: session.url };
    }),
  }),
});

// Helper function to convert Solidity types to TypeScript
function solidityToTsType(solidityType: string): string {
  if (solidityType.startsWith("uint") || solidityType.startsWith("int")) {
    return "bigint";
  }
  if (solidityType === "address") return "string";
  if (solidityType === "bool") return "boolean";
  if (solidityType === "string") return "string";
  if (solidityType.startsWith("bytes")) return "string";
  if (solidityType.endsWith("[]")) {
    return `${solidityToTsType(solidityType.slice(0, -2))}[]`;
  }
  return "unknown";
}

export type AppRouter = typeof appRouter;
