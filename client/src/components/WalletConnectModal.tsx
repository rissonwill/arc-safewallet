import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, QrCode, CheckCircle, RefreshCw } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  logo: string;
  description: string;
  deepLink?: string;
}

const WALLET_LOGOS = {
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  walletconnect: "https://avatars.githubusercontent.com/u/37784886?s=200&v=4",
  coinbase: "https://avatars.githubusercontent.com/u/18060234?s=200&v=4",
  trust: "https://trustwallet.com/assets/images/media/assets/TWT.svg",
  rainbow: "https://avatars.githubusercontent.com/u/48327834?s=200&v=4",
  phantom: "https://avatars.githubusercontent.com/u/78782331?s=200&v=4",
};

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    logo: WALLET_LOGOS.metamask,
    description: "Popular browser extension wallet",
    deepLink: "https://metamask.app.link/dapp/",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    logo: WALLET_LOGOS.walletconnect,
    description: "Scan QR code with mobile wallet",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    logo: WALLET_LOGOS.coinbase,
    description: "Coinbase's self-custody wallet",
    deepLink: "https://go.cb-w.com/dapp?cb_url=",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    logo: WALLET_LOGOS.trust,
    description: "Multi-chain mobile wallet",
    deepLink: "https://link.trustwallet.com/open_url?coin_id=60&url=",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    logo: WALLET_LOGOS.rainbow,
    description: "Fun & easy Ethereum wallet",
  },
  {
    id: "phantom",
    name: "Phantom",
    logo: WALLET_LOGOS.phantom,
    description: "Multi-chain crypto wallet",
  },
];

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string, walletType: string) => void;
}

// WalletConnect Project ID - pode ser obtido em https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

// Storage keys
const WALLET_STORAGE_KEY = "smartvault_wallet_connection";

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wcProvider, setWcProvider] = useState<any>(null);
  const [waitingForMobile, setWaitingForMobile] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const checkMetaMask = () => {
    return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
  };

  const ARC_TESTNET = {
    chainId: '0x4CEF52',
    chainName: 'Arc Testnet',
    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6
    },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app']
  };

  const addArcNetwork = async (provider?: any) => {
    const eth = provider || (window as any).ethereum;
    try {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET]
      });
      return true;
    } catch (err: any) {
      if (err.code !== 4001) {
        // Arc network may already be added
      }
      return false;
    }
  };

  const switchToArc = async (provider?: any) => {
    const eth = provider || (window as any).ethereum;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainId }]
      });
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        await addArcNetwork(provider);
        return switchToArc(provider);
      }
      return false;
    }
  };

  // Salvar conexão no localStorage
  const saveConnection = (address: string, walletType: string) => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
        address,
        walletType,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Erro ao salvar conexão:', e);
    }
  };

  // Recuperar conexão do localStorage
  const getStoredConnection = () => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Conexão válida por 24 horas
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error('Erro ao recuperar conexão:', e);
    }
    return null;
  };

  // Verificar conexão existente ao montar
  useEffect(() => {
    const checkExistingConnection = async () => {
      const stored = getStoredConnection();
      if (stored) {
        // Verificar se a carteira ainda está conectada
        if (stored.walletType === 'metamask' && checkMetaMask()) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === stored.address.toLowerCase()) {
              onConnect(stored.address, stored.walletType);
            }
          } catch (e) {
            // Conexão não está mais ativa
          }
        }
      }
    };
    checkExistingConnection();
  }, []);

  // Inicializar WalletConnect com event listeners
  const initWalletConnect = async () => {
    try {
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [1], // Ethereum Mainnet
        optionalChains: [5042002, 11155111, 137, 56, 42161], // Arc Testnet, Sepolia, Polygon, BSC, Arbitrum
        showQrModal: true,
        metadata: {
          name: 'SmartVault',
          description: 'Smart Contracts with Security',
          url: window.location.origin,
          icons: [`${window.location.origin}/smartvault-logo.png`]
        }
      });

      // Event listeners para conexão
      provider.on('connect', (info: any) => {
        console.log('WalletConnect connected:', info);
        const accounts = provider.accounts;
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], 'walletconnect');
        }
      });

      provider.on('session_update', ({ params }: any) => {
        console.log('WalletConnect session updated:', params);
        const accounts = provider.accounts;
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], 'walletconnect');
        }
      });

      provider.on('disconnect', () => {
        console.log('WalletConnect disconnected');
        localStorage.removeItem(WALLET_STORAGE_KEY);
      });

      provider.on('accountsChanged', (accounts: string[]) => {
        console.log('WalletConnect accounts changed:', accounts);
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], 'walletconnect');
        }
      });

      setWcProvider(provider);
      return provider;
    } catch (err) {
      console.error('Erro ao inicializar WalletConnect:', err);
      throw new Error('Falha ao inicializar WalletConnect');
    }
  };

  const handleSuccessfulConnection = useCallback((address: string, walletType: string) => {
    setConnectionSuccess(true);
    setWaitingForMobile(false);
    setConnecting(null);
    saveConnection(address, walletType);
    onConnect(address, walletType);
    
    // Fechar modal após mostrar sucesso
    setTimeout(() => {
      setConnectionSuccess(false);
      onOpenChange(false);
    }, 1500);
  }, [onConnect, onOpenChange]);

  const connectWalletConnect = async () => {
    try {
      let provider = wcProvider;
      if (!provider) {
        provider = await initWalletConnect();
      }

      // No mobile, mostrar mensagem de aguardando
      if (isMobile()) {
        setWaitingForMobile(true);
      }

      // Conectar - isso abre o modal QR Code ou deep link no mobile
      await provider.connect();
      
      const accounts = provider.accounts;
      if (accounts && accounts.length > 0) {
        // Tentar adicionar rede Arc
        try {
          await addArcNetwork(provider);
        } catch (e) {
          // Could not add Arc network via WalletConnect
        }
        
        handleSuccessfulConnection(accounts[0], "walletconnect");
      }
    } catch (err: any) {
      setWaitingForMobile(false);
      if (err.message?.includes('User rejected') || err.message?.includes('user rejected')) {
        throw new Error('Conexão rejeitada pelo usuário');
      }
      throw new Error(err.message || 'Falha ao conectar via WalletConnect');
    }
  };

  const connectMetaMask = async () => {
    if (isMobile() && !checkMetaMask()) {
      // No mobile sem MetaMask, redirecionar para o app
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      return;
    }

    if (!checkMetaMask()) {
      window.open("https://metamask.io/download/", "_blank");
      throw new Error("MetaMask não detectado. Por favor, instale a extensão.");
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
        const currentChainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        
        if (currentChainId.toLowerCase() !== ARC_TESTNET.chainId.toLowerCase()) {
          await addArcNetwork();
          const shouldSwitch = window.confirm(
            'Rede Arc Testnet foi adicionada!\n\nDeseja trocar para a rede Arc Testnet agora?'
          );
          if (shouldSwitch) {
            await switchToArc();
          }
        }
        
        handleSuccessfulConnection(accounts[0], "metamask");
      }
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error("Conexão rejeitada pelo usuário");
      }
      throw new Error(err.message || "Falha ao conectar MetaMask");
    }
  };

  const connectTrustWallet = async () => {
    if (isMobile()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`;
      return;
    }
    
    if (typeof window !== "undefined" && (window as any).trustwallet) {
      try {
        const accounts = await (window as any).trustwallet.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], "trust");
        }
      } catch (err: any) {
        throw new Error(err.message || "Falha ao conectar Trust Wallet");
      }
    } else {
      // Usar WalletConnect como fallback
      await connectWalletConnect();
    }
  };

  const connectCoinbase = async () => {
    if (isMobile()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://go.cb-w.com/dapp?cb_url=${currentUrl}`;
      return;
    }

    if (typeof window !== "undefined" && (window as any).coinbaseWalletExtension) {
      try {
        const accounts = await (window as any).coinbaseWalletExtension.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], "coinbase");
        }
      } catch (err: any) {
        throw new Error(err.message || "Falha ao conectar Coinbase Wallet");
      }
    } else {
      window.open("https://www.coinbase.com/wallet", "_blank");
      throw new Error("Coinbase Wallet não detectado. Por favor, instale a extensão.");
    }
  };

  const connectRainbow = async () => {
    if (isMobile()) {
      // Rainbow deep link
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://rnbwapp.com/wc?uri=${currentUrl}`;
      return;
    }
    // No desktop, usar WalletConnect
    await connectWalletConnect();
  };

  const connectPhantom = async () => {
    if (typeof window !== "undefined" && (window as any).phantom?.ethereum) {
      try {
        const accounts = await (window as any).phantom.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0], "phantom");
        }
      } catch (err: any) {
        throw new Error(err.message || "Falha ao conectar Phantom");
      }
    } else {
      window.open("https://phantom.app/download", "_blank");
      throw new Error("Phantom não detectado. Por favor, instale a extensão.");
    }
  };

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    setError(null);
    setConnectionSuccess(false);

    try {
      switch (walletId) {
        case "metamask":
          await connectMetaMask();
          break;
        case "walletconnect":
          await connectWalletConnect();
          break;
        case "trust":
          await connectTrustWallet();
          break;
        case "coinbase":
          await connectCoinbase();
          break;
        case "rainbow":
          await connectRainbow();
          break;
        case "phantom":
          await connectPhantom();
          break;
        default:
          throw new Error("Wallet desconhecida");
      }
    } catch (err: any) {
      setError(err.message);
      setWaitingForMobile(false);
    } finally {
      if (!waitingForMobile) {
        setConnecting(null);
      }
    }
  };

  // Cleanup WalletConnect on unmount
  useEffect(() => {
    return () => {
      if (wcProvider && !wcProvider.connected) {
        // Não desconectar se estiver conectado
      }
    };
  }, [wcProvider]);

  // Resetar estados quando modal fecha
  useEffect(() => {
    if (!open) {
      setError(null);
      setWaitingForMobile(false);
      setConnectionSuccess(false);
      setConnecting(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-[var(--color-neon-cyan)]/20">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-neon-text">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to SmartVault
          </DialogDescription>
        </DialogHeader>

        {/* Mensagem de sucesso */}
        {connectionSuccess && (
          <div className="flex items-center justify-center gap-3 py-6">
            <CheckCircle className="h-12 w-12 text-[var(--color-neon-green)] animate-pulse" />
            <div>
              <p className="text-lg font-semibold text-[var(--color-neon-green)]">Conectado!</p>
              <p className="text-sm text-muted-foreground">Redirecionando...</p>
            </div>
          </div>
        )}

        {/* Mensagem de aguardando mobile */}
        {waitingForMobile && !connectionSuccess && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <RefreshCw className="h-10 w-10 text-[var(--color-neon-cyan)] animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold">Aguardando aprovação...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aprove a conexão na sua carteira e volte para esta página
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setWaitingForMobile(false);
                  setConnecting(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de carteiras */}
        {!connectionSuccess && !waitingForMobile && (
          <div className="grid gap-3 py-4">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-border/50 hover:border-[var(--color-neon-cyan)]/50 hover:bg-[var(--color-neon-cyan)]/5 transition-all group"
                onClick={() => handleConnect(wallet.id)}
                disabled={connecting !== null}
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                  <img 
                    src={wallet.logo} 
                    alt={wallet.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = wallet.id === 'metamask' ? '🦊' : 
                        wallet.id === 'walletconnect' ? '🔗' :
                        wallet.id === 'coinbase' ? '🔵' :
                        wallet.id === 'trust' ? '🛡️' :
                        wallet.id === 'rainbow' ? '🌈' : '👻';
                    }}
                  />
                </div>
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-medium">{wallet.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {wallet.description}
                  </span>
                </div>
                {connecting === wallet.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-neon-cyan)]" />
                )}
                {wallet.id === "walletconnect" && (
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                )}
                {wallet.id === "metamask" && checkMetaMask() && (
                  <span className="text-xs text-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10 px-2 py-0.5 rounded">
                    Detected
                  </span>
                )}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!connectionSuccess && !waitingForMobile && (
          <p className="text-xs text-center text-muted-foreground">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
