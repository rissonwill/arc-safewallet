import axios from "axios";

// Gas price data structure
export interface GasPriceData {
  chainId: number;
  networkName: string;
  slow: number;
  standard: number;
  fast: number;
  baseFee?: number;
  lastUpdated: Date;
}

// Etherscan API response
interface EtherscanGasResponse {
  status: string;
  message: string;
  result: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee?: string;
  };
}

// Fetch gas prices from Etherscan API (works for Ethereum Mainnet and Sepolia)
export async function fetchEtherscanGas(
  apiKey?: string,
  network: "mainnet" | "sepolia" = "mainnet"
): Promise<GasPriceData | null> {
  try {
    const baseUrl = network === "sepolia" 
      ? "https://api-sepolia.etherscan.io/api"
      : "https://api.etherscan.io/api";
    
    const url = `${baseUrl}?module=gastracker&action=gasoracle${apiKey ? `&apikey=${apiKey}` : ""}`;
    
    const response = await axios.get<EtherscanGasResponse>(url, { timeout: 5000 });
    
    if (response.data.status === "1" && response.data.result) {
      const result = response.data.result;
      return {
        chainId: network === "sepolia" ? 11155111 : 1,
        networkName: network === "sepolia" ? "Sepolia Testnet" : "Ethereum Mainnet",
        slow: parseInt(result.SafeGasPrice),
        standard: parseInt(result.ProposeGasPrice),
        fast: parseInt(result.FastGasPrice),
        baseFee: result.suggestBaseFee ? parseFloat(result.suggestBaseFee) : undefined,
        lastUpdated: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching gas from Etherscan (${network}):`, error);
    return null;
  }
}

// Fetch gas prices from Polygon Gas Station
export async function fetchPolygonGas(): Promise<GasPriceData | null> {
  try {
    const response = await axios.get("https://gasstation.polygon.technology/v2", { timeout: 5000 });
    
    if (response.data) {
      return {
        chainId: 137,
        networkName: "Polygon",
        slow: Math.round(response.data.safeLow?.maxFee || 30),
        standard: Math.round(response.data.standard?.maxFee || 50),
        fast: Math.round(response.data.fast?.maxFee || 80),
        baseFee: response.data.estimatedBaseFee,
        lastUpdated: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching gas from Polygon:", error);
    return null;
  }
}

// Fetch gas prices from BSC (uses fixed low gas)
export async function fetchBSCGas(): Promise<GasPriceData> {
  // BSC has relatively stable gas prices
  return {
    chainId: 56,
    networkName: "BNB Smart Chain",
    slow: 3,
    standard: 5,
    fast: 7,
    lastUpdated: new Date(),
  };
}

// Fetch gas prices for Arc Network (simulated for testnet)
export async function fetchArcNetworkGas(): Promise<GasPriceData> {
  // Arc Network testnet - simulated low gas prices
  return {
    chainId: 1516,
    networkName: "Arc Network Testnet",
    slow: 1,
    standard: 2,
    fast: 3,
    lastUpdated: new Date(),
  };
}

// Fetch gas prices from Arbitrum
export async function fetchArbitrumGas(): Promise<GasPriceData | null> {
  try {
    // Arbitrum uses L1 gas + L2 execution
    const response = await axios.post(
      "https://arb1.arbitrum.io/rpc",
      {
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      },
      { timeout: 5000 }
    );
    
    if (response.data?.result) {
      const gasPrice = parseInt(response.data.result, 16) / 1e9; // Convert to Gwei
      return {
        chainId: 42161,
        networkName: "Arbitrum One",
        slow: Math.round(gasPrice * 0.8),
        standard: Math.round(gasPrice),
        fast: Math.round(gasPrice * 1.2),
        lastUpdated: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching gas from Arbitrum:", error);
    return null;
  }
}

// Fetch all gas prices
export async function fetchAllGasPrices(etherscanApiKey?: string): Promise<GasPriceData[]> {
  const results: GasPriceData[] = [];
  
  // Fetch in parallel
  const [ethereum, sepolia, polygon, bsc, arc, arbitrum] = await Promise.allSettled([
    fetchEtherscanGas(etherscanApiKey, "mainnet"),
    fetchEtherscanGas(etherscanApiKey, "sepolia"),
    fetchPolygonGas(),
    fetchBSCGas(),
    fetchArcNetworkGas(),
    fetchArbitrumGas(),
  ]);
  
  if (ethereum.status === "fulfilled" && ethereum.value) {
    results.push(ethereum.value);
  }
  
  if (sepolia.status === "fulfilled" && sepolia.value) {
    results.push(sepolia.value);
  }
  
  if (polygon.status === "fulfilled" && polygon.value) {
    results.push(polygon.value);
  }
  
  if (bsc.status === "fulfilled" && bsc.value) {
    results.push(bsc.value);
  }
  
  if (arc.status === "fulfilled" && arc.value) {
    results.push(arc.value);
  }
  
  if (arbitrum.status === "fulfilled" && arbitrum.value) {
    results.push(arbitrum.value);
  }
  
  return results;
}

// Calculate estimated transaction cost
export function calculateTxCost(
  gasPrice: number, // in Gwei
  gasLimit: number,
  nativeTokenPrice: number // in USD
): { eth: number; usd: number } {
  const ethCost = (gasPrice * gasLimit) / 1e9;
  const usdCost = ethCost * nativeTokenPrice;
  return { eth: ethCost, usd: usdCost };
}
