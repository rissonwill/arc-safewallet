// ============================================
// ARC SAFEWALLET - WALLET API SERVICE
// ============================================

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
  }
}

// ============================================
// CONFIGURAÇÕES DAS REDES
// ============================================

export interface NetworkConfig {
  chainId: string;
  chainIdDecimal: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  faucetUrl: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  arcTestnet: {
    chainId: '0x4CEF52',
    chainIdDecimal: 5042002,
    chainName: 'Arc Testnet',
    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6
    },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app'],
    faucetUrl: 'https://faucet.circle.com/'
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainIdDecimal: 11155111,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    faucetUrl: 'https://sepoliafaucet.com/'
  }
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

export interface WalletState {
  account: string | null;
  currentNetwork: string | null;
  balance: string;
  isConnected: boolean;
  networkInfo: NetworkConfig | null;
}

interface InternalWalletState {
  account: string | null;
  currentNetwork: string | null;
  balance: string;
  transactions: TransactionRecord[];
}

export interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  network: string;
  timestamp: string;
  blockNumber: number;
}

export interface GasEstimate {
  gasEstimate: string;
  gasPrice: string;
  gasCost: string;
  symbol: string;
}

let walletState: InternalWalletState = {
  account: null,
  currentNetwork: null,
  balance: '0',
  transactions: []
};

// Event listeners storage
const eventListeners: {
  accountsChanged: ((accounts: string[]) => void) | null;
  chainChanged: ((chainId: string) => void) | null;
} = {
  accountsChanged: null,
  chainChanged: null
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function detectNetwork(chainId: number): void {
  const chainIdHex = '0x' + chainId.toString(16);
  
  if (chainIdHex.toLowerCase() === NETWORKS.arcTestnet.chainId.toLowerCase()) {
    walletState.currentNetwork = 'arcTestnet';
  } else if (chainIdHex.toLowerCase() === NETWORKS.sepolia.chainId.toLowerCase()) {
    walletState.currentNetwork = 'sepolia';
  } else {
    walletState.currentNetwork = null;
  }
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

function handleAccountsChanged(accounts: unknown): void {
  const accountsArray = accounts as string[];
  if (accountsArray.length === 0) {
    console.log('Conta desconectada');
    disconnectWallet();
  } else {
    console.log('Conta mudou para:', accountsArray[0]);
    walletState.account = accountsArray[0];
    updateBalance();
  }
}

async function handleChainChanged(chainId: unknown): Promise<void> {
  const chainIdStr = chainId as string;
  console.log('Rede mudou para:', chainIdStr);
  detectNetwork(parseInt(chainIdStr, 16));
  await updateBalance();
}

// ============================================
// CONEXÃO COM WALLET
// ============================================

export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não está instalado! Por favor, instale a extensão MetaMask.');
  }

  try {
    // Solicitar contas
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts'
    }) as string[];

    walletState.account = accounts[0];

    // Detectar rede atual
    const chainId = await window.ethereum!.request({
      method: 'eth_chainId'
    }) as string;
    
    detectNetwork(parseInt(chainId, 16));

    // Configurar listeners
    eventListeners.accountsChanged = handleAccountsChanged;
    eventListeners.chainChanged = handleChainChanged as (chainId: string) => void;
    
    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Atualizar saldo
    await updateBalance();

    console.log('Carteira conectada:', walletState.account);
    return walletState.account;
  } catch (error) {
    console.error('Erro ao conectar carteira:', error);
    throw error;
  }
}

// ============================================
// DESCONEXÃO
// ============================================

export function disconnectWallet(): void {
  walletState.account = null;
  walletState.currentNetwork = null;
  walletState.balance = '0';
  walletState.transactions = [];
  
  if (window.ethereum && eventListeners.accountsChanged) {
    window.ethereum.removeListener('accountsChanged', eventListeners.accountsChanged);
  }
  if (window.ethereum && eventListeners.chainChanged) {
    window.ethereum.removeListener('chainChanged', eventListeners.chainChanged);
  }
  
  eventListeners.accountsChanged = null;
  eventListeners.chainChanged = null;
  
  console.log('Carteira desconectada');
}

// ============================================
// ATUALIZAR SALDO
// ============================================

export async function updateBalance(): Promise<string> {
  if (!walletState.account) {
    throw new Error('Carteira não conectada');
  }

  try {
    const balance = await window.ethereum!.request({
      method: 'eth_getBalance',
      params: [walletState.account, 'latest']
    }) as string;
    
    const network = NETWORKS[walletState.currentNetwork || ''];
    
    if (network) {
      // Converter de hex para decimal e formatar
      const balanceWei = BigInt(balance);
      const divisor = BigInt(10 ** network.nativeCurrency.decimals);
      const balanceFormatted = Number(balanceWei) / Number(divisor);
      walletState.balance = balanceFormatted.toFixed(6);
    } else {
      // Fallback para ETH (18 decimais)
      const balanceWei = BigInt(balance);
      const divisor = BigInt(10 ** 18);
      const balanceFormatted = Number(balanceWei) / Number(divisor);
      walletState.balance = balanceFormatted.toFixed(6);
    }
    
    console.log('Saldo atualizado:', walletState.balance);
    return walletState.balance;
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    throw error;
  }
}

// ============================================
// TROCAR DE REDE
// ============================================

export async function switchNetwork(networkKey: string): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não está instalado!');
  }

  const network = NETWORKS[networkKey];
  if (!network) {
    throw new Error('Rede inválida. Use "arcTestnet" ou "sepolia".');
  }
  
  try {
    // Tentar trocar para a rede
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
    
    walletState.currentNetwork = networkKey;
    console.log(`Conectado à ${network.chainName}`);
    
    // Atualizar saldo após trocar de rede
    if (walletState.account) {
      await updateBalance();
    }
    
    return true;
  } catch (error: unknown) {
    const err = error as { code?: number };
    // Se a rede não existe (erro 4902), adicionar
    if (err.code === 4902) {
      return await addNetwork(networkKey);
    } else {
      console.error('Erro ao trocar rede:', error);
      throw error;
    }
  }
}

// ============================================
// ADICIONAR REDE AO METAMASK
// ============================================

export async function addNetwork(networkKey: string): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não está instalado!');
  }

  const network = NETWORKS[networkKey];
  if (!network) {
    throw new Error('Rede inválida. Use "arcTestnet" ou "sepolia".');
  }

  try {
    await window.ethereum!.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: network.chainId,
        chainName: network.chainName,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: network.rpcUrls,
        blockExplorerUrls: network.blockExplorerUrls
      }]
    });
    
    walletState.currentNetwork = networkKey;
    console.log(`Rede ${network.chainName} adicionada com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar rede:', error);
    throw error;
  }
}

// ============================================
// VALIDAR ENDEREÇO
// ============================================

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ============================================
// ENVIAR TRANSAÇÃO
// ============================================

export async function sendTransaction(recipientAddress: string, amount: string): Promise<TransactionRecord> {
  if (!walletState.account) {
    throw new Error('Carteira não conectada');
  }

  if (!walletState.currentNetwork) {
    throw new Error('Rede não suportada. Conecte-se ao Arc Testnet ou Sepolia');
  }

  // Validar endereço
  if (!isValidAddress(recipientAddress)) {
    throw new Error('Endereço do destinatário inválido');
  }

  // Validar quantidade
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Quantidade inválida');
  }

  try {
    const network = NETWORKS[walletState.currentNetwork];
    
    // Converter amount para wei/unidades menores
    const multiplier = BigInt(10 ** network.nativeCurrency.decimals);
    const amountBigInt = BigInt(Math.floor(amountNum * Number(multiplier)));
    const valueHex = '0x' + amountBigInt.toString(16);

    // Enviar transação
    const txHash = await window.ethereum!.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletState.account,
        to: recipientAddress,
        value: valueHex
      }]
    }) as string;

    console.log('Transação enviada:', txHash);

    // Criar registro da transação
    const txRecord: TransactionRecord = {
      hash: txHash,
      from: walletState.account,
      to: recipientAddress,
      value: amount,
      symbol: network.nativeCurrency.symbol,
      network: walletState.currentNetwork,
      timestamp: new Date().toISOString(),
      blockNumber: 0 // Será atualizado quando confirmado
    };

    // Adicionar ao histórico
    walletState.transactions.push(txRecord);

    // Atualizar saldo
    await updateBalance();

    return txRecord;
  } catch (error) {
    console.error('Erro ao enviar transação:', error);
    throw error;
  }
}

// ============================================
// ESTIMAR GAS
// ============================================

export async function estimateGas(recipientAddress: string, amount: string): Promise<GasEstimate> {
  if (!walletState.account) {
    throw new Error('Carteira não conectada');
  }

  if (!isValidAddress(recipientAddress)) {
    throw new Error('Endereço inválido');
  }

  try {
    const network = NETWORKS[walletState.currentNetwork || ''];
    const decimals = network?.nativeCurrency.decimals || 18;
    
    // Converter amount para wei
    const amountNum = parseFloat(amount);
    const multiplier = BigInt(10 ** decimals);
    const amountBigInt = BigInt(Math.floor(amountNum * Number(multiplier)));
    const valueHex = '0x' + amountBigInt.toString(16);

    // Estimar gas
    const gasEstimate = await window.ethereum!.request({
      method: 'eth_estimateGas',
      params: [{
        from: walletState.account,
        to: recipientAddress,
        value: valueHex
      }]
    }) as string;

    // Obter preço do gas
    const gasPrice = await window.ethereum!.request({
      method: 'eth_gasPrice'
    }) as string;

    // Calcular custo total
    const gasEstimateBigInt = BigInt(gasEstimate);
    const gasPriceBigInt = BigInt(gasPrice);
    const gasCostBigInt = gasEstimateBigInt * gasPriceBigInt;
    
    const gasCostFormatted = Number(gasCostBigInt) / Number(multiplier);

    console.log('Gas estimado:', parseInt(gasEstimate, 16));
    console.log('Custo do gas:', gasCostFormatted.toFixed(8), network?.nativeCurrency.symbol || 'ETH');

    return {
      gasEstimate: parseInt(gasEstimate, 16).toString(),
      gasPrice: parseInt(gasPrice, 16).toString(),
      gasCost: gasCostFormatted.toFixed(8),
      symbol: network?.nativeCurrency.symbol || 'ETH'
    };
  } catch (error) {
    console.error('Erro ao estimar gas:', error);
    throw error;
  }
}

// ============================================
// OBTER HISTÓRICO DE TRANSAÇÕES
// ============================================

export function getTransactionHistory(): TransactionRecord[] {
  return [...walletState.transactions];
}

// ============================================
// OBTER INFORMAÇÕES DA REDE ATUAL
// ============================================

export function getCurrentNetworkInfo(): NetworkConfig | null {
  if (!walletState.currentNetwork) {
    return null;
  }
  return NETWORKS[walletState.currentNetwork];
}

// ============================================
// OBTER ESTADO DA CARTEIRA
// ============================================

export function getWalletState(): WalletState {
  return {
    account: walletState.account,
    currentNetwork: walletState.currentNetwork,
    balance: walletState.balance,
    isConnected: !!walletState.account,
    networkInfo: getCurrentNetworkInfo()
  };
}

// ============================================
// VERIFICAR SE ESTÁ CONECTADO
// ============================================

export function isConnected(): boolean {
  return !!walletState.account;
}

// ============================================
// OBTER BLOCK NUMBER ATUAL
// ============================================

export async function getCurrentBlockNumber(): Promise<number> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não disponível');
  }

  try {
    const blockNumber = await window.ethereum!.request({
      method: 'eth_blockNumber'
    }) as string;
    
    const blockNum = parseInt(blockNumber, 16);
    console.log('Block number atual:', blockNum);
    return blockNum;
  } catch (error) {
    console.error('Erro ao obter block number:', error);
    throw error;
  }
}

// ============================================
// ASSINAR MENSAGEM
// ============================================

export async function signMessage(message: string): Promise<string> {
  if (!walletState.account) {
    throw new Error('Carteira não conectada');
  }

  try {
    const signature = await window.ethereum!.request({
      method: 'personal_sign',
      params: [message, walletState.account]
    }) as string;
    
    console.log('Mensagem assinada:', signature);
    return signature;
  } catch (error) {
    console.error('Erro ao assinar mensagem:', error);
    throw error;
  }
}

// ============================================
// VERIFICAR SALDO DE ENDEREÇO
// ============================================

export async function checkAddressBalance(address: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não disponível');
  }

  if (!isValidAddress(address)) {
    throw new Error('Endereço inválido');
  }

  try {
    const balance = await window.ethereum!.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    }) as string;
    
    const network = NETWORKS[walletState.currentNetwork || ''];
    const decimals = network?.nativeCurrency.decimals || 18;
    
    const balanceWei = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const balanceFormatted = Number(balanceWei) / Number(divisor);
    
    return balanceFormatted.toFixed(6);
  } catch (error) {
    console.error('Erro ao verificar saldo:', error);
    throw error;
  }
}

// ============================================
// OBTER TRANSAÇÃO POR HASH
// ============================================

export async function getTransaction(txHash: string): Promise<{
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number | null;
  status: 'pending' | 'confirmed' | 'failed';
}> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não disponível');
  }

  try {
    const tx = await window.ethereum!.request({
      method: 'eth_getTransactionByHash',
      params: [txHash]
    }) as {
      hash: string;
      from: string;
      to: string;
      value: string;
      blockNumber: string | null;
    } | null;

    if (!tx) {
      throw new Error('Transação não encontrada');
    }

    const receipt = await window.ethereum!.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    }) as { status: string; blockNumber: string } | null;

    let status: 'pending' | 'confirmed' | 'failed' = 'pending';
    if (receipt) {
      status = receipt.status === '0x1' ? 'confirmed' : 'failed';
    }

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : null,
      status
    };
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    throw error;
  }
}

// ============================================
// EXPORTAR API COMPLETA
// ============================================

export const WalletAPI = {
  // Conexão
  connectWallet,
  disconnectWallet,
  isConnected,
  isMetaMaskInstalled,
  
  // Redes
  switchNetwork,
  addNetwork,
  getCurrentNetworkInfo,
  
  // Saldo e informações
  updateBalance,
  getWalletState,
  checkAddressBalance,
  getCurrentBlockNumber,
  
  // Transações
  sendTransaction,
  estimateGas,
  getTransaction,
  getTransactionHistory,
  
  // Assinatura
  signMessage,
  
  // Utilitários
  shortenAddress,
  isValidAddress,
  
  // Constantes
  NETWORKS
};

export default WalletAPI;
