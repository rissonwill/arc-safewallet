// Declaração de tipos para window.ethereum (MetaMask e outros providers)

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  selectedAddress?: string | null;
  chainId?: string;
  networkVersion?: string;
  
  // Métodos principais
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  
  // Event listeners
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  removeAllListeners: (event: string) => void;
  
  // Métodos legados (deprecated mas ainda usados)
  enable?: () => Promise<string[]>;
  send?: (method: string, params?: any[]) => Promise<any>;
  sendAsync?: (
    request: { method: string; params?: any[] },
    callback: (error: Error | null, response: any) => void
  ) => void;
}

interface Window {
  ethereum?: EthereumProvider;
  web3?: any;
  ethers?: any;
  Web3?: any;
  ManusCustomNetworks?: any;
}

// Eventos do Ethereum Provider
type EthereumEvent = 
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect'
  | 'message';

// Tipos para respostas de métodos comuns
interface EthereumConnectInfo {
  chainId: string;
}

interface EthereumProviderError extends Error {
  code: number;
  data?: unknown;
}

// Códigos de erro comuns
declare const EthereumErrorCodes: {
  readonly USER_REJECTED: 4001;
  readonly UNAUTHORIZED: 4100;
  readonly UNSUPPORTED_METHOD: 4200;
  readonly DISCONNECTED: 4900;
  readonly CHAIN_DISCONNECTED: 4901;
  readonly CHAIN_NOT_ADDED: 4902;
};

export type {
  EthereumProvider,
  EthereumEvent,
  EthereumConnectInfo,
  EthereumProviderError,
};
