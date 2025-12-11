/**
 * Endereços dos contratos deployados
 * Atualizado automaticamente pelo script de deploy
 */

export const ARC_TESTNET_CONTRACTS = {
  chainId: 5042002,
  network: "arc-testnet",
  
  // Contratos principais
  ArcToken: "0x7D54337E4AA62fbccf6061315F68e4Bc29EBea5D",
  ArcNFT: "0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC",
  ArcMarketplace: "0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7",
  ArcVault: "0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2",
} as const;

export const SEPOLIA_CONTRACTS = {
  chainId: 11155111,
  network: "sepolia",
  
  // Contratos principais
  ArcToken: "0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC",
  ArcNFT: "0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7",
  ArcMarketplace: "0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2",
  ArcVault: "0xBE21597B385F299CbBF71725823A5E1aD810973f",
  
  // Governança
  ArcTimelock: "0x3A0671E9E966213D3d73ed1841E33879B37146fe",
  ArcGovernance: "0x693405999755d7Fea40D635ddE861AAc462EC1f8",
} as const;

export const GOVERNANCE_CONFIG = {
  votingDelay: 7200, // ~1 dia em blocos
  votingPeriod: 50400, // ~1 semana em blocos
  proposalThreshold: "1000", // 1000 ARC
  quorum: 4, // 4%
  timelockDelay: 86400, // 24 horas em segundos
} as const;

// Função helper para obter endereço por chainId
type ContractName = 'ArcToken' | 'ArcNFT' | 'ArcMarketplace' | 'ArcVault' | 'ArcTimelock' | 'ArcGovernance';

export function getContractAddress(chainId: number, contractName: ContractName): string | null {
  if (chainId === 11155111) {
    return SEPOLIA_CONTRACTS[contractName];
  }
  return null;
}

// Etherscan links
export function getEtherscanLink(chainId: number, address: string, type: 'address' | 'tx' = 'address'): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/${type}/${address}`;
}
