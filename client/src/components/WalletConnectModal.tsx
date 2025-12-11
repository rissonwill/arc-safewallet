import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  logo: string;
  description: string;
  deepLink?: string;
}

// Logos oficiais das wallets em SVG/base64
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
    description: "Connect with mobile wallets",
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

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const addArcNetwork = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET]
      });
      return true;
    } catch (err: any) {
      if (err.code !== 4001) {
        console.log('Rede Arc pode estar adicionada');
      }
      return false;
    }
  };

  const switchToArc = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainId }]
      });
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        await addArcNetwork();
        return switchToArc();
      }
      return false;
    }
  };

  const connectMetaMask = async () => {
    // Se estiver no mobile e MetaMask não detectado, abrir deep link
    if (isMobile() && !checkMetaMask()) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      return;
    }

    // Se MetaMask não instalado no desktop, redirecionar para download
    if (!checkMetaMask()) {
      window.open("https://metamask.io/download/", "_blank");
      throw new Error("MetaMask não detectado. Por favor, instale a extensão.");
    }

    try {
      // Solicitar conexão - isso abre o popup da MetaMask
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
        // Verificar e adicionar rede Arc
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
        
        onConnect(accounts[0], "metamask");
        onOpenChange(false);
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
    
    // No desktop, verificar se Trust Wallet está instalado
    if (typeof window !== "undefined" && (window as any).trustwallet) {
      try {
        const accounts = await (window as any).trustwallet.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          onConnect(accounts[0], "trust");
          onOpenChange(false);
        }
      } catch (err: any) {
        throw new Error(err.message || "Falha ao conectar Trust Wallet");
      }
    } else {
      window.open("https://trustwallet.com/download", "_blank");
      throw new Error("Trust Wallet não detectado. Por favor, instale a extensão.");
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
          onConnect(accounts[0], "coinbase");
          onOpenChange(false);
        }
      } catch (err: any) {
        throw new Error(err.message || "Falha ao conectar Coinbase Wallet");
      }
    } else {
      window.open("https://www.coinbase.com/wallet", "_blank");
      throw new Error("Coinbase Wallet não detectado. Por favor, instale a extensão.");
    }
  };

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    setError(null);

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
        case "walletconnect":
        case "rainbow":
        case "phantom":
          setError("WalletConnect integration coming soon. Please use MetaMask for now.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-[var(--color-neon-cyan)]/20">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-neon-text">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to Arc SafeWallet
          </DialogDescription>
        </DialogHeader>

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
                    // Fallback para emoji se imagem falhar
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
              {wallet.id === "metamask" && checkMetaMask() && (
                <span className="text-xs text-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10 px-2 py-0.5 rounded">
                  Detected
                </span>
              )}
            </Button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
