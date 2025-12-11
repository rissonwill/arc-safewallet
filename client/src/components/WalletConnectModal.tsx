import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  installed?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Popular browser extension wallet",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect with mobile wallets",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Coinbase's self-custody wallet",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Multi-chain mobile wallet",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    description: "Fun & easy Ethereum wallet",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
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
  

  const checkMetaMask = () => {
    return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
  };

  // Configuração da rede Arc Testnet
  const ARC_TESTNET = {
    chainId: '0x4CEF52', // 5042002
    chainName: 'Arc Testnet',
    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6
    },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app']
  };

  // Função para adicionar rede Arc automaticamente
  const addArcNetwork = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET]
      });
      console.log('✅ Rede Arc Testnet adicionada!');
      return true;
    } catch (err: any) {
      if (err.code !== 4001) { // 4001 = user rejected
        console.log('ℹ️ Rede Arc já pode estar adicionada');
      }
      return false;
    }
  };

  // Função para trocar para rede Arc
  const switchToArc = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainId }]
      });
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        // Rede não existe, adicionar primeiro
        await addArcNetwork();
        return switchToArc();
      }
      return false;
    }
  };

  const connectMetaMask = async () => {
    if (!checkMetaMask()) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
        // AUTO-ADICIONAR REDE ARC
        console.log('🔄 Verificando rede Arc Testnet...');
        const currentChainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        
        // Se não estiver na Arc, adicionar e perguntar se quer trocar
        if (currentChainId.toLowerCase() !== ARC_TESTNET.chainId.toLowerCase()) {
          await addArcNetwork();
          const shouldSwitch = window.confirm(
            'Rede Arc Testnet foi adicionada à sua carteira!\n\nDeseja trocar para a rede Arc Testnet agora?'
          );
          if (shouldSwitch) {
            await switchToArc();
          }
        }
        
        onConnect(accounts[0], "metamask");
        alert(`Conectado: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        onOpenChange(false);
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to connect MetaMask");
    }
  };

  const connectWalletConnect = async () => {
    // WalletConnect v2 integration
    
    
    // For now, show coming soon - full WalletConnect requires project ID
    throw new Error("WalletConnect integration coming soon. Please use MetaMask for now.");
  };

  const connectCoinbase = async () => {
    // Check if Coinbase Wallet is installed
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
        throw new Error(err.message || "Failed to connect Coinbase Wallet");
      }
    } else {
      window.open("https://www.coinbase.com/wallet", "_blank");
      throw new Error("Coinbase Wallet not detected. Please install the extension.");
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
        case "walletconnect":
          await connectWalletConnect();
          break;
        case "coinbase":
          await connectCoinbase();
          break;
        case "trust":
        case "rainbow":
        case "phantom":
          alert(`${walletOptions.find(w => w.id === walletId)?.name} integration coming soon!`);
          break;
        default:
          throw new Error("Unknown wallet type");
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
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {wallet.icon}
              </span>
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
                <span className="text-xs text-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 px-2 py-0.5 rounded">
                  Detected
                </span>
              )}
            </Button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
