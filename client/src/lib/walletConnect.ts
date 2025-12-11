import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// WalletConnect Project ID - você pode obter um em https://cloud.walletconnect.com
// Para produção, substitua por seu próprio Project ID
const projectId = 'arc-safewallet-demo';

// Metadata do projeto
const metadata = {
  name: 'SmartVault',
  description: 'Plataforma Web3 para gerenciamento de smart contracts e governança DAO',
  url: 'https://arc-safewallet.manus.space',
  icons: ['https://arc-safewallet.manus.space/logo.png']
};

// Redes suportadas
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://eth.llamarpc.com'
};

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
};

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-rpc.com'
};

const arbitrum = {
  chainId: 42161,
  name: 'Arbitrum One',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io',
  rpcUrl: 'https://arb1.arbitrum.io/rpc'
};

const optimism = {
  chainId: 10,
  name: 'Optimism',
  currency: 'ETH',
  explorerUrl: 'https://optimistic.etherscan.io',
  rpcUrl: 'https://mainnet.optimism.io'
};

const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org'
};

const arcTestnet = {
  chainId: 5042002,
  name: 'Arc Testnet',
  currency: 'USDC',
  explorerUrl: 'https://explorer.testnet.arc.network',
  rpcUrl: 'https://rpc.testnet.arc.network'
};

// Configuração do ethers
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true, // Detecta carteiras injetadas automaticamente
  enableInjected: true, // Habilita MetaMask e outras carteiras injetadas
  enableCoinbase: true, // Habilita Coinbase Wallet
  // WalletConnect é habilitado automaticamente
});

// Criar modal Web3
let web3Modal: ReturnType<typeof createWeb3Modal> | null = null;

export function initWeb3Modal() {
  if (web3Modal) return web3Modal;
  
  try {
    web3Modal = createWeb3Modal({
      ethersConfig,
      chains: [mainnet, sepolia, polygon, arbitrum, optimism, base, arcTestnet],
      projectId,
      enableAnalytics: false,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#00D4FF',
        '--w3m-border-radius-master': '8px',
      },
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      ],
    });
    
    return web3Modal;
  } catch (error) {
    console.error('Erro ao inicializar Web3Modal:', error);
    return null;
  }
}

export function getWeb3Modal() {
  return web3Modal;
}

// Hook para usar o estado da conexão
export { useWeb3Modal, useWeb3ModalState, useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
