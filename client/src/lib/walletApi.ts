// ============================================
// ARC SAFEWALLET - WALLET API SERVICE
// Arc Testnet + Sepolia Networks
// ============================================

import { ethers, formatUnits as ethersFormatUnits, parseUnits as ethersParseUnits, BigNumberish } from 'ethers';

// Selecione "Ethereum Mainnet" como rede base para compatibilidade

// Tipos para TypeScript - usando any para compatibilidade
interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress?: string;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    CustomNetworks?: typeof CustomNetworks;
    ethers?: any;
    Web3?: any;
  }
}

// ============================================
// CONFIGURAÇÕES DAS REDES CUSTOMIZADAS
// ============================================

export const NETWORKS = {
  arcTestnet: {
    chainId: '0x4CEF52', // 5042002 em decimal
    chainIdDecimal: 5042002,
    chainName: 'Arc Testnet',
    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6
    },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app'],
    iconUrls: [],
    // Informações extras
    faucetUrl: 'https://faucet.circle.com/',
    isTestnet: true,
    isCustom: true
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 em decimal
    chainIdDecimal: 11155111,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconUrls: [],
    // Informações extras
    faucetUrl: 'https://sepoliafaucet.com/',
    isTestnet: true,
    isCustom: true
  }
};

export type NetworkKey = keyof typeof NETWORKS;
export type NetworkConfig = typeof NETWORKS[NetworkKey];

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: string;
  currentNetwork: NetworkKey | null;
  networkInfo: NetworkConfig | null;
}

export interface GasEstimate {
  gasEstimate: string;
  gasPrice: string;
  gasCost: string;
  symbol: string;
}

export interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  network: NetworkKey;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface DetectedNetwork {
  key?: NetworkKey;
  network?: NetworkConfig;
  chainId?: string;
  isCustom: boolean;
}

// ============================================
// ESTADO INTERNO
// ============================================

let walletState: WalletState = {
  isConnected: false,
  account: null,
  balance: '0',
  currentNetwork: null,
  networkInfo: null
};

let transactionHistory: TransactionRecord[] = [];

// ============================================
// FUNÇÃO: ADICIONAR REDE CUSTOMIZADA
// ============================================

async function addCustomNetwork(networkKey: NetworkKey): Promise<boolean> {
  const network = NETWORKS[networkKey];
  
  if (!network) {
    throw new Error(`Rede ${networkKey} não encontrada`);
  }

  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não detectado');
  }

  try {
    // Tentar adicionar a rede
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: network.chainId,
        chainName: network.chainName,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: network.rpcUrls,
        blockExplorerUrls: network.blockExplorerUrls
      }]
    });

    console.log(`✅ Rede ${network.chainName} adicionada com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao adicionar ${network.chainName}:`, error);
    throw error;
  }
}

// ============================================
// FUNÇÃO: TROCAR PARA REDE CUSTOMIZADA
// ============================================

async function switchToCustomNetwork(networkKey: NetworkKey): Promise<boolean> {
  const network = NETWORKS[networkKey];
  
  if (!network) {
    throw new Error(`Rede ${networkKey} não encontrada`);
  }

  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não detectado');
  }

  try {
    // Tentar trocar para a rede
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }]
    });

    console.log(`✅ Conectado à ${network.chainName}`);
    
    // Atualizar estado
    walletState.currentNetwork = networkKey;
    walletState.networkInfo = network;
    
    // Atualizar saldo
    if (walletState.account) {
      await updateBalance();
    }
    
    return true;
  } catch (error: any) {
    // Se a rede não existe (erro 4902), adicionar primeiro
    if (error.code === 4902) {
      console.log(`⚠️ Rede não encontrada. Adicionando ${network.chainName}...`);
      await addCustomNetwork(networkKey);
      // Tentar trocar novamente após adicionar
      return switchToCustomNetwork(networkKey);
    } else {
      console.error(`❌ Erro ao trocar para ${network.chainName}:`, error);
      throw error;
    }
  }
}

// ============================================
// FUNÇÃO: DETECTAR REDE ATUAL
// ============================================

async function detectCurrentNetwork(): Promise<DetectedNetwork | null> {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Verificar se é uma das nossas redes customizadas
    for (const [key, network] of Object.entries(NETWORKS)) {
      if (network.chainId.toLowerCase() === chainId.toLowerCase()) {
        walletState.currentNetwork = key as NetworkKey;
        walletState.networkInfo = network;
        return {
          key: key as NetworkKey,
          network: network,
          isCustom: true
        };
      }
    }

    // Se não for customizada, retornar info genérica
    walletState.currentNetwork = null;
    walletState.networkInfo = null;
    return {
      chainId: chainId,
      isCustom: false
    };
  } catch (error) {
    console.error('Erro ao detectar rede:', error);
    return null;
  }
}

// ============================================
// FUNÇÃO: SETUP INICIAL
// ============================================

async function setupCustomNetworks(): Promise<boolean> {
  console.log('🚀 Iniciando setup de redes customizadas...');

  if (typeof window.ethereum === 'undefined') {
    console.warn('⚠️ MetaMask não detectado');
    return false;
  }

  // Detectar rede atual
  const currentNetwork = await detectCurrentNetwork();
  
  if (currentNetwork && currentNetwork.isCustom) {
    console.log(`✅ Já conectado em rede customizada: ${currentNetwork.network?.chainName}`);
  } else {
    console.log('ℹ️ Conectado em rede padrão. Use switchToCustomNetwork() para trocar.');
  }

  // Escutar mudanças de rede
  window.ethereum.on('chainChanged', async (chainId: string) => {
    console.log('🔄 Rede mudou:', chainId);
    const network = await detectCurrentNetwork();
    if (network && network.isCustom) {
      console.log(`Agora conectado em: ${network.network?.chainName}`);
    }
    // Atualizar saldo quando mudar de rede
    if (walletState.account) {
      await updateBalance();
    }
  });

  // Escutar mudanças de conta
  window.ethereum.on('accountsChanged', async (accounts: string[]) => {
    console.log('🔄 Conta mudou:', accounts);
    if (accounts.length > 0) {
      walletState.account = accounts[0];
      walletState.isConnected = true;
      await updateBalance();
    } else {
      walletState.account = null;
      walletState.isConnected = false;
      walletState.balance = '0';
    }
  });

  return true;
}

// ============================================
// FUNÇÃO: OBTER PROVIDER DA REDE ATUAL
// ============================================

async function getCurrentProvider(): Promise<ethers.BrowserProvider> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não detectado');
  }

  // Usar ethers.js v6
  return new ethers.BrowserProvider(window.ethereum as any);
}

/**
 * Obter signer para assinar transações
 */
async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = await getCurrentProvider();
  return await provider.getSigner();
}

/**
 * Criar instância de contrato
 */
function getContract(
  address: string,
  abi: ethers.InterfaceAbi,
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  return new ethers.Contract(address, abi, signerOrProvider);
}

/**
 * Formatar valor para wei/unidades
 */
function parseUnitsLocal(value: string, decimals: number = 18): bigint {
  return ethersParseUnits(value, decimals);
}

/**
 * Formatar wei/unidades para valor legível
 */
function formatUnitsLocal(value: BigNumberish, decimals: number = 18): string {
  return ethersFormatUnits(value, decimals);
}

// ============================================
// FUNÇÕES DE CARTEIRA
// ============================================

async function connectWallet(): Promise<string> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não detectado. Por favor, instale a extensão.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts && accounts.length > 0) {
      walletState.account = accounts[0];
      walletState.isConnected = true;
      
      // Detectar rede atual
      const currentNetwork = await detectCurrentNetwork();
      
      // AUTO-ADICIONAR REDE ARC: Se não estiver em uma rede customizada, adicionar Arc Testnet automaticamente
      if (!currentNetwork || !currentNetwork.isCustom) {
        console.log('🔄 Auto-adicionando rede Arc Testnet...');
        try {
          await addCustomNetwork('arcTestnet');
          console.log('✅ Rede Arc Testnet adicionada automaticamente!');
          // Perguntar se quer trocar para Arc
          const shouldSwitch = window.confirm(
            'Rede Arc Testnet foi adicionada à sua carteira!\n\nDeseja trocar para a rede Arc Testnet agora?'
          );
          if (shouldSwitch) {
            await switchToCustomNetwork('arcTestnet');
          }
        } catch (addError: any) {
          // Se já existe, apenas log
          if (addError.code !== 4001) { // 4001 = user rejected
            console.log('ℹ️ Rede Arc já pode estar adicionada:', addError.message);
          }
        }
      }
      
      // Atualizar saldo
      await updateBalance();
      
      console.log(`✅ Carteira conectada: ${shortenAddress(accounts[0])}`);
      return accounts[0];
    }

    throw new Error('Nenhuma conta encontrada');
  } catch (error: any) {
    console.error('Erro ao conectar carteira:', error);
    throw error;
  }
}

function disconnectWallet(): void {
  walletState = {
    isConnected: false,
    account: null,
    balance: '0',
    currentNetwork: null,
    networkInfo: null
  };
  console.log('✅ Carteira desconectada');
}

async function updateBalance(): Promise<string> {
  if (!walletState.account || typeof window.ethereum === 'undefined') {
    return '0';
  }

  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletState.account, 'latest']
    });

    const decimals = walletState.networkInfo?.nativeCurrency.decimals || 18;
    const balanceInUnits = parseInt(balance, 16) / Math.pow(10, decimals);
    walletState.balance = balanceInUnits.toFixed(decimals === 6 ? 2 : 4);
    
    return walletState.balance;
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    return '0';
  }
}

// ============================================
// FUNÇÕES DE TRANSAÇÃO
// ============================================

async function sendTransaction(to: string, amount: string): Promise<TransactionRecord> {
  if (!walletState.account || typeof window.ethereum === 'undefined') {
    throw new Error('Carteira não conectada');
  }

  if (!walletState.networkInfo) {
    throw new Error('Rede não detectada');
  }

  const decimals = walletState.networkInfo.nativeCurrency.decimals;
  const valueInWei = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
  const valueHex = '0x' + valueInWei.toString(16);

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletState.account,
        to: to,
        value: valueHex
      }]
    });

    const txRecord: TransactionRecord = {
      hash: txHash,
      from: walletState.account,
      to: to,
      value: amount,
      symbol: walletState.networkInfo.nativeCurrency.symbol,
      network: walletState.currentNetwork!,
      timestamp: Date.now(),
      status: 'pending'
    };

    transactionHistory.unshift(txRecord);
    console.log(`✅ Transação enviada: ${txHash}`);
    
    // CONTABILIDADE: Registrar transferência na rede via API
    try {
      console.log(`[📊 Contabilidade] Registrando transferência...`);
      console.log(`  - Rede: ${walletState.networkInfo.chainName}`);
      console.log(`  - De: ${walletState.account}`);
      console.log(`  - Para: ${to}`);
      console.log(`  - Valor: ${amount} ${walletState.networkInfo.nativeCurrency.symbol}`);
      console.log(`  - Hash: ${txHash}`);
      
      // Disparar evento customizado para que o frontend possa registrar via tRPC
      const transferEvent = new CustomEvent('arcTransferComplete', {
        detail: {
          txHash,
          chainId: walletState.networkInfo.chainIdDecimal,
          fromAddress: walletState.account,
          toAddress: to,
          value: amount,
          symbol: walletState.networkInfo.nativeCurrency.symbol,
          networkName: walletState.networkInfo.chainName,
        }
      });
      window.dispatchEvent(transferEvent);
    } catch (accountingError) {
      console.warn('⚠️ Erro ao registrar contabilidade:', accountingError);
    }
    
    // Atualizar saldo após transação
    setTimeout(() => updateBalance(), 3000);
    
    return txRecord;
  } catch (error: any) {
    console.error('Erro ao enviar transação:', error);
    throw error;
  }
}

async function estimateGas(to: string, amount: string): Promise<GasEstimate> {
  if (!walletState.account || typeof window.ethereum === 'undefined') {
    throw new Error('Carteira não conectada');
  }

  if (!walletState.networkInfo) {
    throw new Error('Rede não detectada');
  }

  const decimals = walletState.networkInfo.nativeCurrency.decimals;
  const valueInWei = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
  const valueHex = '0x' + valueInWei.toString(16);

  try {
    const [gasEstimate, gasPrice] = await Promise.all([
      window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          from: walletState.account,
          to: to,
          value: valueHex
        }]
      }),
      window.ethereum.request({
        method: 'eth_gasPrice'
      })
    ]);

    const gasEstimateNum = parseInt(gasEstimate, 16);
    const gasPriceNum = parseInt(gasPrice, 16);
    const gasCostWei = gasEstimateNum * gasPriceNum;
    const gasCost = gasCostWei / Math.pow(10, decimals);

    return {
      gasEstimate: gasEstimateNum.toString(),
      gasPrice: (gasPriceNum / 1e9).toFixed(2) + ' Gwei',
      gasCost: gasCost.toFixed(decimals === 6 ? 4 : 6),
      symbol: walletState.networkInfo.nativeCurrency.symbol
    };
  } catch (error: any) {
    console.error('Erro ao estimar gas:', error);
    throw error;
  }
}

// ============================================
// FUNÇÕES DE ASSINATURA
// ============================================

async function signMessage(message: string): Promise<string> {
  if (!walletState.account || typeof window.ethereum === 'undefined') {
    throw new Error('Carteira não conectada');
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletState.account]
    });

    console.log(`✅ Mensagem assinada`);
    return signature;
  } catch (error: any) {
    console.error('Erro ao assinar mensagem:', error);
    throw error;
  }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isMetaMaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask === true;
}

function getWalletState(): WalletState {
  return { ...walletState };
}

function getTransactionHistory(): TransactionRecord[] {
  return [...transactionHistory];
}

// ============================================
// INTERFACE SIMPLIFICADA
// ============================================

export const CustomNetworks = {
  // Redes disponíveis
  networks: NETWORKS,
  
  // Funções principais
  addArcTestnet: () => addCustomNetwork('arcTestnet'),
  addSepolia: () => addCustomNetwork('sepolia'),
  switchToArc: () => switchToCustomNetwork('arcTestnet'),
  switchToSepolia: () => switchToCustomNetwork('sepolia'),
  detectNetwork: detectCurrentNetwork,
  getProvider: getCurrentProvider,
  
  // Setup inicial
  setup: setupCustomNetworks
};

// ============================================
// WALLET API EXPORT
// ============================================

export const WalletAPI = {
  // Conexão
  connectWallet,
  disconnectWallet,
  isMetaMaskInstalled,
  
  // Estado
  getWalletState,
  getTransactionHistory,
  updateBalance,
  
  // Redes
  switchNetwork: switchToCustomNetwork,
  addNetwork: addCustomNetwork,
  detectNetwork: detectCurrentNetwork,
  setupNetworks: setupCustomNetworks,
  
  // Provider e Contratos (ethers.js)
  getProvider: getCurrentProvider,
  getSigner,
  getContract,
  
  // Utilitários de formatação (ethers.js)
  parseUnits: parseUnitsLocal,
  formatUnits: formatUnitsLocal,
  
  // Transações
  sendTransaction,
  estimateGas,
  signMessage,
  
  // Utilitários
  shortenAddress,
  isValidAddress,
  
  // Redes disponíveis
  NETWORKS,
  
  // Referência ao ethers.js
  ethers
};

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================

// Executar setup quando a página carregar
if (typeof window !== 'undefined') {
  // Registrar interface global
  window.CustomNetworks = CustomNetworks;
  
  // Auto-setup quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await setupCustomNetworks();
      console.log('✅ Redes customizadas prontas!');
      console.log('📖 Use: CustomNetworks.switchToArc() ou CustomNetworks.switchToSepolia()');
    });
  } else {
    // DOM já carregado
    setupCustomNetworks().then(() => {
      console.log('✅ Redes customizadas prontas!');
      console.log('📖 Use: CustomNetworks.switchToArc() ou CustomNetworks.switchToSepolia()');
    });
  }
}

export default WalletAPI;
