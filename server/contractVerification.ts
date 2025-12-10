/**
 * Contract Verification Service
 * Handles verification of deployed contracts on block explorers
 */

import axios from "axios";

// Supported networks for verification
export const VERIFICATION_ENDPOINTS: Record<number, { api: string; explorer: string; name: string }> = {
  1: {
    api: "https://api.etherscan.io/api",
    explorer: "https://etherscan.io",
    name: "Ethereum Mainnet",
  },
  11155111: {
    api: "https://api-sepolia.etherscan.io/api",
    explorer: "https://sepolia.etherscan.io",
    name: "Sepolia Testnet",
  },
  137: {
    api: "https://api.polygonscan.com/api",
    explorer: "https://polygonscan.com",
    name: "Polygon",
  },
  80001: {
    api: "https://api-testnet.polygonscan.com/api",
    explorer: "https://mumbai.polygonscan.com",
    name: "Mumbai Testnet",
  },
  56: {
    api: "https://api.bscscan.com/api",
    explorer: "https://bscscan.com",
    name: "BNB Smart Chain",
  },
  42161: {
    api: "https://api.arbiscan.io/api",
    explorer: "https://arbiscan.io",
    name: "Arbitrum One",
  },
  10: {
    api: "https://api-optimistic.etherscan.io/api",
    explorer: "https://optimistic.etherscan.io",
    name: "Optimism",
  },
};

// Verification request interface
export interface VerificationRequest {
  chainId: number;
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs?: number;
  constructorArguments?: string;
  apiKey?: string;
}

// Verification response interface
export interface VerificationResponse {
  success: boolean;
  message: string;
  guid?: string;
  explorerUrl?: string;
}

// Check verification status interface
export interface VerificationStatus {
  status: "pending" | "pass" | "fail" | "unknown";
  message: string;
}

/**
 * Submit contract for verification on Etherscan-compatible explorers
 */
export async function submitVerification(
  request: VerificationRequest
): Promise<VerificationResponse> {
  const endpoint = VERIFICATION_ENDPOINTS[request.chainId];
  
  if (!endpoint) {
    return {
      success: false,
      message: `Verification not supported for chain ID ${request.chainId}`,
    };
  }
  
  if (!request.apiKey) {
    return {
      success: false,
      message: "API key required for contract verification. Get one from the block explorer.",
    };
  }
  
  try {
    const params = new URLSearchParams({
      apikey: request.apiKey,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: request.contractAddress,
      sourceCode: request.sourceCode,
      codeformat: "solidity-single-file",
      contractname: request.contractName,
      compilerversion: request.compilerVersion,
      optimizationUsed: request.optimizationUsed ? "1" : "0",
      runs: (request.runs || 200).toString(),
      constructorArguements: request.constructorArguments || "",
    });
    
    const response = await axios.post(endpoint.api, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
    });
    
    if (response.data.status === "1") {
      return {
        success: true,
        message: "Verification submitted successfully",
        guid: response.data.result,
        explorerUrl: `${endpoint.explorer}/address/${request.contractAddress}#code`,
      };
    } else {
      return {
        success: false,
        message: response.data.result || "Verification failed",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to submit verification",
    };
  }
}

/**
 * Check verification status using GUID
 */
export async function checkVerificationStatus(
  chainId: number,
  guid: string,
  apiKey: string
): Promise<VerificationStatus> {
  const endpoint = VERIFICATION_ENDPOINTS[chainId];
  
  if (!endpoint) {
    return {
      status: "unknown",
      message: `Chain ID ${chainId} not supported`,
    };
  }
  
  try {
    const response = await axios.get(endpoint.api, {
      params: {
        apikey: apiKey,
        module: "contract",
        action: "checkverifystatus",
        guid: guid,
      },
      timeout: 10000,
    });
    
    if (response.data.status === "1") {
      return {
        status: "pass",
        message: "Contract verified successfully",
      };
    } else if (response.data.result === "Pending in queue") {
      return {
        status: "pending",
        message: "Verification pending in queue",
      };
    } else {
      return {
        status: "fail",
        message: response.data.result || "Verification failed",
      };
    }
  } catch (error: any) {
    return {
      status: "unknown",
      message: error.message || "Failed to check status",
    };
  }
}

/**
 * Check if a contract is already verified
 */
export async function isContractVerified(
  chainId: number,
  contractAddress: string,
  apiKey?: string
): Promise<{ verified: boolean; sourceCode?: string }> {
  const endpoint = VERIFICATION_ENDPOINTS[chainId];
  
  if (!endpoint) {
    return { verified: false };
  }
  
  try {
    const params: Record<string, string> = {
      module: "contract",
      action: "getsourcecode",
      address: contractAddress,
    };
    
    if (apiKey) {
      params.apikey = apiKey;
    }
    
    const response = await axios.get(endpoint.api, {
      params,
      timeout: 10000,
    });
    
    if (response.data.status === "1" && response.data.result?.[0]) {
      const result = response.data.result[0];
      const isVerified = result.SourceCode && result.SourceCode !== "";
      
      return {
        verified: isVerified,
        sourceCode: isVerified ? result.SourceCode : undefined,
      };
    }
    
    return { verified: false };
  } catch (error) {
    return { verified: false };
  }
}

/**
 * Get supported compiler versions from Etherscan
 */
export async function getSupportedCompilerVersions(
  chainId: number = 1
): Promise<string[]> {
  // Common Solidity versions
  return [
    "v0.8.20+commit.a1b79de6",
    "v0.8.19+commit.7dd6d404",
    "v0.8.18+commit.87f61d96",
    "v0.8.17+commit.8df45f5f",
    "v0.8.16+commit.07a7930e",
    "v0.8.15+commit.e14f2714",
    "v0.8.14+commit.80d49f37",
    "v0.8.13+commit.abaa5c0e",
    "v0.8.12+commit.f00d7308",
    "v0.8.11+commit.d7f03943",
    "v0.8.10+commit.fc410830",
    "v0.8.9+commit.e5eed63a",
    "v0.8.8+commit.dddeac2f",
    "v0.8.7+commit.e28d00a7",
    "v0.8.6+commit.11564f7e",
    "v0.8.5+commit.a4f2e591",
    "v0.8.4+commit.c7e474f2",
    "v0.8.3+commit.8d00100c",
    "v0.8.2+commit.661d1103",
    "v0.8.1+commit.df193b15",
    "v0.8.0+commit.c7dfd78e",
    "v0.7.6+commit.7338295f",
    "v0.7.5+commit.eb77ed08",
    "v0.6.12+commit.27d51765",
  ];
}

/**
 * Generate flattened source code (simple version)
 * In production, use a proper flattener like truffle-flattener
 */
export function flattenSourceCode(
  mainSource: string,
  imports: Record<string, string> = {}
): string {
  let flattened = mainSource;
  
  // Remove import statements and replace with actual code
  const importRegex = /import\s+["']([^"']+)["'];/g;
  let match;
  
  while ((match = importRegex.exec(mainSource)) !== null) {
    const importPath = match[1];
    const importCode = imports[importPath];
    
    if (importCode) {
      // Remove the import statement
      flattened = flattened.replace(match[0], "");
      // Add the imported code at the beginning (after pragma)
      const pragmaEnd = flattened.indexOf(";") + 1;
      flattened = flattened.slice(0, pragmaEnd) + "\n\n" + importCode + "\n" + flattened.slice(pragmaEnd);
    }
  }
  
  return flattened;
}
