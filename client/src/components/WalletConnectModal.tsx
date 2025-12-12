import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Smartphone, Monitor, ExternalLink } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  logo: string;
  description: string;
  mobileDeepLink?: string;
  desktopUrl?: string;
}

const WALLET_LOGOS = {
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  trust: "https://trustwallet.com/assets/images/media/assets/TWT.svg",
  coinbase: "https://avatars.githubusercontent.com/u/18060234?s=200&v=4",
  rainbow: "https://avatars.githubusercontent.com/u/48327834?s=200&v=4",
};

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string, walletType: string) => void;
}

// Storage key
const WALLET_STORAGE_KEY = "smartvault_wallet_connection";

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const checkMetaMask = () => {
    return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
  };

  const checkTrustWallet = () => {
    return typeof window !== "undefined" && (window as any).trustwallet;
  };

  const checkCoinbaseWallet = () => {
    return typeof window !== "undefined" && (window as any).coinbaseWalletExtension;
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
      // Verificar se há provider disponível
      if (checkMetaMask()) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setConnectedAddress(accounts[0]);
          }
        } catch (e) {
          // Sem conexão ativa
        }
      }
    };
    checkExistingConnection();
  }, [open]);

  // Escutar mudanças de conta
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0]);
          handleSuccessfulConnection(accounts[0], 'metamask');
        } else {
          setConnectedAddress(null);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleSuccessfulConnection = (address: string, walletType: string) => {
    setConnectionSuccess(true);
    setConnectedAddress(address);
    setConnecting(null);
    saveConnection(address, walletType);
    onConnect(address, walletType);
    
    // Fechar modal após mostrar sucesso
    setTimeout(() => {
      setConnectionSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  const connectMetaMask = async () => {
    // No mobile sem MetaMask instalado, abrir deep link
    if (isMobile() && !checkMetaMask()) {
      const currentUrl = window.location.href;
      const deepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      window.location.href = deepLink;
      return;
    }

    // MetaMask não detectado no desktop
    if (!checkMetaMask()) {
      window.open("https://metamask.io/download/", "_blank");
      throw new Error("MetaMask não detectado. Por favor, instale a extensão.");
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
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
    
    if (checkTrustWallet()) {
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
    } else if (checkMetaMask()) {
      // Fallback para MetaMask se disponível
      await connectMetaMask();
    } else {
      window.open("https://trustwallet.com/download", "_blank");
      throw new Error("Trust Wallet não detectado.");
    }
  };

  const connectCoinbase = async () => {
    if (isMobile()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://go.cb-w.com/dapp?cb_url=${currentUrl}`;
      return;
    }

    if (checkCoinbaseWallet()) {
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
    } else if (checkMetaMask()) {
      // Fallback para MetaMask se disponível
      await connectMetaMask();
    } else {
      window.open("https://www.coinbase.com/wallet", "_blank");
      throw new Error("Coinbase Wallet não detectado.");
    }
  };

  const connectRainbow = async () => {
    if (isMobile()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://rnbwapp.com/wc?uri=${currentUrl}`;
      return;
    }
    
    // No desktop, tentar MetaMask como fallback
    if (checkMetaMask()) {
      await connectMetaMask();
    } else {
      window.open("https://rainbow.me/", "_blank");
      throw new Error("Rainbow não detectado. Use MetaMask ou instale Rainbow.");
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
        case "trust":
          await connectTrustWallet();
          break;
        case "coinbase":
          await connectCoinbase();
          break;
        case "rainbow":
          await connectRainbow();
          break;
        default:
          throw new Error("Wallet desconhecida");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setConnectedAddress(null);
    setConnectionSuccess(false);
  };

  // Resetar estados quando modal fecha
  useEffect(() => {
    if (!open) {
      setError(null);
      setConnectionSuccess(false);
      setConnecting(null);
    }
  }, [open]);

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      logo: WALLET_LOGOS.metamask,
      description: isMobile() ? "Open in MetaMask app" : "Popular browser extension",
      detected: checkMetaMask(),
    },
    {
      id: "trust",
      name: "Trust Wallet",
      logo: WALLET_LOGOS.trust,
      description: isMobile() ? "Open in Trust Wallet app" : "Multi-chain mobile wallet",
      detected: checkTrustWallet(),
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      logo: WALLET_LOGOS.coinbase,
      description: isMobile() ? "Open in Coinbase app" : "Coinbase's self-custody wallet",
      detected: checkCoinbaseWallet(),
    },
    {
      id: "rainbow",
      name: "Rainbow",
      logo: WALLET_LOGOS.rainbow,
      description: isMobile() ? "Open in Rainbow app" : "Fun & easy Ethereum wallet",
      detected: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-[var(--color-neon-cyan)]/20">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-neon-text">Connect Wallet</DialogTitle>
          <DialogDescription>
            {isMobile() 
              ? "Select your wallet app to connect"
              : "Connect your wallet to access SmartVault"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Mensagem de sucesso */}
        {connectionSuccess && (
          <div className="flex items-center justify-center gap-3 py-8">
            <CheckCircle className="h-12 w-12 text-[var(--color-neon-green)] animate-pulse" />
            <div>
              <p className="text-lg font-semibold text-[var(--color-neon-green)]">Connected!</p>
              <p className="text-sm text-muted-foreground font-mono">
                {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {/* Se já conectado */}
        {!connectionSuccess && connectedAddress && (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
              <p className="font-mono text-[var(--color-neon-green)]">
                {connectedAddress.slice(0, 10)}...{connectedAddress.slice(-8)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black"
                onClick={() => {
                  onConnect(connectedAddress, 'metamask');
                  onOpenChange(false);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Lista de carteiras */}
        {!connectionSuccess && !connectedAddress && (
          <div className="py-4 space-y-3">
            {/* Indicador mobile/desktop */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              {isMobile() ? (
                <>
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile - Will open wallet app</span>
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  <span>Desktop - Connect via extension</span>
                </>
              )}
            </div>

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
                        wallet.id === 'trust' ? '🛡️' :
                        wallet.id === 'coinbase' ? '🔵' : '🌈';
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
                {isMobile() && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
                {!isMobile() && wallet.detected && (
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

        {!connectionSuccess && !connectedAddress && (
          <>
            {/* Redes suportadas */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-2">Supported Networks</p>
              <div className="flex flex-wrap justify-center gap-1">
                {['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Arc'].map((network) => (
                  <span
                    key={network}
                    className="px-2 py-0.5 text-xs rounded-full bg-muted/50 text-muted-foreground"
                  >
                    {network}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By connecting, you agree to our Terms of Service
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
