import { notifyOwner } from "./_core/notification";
import * as db from "./db";
import { fetchAllGasPrices } from "./gasService";

// Configurações de alertas
const GAS_ALERT_THRESHOLDS = {
  5042002: { low: 5, medium: 10 }, // Arc Testnet (USDC)
  1: { low: 20, medium: 50 }, // Ethereum Mainnet (Gwei)
  137: { low: 30, medium: 100 }, // Polygon
  56: { low: 3, medium: 5 }, // BSC
  42161: { low: 0.1, medium: 0.5 }, // Arbitrum
};

const NETWORK_NAMES: Record<number, string> = {
  5042002: "Arc Testnet",
  1: "Ethereum Mainnet",
  137: "Polygon",
  56: "BSC",
  42161: "Arbitrum",
  11155111: "Sepolia Testnet",
};

// Notificar quando transação for confirmada
export async function notifyTransactionConfirmed(
  txHash: string,
  chainId: number,
  fromAddress: string,
  toAddress: string | null,
  value: string | null,
  txType: string
): Promise<boolean> {
  const networkName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  
  let title = `Transaction Confirmed on ${networkName}`;
  let content = `Your transaction ${shortHash} has been confirmed.\n\n`;
  
  content += `Type: ${txType}\n`;
  content += `From: ${fromAddress}\n`;
  if (toAddress) content += `To: ${toAddress}\n`;
  if (value && value !== "0") {
    const ethValue = parseFloat(value) / 1e18;
    content += `Value: ${ethValue.toFixed(6)} ETH\n`;
  }
  
  content += `\nView on explorer: ${getExplorerUrl(chainId, txHash)}`;
  
  return notifyOwner({ title, content });
}

// Notificar quando transação falhar
export async function notifyTransactionFailed(
  txHash: string,
  chainId: number,
  reason?: string
): Promise<boolean> {
  const networkName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  
  const title = `Transaction Failed on ${networkName}`;
  let content = `Your transaction ${shortHash} has failed.\n\n`;
  
  if (reason) {
    content += `Reason: ${reason}\n\n`;
  }
  
  content += `View on explorer: ${getExplorerUrl(chainId, txHash)}`;
  
  return notifyOwner({ title, content });
}

// Notificar quando gas estiver baixo
export async function notifyLowGas(chainId: number, currentGas: number): Promise<boolean> {
  const networkName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
  const threshold = GAS_ALERT_THRESHOLDS[chainId as keyof typeof GAS_ALERT_THRESHOLDS];
  
  if (!threshold) return false;
  
  const title = `Low Gas Alert: ${networkName}`;
  const content = `Gas prices on ${networkName} are currently low!\n\n` +
    `Current gas: ${currentGas} Gwei\n` +
    `This is a good time to make transactions.\n\n` +
    `Threshold: < ${threshold.low} Gwei`;
  
  return notifyOwner({ title, content });
}

// Verificar transações pendentes e notificar
export async function checkPendingTransactions(): Promise<void> {
  try {
    const pendingTxs = await db.getPendingTransactions();
    
    for (const tx of pendingTxs) {
      // Aqui você poderia verificar o status real na blockchain
      // Por enquanto, apenas logamos
      console.log(`[Notification] Checking pending tx: ${tx.txHash}`);
    }
  } catch (error) {
    console.error("[Notification] Error checking pending transactions:", error);
  }
}

// Verificar preços de gas e notificar se estiver baixo
export async function checkGasPricesAndNotify(): Promise<void> {
  try {
    const gasPrices = await fetchAllGasPrices();
    
    for (const [chainIdStr, prices] of Object.entries(gasPrices)) {
      const chainId = parseInt(chainIdStr);
      const threshold = GAS_ALERT_THRESHOLDS[chainId as keyof typeof GAS_ALERT_THRESHOLDS];
      
      if (!threshold) continue;
      
      const currentGas = typeof prices.standard === 'number' ? prices.standard : parseFloat(String(prices.standard));
      
      if (currentGas < threshold.low) {
        await notifyLowGas(chainId, Math.round(currentGas));
      }
    }
  } catch (error) {
    console.error("[Notification] Error checking gas prices:", error);
  }
}

// Helper para obter URL do explorer
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    5042002: "https://testnet.arcscan.app",
    11155111: "https://sepolia.etherscan.io",
    137: "https://polygonscan.com",
    56: "https://bscscan.com",
    42161: "https://arbiscan.io",
  };
  
  const baseUrl = explorers[chainId] || "https://etherscan.io";
  return `${baseUrl}/tx/${txHash}`;
}

// Exportar tipos para uso externo
export type NotificationConfig = {
  enableTransactionAlerts: boolean;
  enableGasAlerts: boolean;
  gasAlertThreshold: number;
  preferredChains: number[];
};
