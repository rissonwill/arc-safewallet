import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Star,
  Copy,
  ExternalLink,
  Link2,
  Unlink,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const NETWORKS = [
  { chainId: 1, name: "Ethereum Mainnet", symbol: "ETH", explorer: "https://etherscan.io" },
  { chainId: 137, name: "Polygon", symbol: "MATIC", explorer: "https://polygonscan.com" },
  { chainId: 56, name: "BSC", symbol: "BNB", explorer: "https://bscscan.com" },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH", explorer: "https://arbiscan.io" },
  { chainId: 10, name: "Optimism", symbol: "ETH", explorer: "https://optimistic.etherscan.io" },
  { chainId: 5, name: "Goerli Testnet", symbol: "ETH", explorer: "https://goerli.etherscan.io" },
  { chainId: 80001, name: "Mumbai Testnet", symbol: "MATIC", explorer: "https://mumbai.polygonscan.com" },
];

const WALLET_TYPES = [
  { id: "metamask", name: "MetaMask", icon: "🦊" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗" },
  { id: "arc", name: "Arc Network", icon: "⚡" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵" },
  { id: "trust", name: "Trust Wallet", icon: "🛡️" },
];

export default function Wallets() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    chainId: 1,
    walletType: "metamask",
    label: "",
  });

  const utils = trpc.useUtils();
  const { data: wallets, isLoading } = trpc.wallet.list.useQuery();
  
  const createMutation = trpc.wallet.create.useMutation({
    onSuccess: () => {
      utils.wallet.list.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast.success("Carteira adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar carteira: ${error.message}`);
    },
  });

  const deleteMutation = trpc.wallet.delete.useMutation({
    onSuccess: () => {
      utils.wallet.list.invalidate();
      toast.success("Carteira removida!");
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const setDefaultMutation = trpc.wallet.setDefault.useMutation({
    onSuccess: () => {
      utils.wallet.list.invalidate();
      toast.success("Carteira padrão atualizada!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      address: "",
      chainId: 1,
      walletType: "metamask",
      label: "",
    });
  };

  const handleConnectMetaMask = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask não detectado. Por favor, instale a extensão.");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setFormData({
          ...formData,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          walletType: "metamask",
        });
        toast.success("MetaMask conectado!");
      }
    } catch (error: any) {
      toast.error(`Erro ao conectar: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAdd = () => {
    if (!formData.address || formData.address.length !== 42) {
      toast.error("Endereço inválido. Deve ter 42 caracteres.");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta carteira?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultMutation.mutate({ id });
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Endereço copiado!");
  };

  const openExplorer = (address: string, chainId: number) => {
    const network = NETWORKS.find(n => n.chainId === chainId);
    if (network) {
      window.open(`${network.explorer}/address/${address}`, "_blank");
    }
  };

  const getNetworkName = (chainId: number) => {
    return NETWORKS.find(n => n.chainId === chainId)?.name || `Chain ${chainId}`;
  };

  const getWalletIcon = (type: string) => {
    return WALLET_TYPES.find(w => w.id === type)?.icon || "💳";
  };

  const getWalletName = (type: string) => {
    return WALLET_TYPES.find(w => w.id === type)?.name || type;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">Carteiras</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie suas carteiras Web3 conectadas
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Carteira
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Carteira</DialogTitle>
                <DialogDescription>
                  Conecte uma carteira Web3 ou adicione manualmente.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Quick Connect Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={handleConnectMetaMask}
                    disabled={isConnecting}
                  >
                    <span className="text-2xl">🦊</span>
                    <span className="text-sm font-medium">
                      {isConnecting ? "Conectando..." : "MetaMask"}
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => toast.info("WalletConnect em breve!")}
                  >
                    <span className="text-2xl">🔗</span>
                    <span className="text-sm font-medium">WalletConnect</span>
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ou adicione manualmente
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço da Carteira</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rede</Label>
                    <Select
                      value={formData.chainId.toString()}
                      onValueChange={(v) => setFormData({ ...formData, chainId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a rede" />
                      </SelectTrigger>
                      <SelectContent>
                        {NETWORKS.map((network) => (
                          <SelectItem key={network.chainId} value={network.chainId.toString()}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Carteira</Label>
                    <Select
                      value={formData.walletType}
                      onValueChange={(v) => setFormData({ ...formData, walletType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {WALLET_TYPES.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            <span className="flex items-center gap-2">
                              <span>{wallet.icon}</span>
                              {wallet.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="label">Rótulo (opcional)</Label>
                  <Input
                    id="label"
                    placeholder="Ex: Carteira Principal"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleAdd} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adicionando..." : "Adicionar Carteira"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Conexão Segura</p>
              <p className="text-sm text-muted-foreground">
                Suas chaves privadas nunca são armazenadas. Apenas o endereço público é salvo para referência.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wallets && wallets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className={`border-border card-hover ${wallet.isDefault ? "ring-2 ring-primary" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {getWalletIcon(wallet.walletType)}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {wallet.label || getWalletName(wallet.walletType)}
                          {wallet.isDefault && (
                            <Star className="h-4 w-4 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getNetworkName(wallet.chainId)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm">{formatAddress(wallet.address)}</p>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopy(wallet.address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openExplorer(wallet.address, wallet.chainId)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getWalletName(wallet.walletType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(wallet.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {!wallet.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSetDefault(wallet.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Definir Padrão
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(wallet.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Nenhuma carteira conectada</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Conecte sua carteira Web3 para começar a interagir com contratos inteligentes.
              </p>
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Conectar Primeira Carteira
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Supported Wallets */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Carteiras Suportadas</CardTitle>
            <CardDescription>
              Conecte qualquer carteira compatível com Web3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {WALLET_TYPES.map((wallet) => (
                <div 
                  key={wallet.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <span className="text-sm font-medium">{wallet.name}</span>
                  {wallet.id === "metamask" && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
