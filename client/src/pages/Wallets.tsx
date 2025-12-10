import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Star,
  Copy,
  ExternalLink,
  Link2,
  Unlink,
  CheckCircle,
  RefreshCw,
  Send,
  ArrowRightLeft,
  Fuel,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  WalletAPI, 
  NETWORKS as WALLET_NETWORKS,
  type WalletState,
  type GasEstimate,
  type TransactionRecord
} from "@/lib/walletApi";

// Redes suportadas com configurações corretas
const NETWORKS = [
  { 
    chainId: 5042002, 
    name: "Arc Network Testnet", 
    symbol: "USDC", 
    decimals: 6,
    explorer: "https://testnet.arcscan.app",
    faucet: "https://faucet.circle.com/",
    key: "arcTestnet"
  },
  { 
    chainId: 11155111, 
    name: "Ethereum Sepolia", 
    symbol: "ETH", 
    decimals: 18,
    explorer: "https://sepolia.etherscan.io",
    faucet: "https://sepoliafaucet.com/",
    key: "sepolia"
  },
  { chainId: 1, name: "Ethereum Mainnet", symbol: "ETH", decimals: 18, explorer: "https://etherscan.io" },
  { chainId: 137, name: "Polygon", symbol: "MATIC", decimals: 18, explorer: "https://polygonscan.com" },
  { chainId: 56, name: "BSC", symbol: "BNB", decimals: 18, explorer: "https://bscscan.com" },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH", decimals: 18, explorer: "https://arbiscan.io" },
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
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  
  const [formData, setFormData] = useState({
    address: "",
    chainId: 5042002,
    walletType: "metamask",
    label: "",
  });

  const [sendData, setSendData] = useState({
    recipient: "",
    amount: "",
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

  // Atualizar estado da carteira periodicamente
  useEffect(() => {
    const updateState = () => {
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      setTxHistory(WalletAPI.getTransactionHistory());
    };

    updateState();
    const interval = setInterval(updateState, 5000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData({
      address: "",
      chainId: 5042002,
      walletType: "metamask",
      label: "",
    });
  };

  const handleConnectMetaMask = async () => {
    if (!WalletAPI.isMetaMaskInstalled()) {
      toast.error("MetaMask não detectado. Por favor, instale a extensão.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const account = await WalletAPI.connectWallet();
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      
      setFormData({
        ...formData,
        address: account,
        chainId: state.networkInfo?.chainIdDecimal || 5042002,
        walletType: "metamask",
      });
      
      toast.success(`MetaMask conectado: ${WalletAPI.shortenAddress(account)}`);
    } catch (error: any) {
      toast.error(`Erro ao conectar: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    WalletAPI.disconnectWallet();
    setWalletState(null);
    toast.success("Carteira desconectada");
  };

  const handleSwitchToArc = async () => {
    try {
      await WalletAPI.switchNetwork("arcTestnet");
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      toast.success("Conectado à Arc Network Testnet!");
    } catch (error: any) {
      toast.error(`Erro ao trocar rede: ${error.message}`);
    }
  };

  const handleSwitchToSepolia = async () => {
    try {
      await WalletAPI.switchNetwork("sepolia");
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      toast.success("Conectado à Ethereum Sepolia!");
    } catch (error: any) {
      toast.error(`Erro ao trocar rede: ${error.message}`);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await WalletAPI.updateBalance();
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      toast.success("Saldo atualizado!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar saldo: ${error.message}`);
    }
  };

  const handleEstimateGas = async () => {
    if (!sendData.recipient || !sendData.amount) {
      toast.error("Preencha destinatário e quantidade");
      return;
    }

    try {
      const estimate = await WalletAPI.estimateGas(sendData.recipient, sendData.amount);
      setGasEstimate(estimate);
      toast.success("Gas estimado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao estimar gas: ${error.message}`);
    }
  };

  const handleSendTransaction = async () => {
    if (!sendData.recipient || !sendData.amount) {
      toast.error("Preencha destinatário e quantidade");
      return;
    }

    try {
      const tx = await WalletAPI.sendTransaction(sendData.recipient, sendData.amount);
      setTxHistory(WalletAPI.getTransactionHistory());
      const state = WalletAPI.getWalletState();
      setWalletState(state);
      
      toast.success(`Transação enviada: ${WalletAPI.shortenAddress(tx.hash)}`);
      setIsSendOpen(false);
      setSendData({ recipient: "", amount: "" });
      setGasEstimate(null);
    } catch (error: any) {
      toast.error(`Erro ao enviar: ${error.message}`);
    }
  };

  const handleAdd = () => {
    if (!formData.address || !WalletAPI.isValidAddress(formData.address)) {
      toast.error("Endereço inválido. Deve ser um endereço Ethereum válido.");
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

  const openFaucet = (chainId: number) => {
    const network = NETWORKS.find(n => n.chainId === chainId);
    if (network && 'faucet' in network) {
      window.open(network.faucet, "_blank");
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">Carteiras Web3</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie suas carteiras e transações na Arc Network e Sepolia
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!walletState?.isConnected}>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Transação</DialogTitle>
                  <DialogDescription>
                    Envie {walletState?.networkInfo?.nativeCurrency.symbol || 'tokens'} para outro endereço
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Destinatário</Label>
                    <Input
                      placeholder="0x..."
                      value={sendData.recipient}
                      onChange={(e) => setSendData({ ...sendData, recipient: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantidade ({walletState?.networkInfo?.nativeCurrency.symbol || 'ETH'})</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="0.0"
                      value={sendData.amount}
                      onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                    />
                  </div>

                  {gasEstimate && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Fuel className="h-4 w-4 text-primary" />
                          <span className="font-medium">Estimativa de Gas</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Gas Limit:</span>
                            <span className="ml-2 font-mono">{gasEstimate.gasEstimate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Custo:</span>
                            <span className="ml-2 font-mono">{gasEstimate.gasCost} {gasEstimate.symbol}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={handleEstimateGas}>
                    <Fuel className="h-4 w-4 mr-1" />
                    Estimar Gas
                  </Button>
                  <Button onClick={handleSendTransaction}>
                    <Send className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleConnectMetaMask}
                      disabled={isConnecting}
                      className="h-16 flex-col gap-1"
                    >
                      <span className="text-2xl">🦊</span>
                      <span className="text-xs">MetaMask</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => toast.info("WalletConnect em breve!")}
                      className="h-16 flex-col gap-1"
                    >
                      <span className="text-2xl">🔗</span>
                      <span className="text-xs">WalletConnect</span>
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou adicione manualmente</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço da Carteira</Label>
                    <Input
                      placeholder="0x..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rede</Label>
                    <Select 
                      value={formData.chainId.toString()} 
                      onValueChange={(v) => setFormData({ ...formData, chainId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NETWORKS.map((network) => (
                          <SelectItem key={network.chainId} value={network.chainId.toString()}>
                            {network.name} ({network.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Label (opcional)</Label>
                    <Input
                      placeholder="Minha carteira principal"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adicionando..." : "Adicionar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Connected Wallet Status */}
        {walletState?.isConnected && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-[var(--color-magenta)]/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Wallet className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg">{WalletAPI.shortenAddress(walletState.account || '')}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(walletState.account || '')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-[var(--color-success)]">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                      <Badge variant="outline">
                        {walletState.networkInfo?.chainName || 'Rede Desconhecida'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold font-mono">
                      {walletState.balance} {walletState.networkInfo?.nativeCurrency.symbol}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefreshBalance}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDisconnect}>
                      <Unlink className="h-4 w-4 mr-1" />
                      Desconectar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Network Switch Buttons */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Trocar de Rede:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={walletState.currentNetwork === 'arcTestnet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleSwitchToArc}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Arc Testnet (USDC)
                  </Button>
                  <Button 
                    variant={walletState.currentNetwork === 'sepolia' ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleSwitchToSepolia}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Sepolia (ETH)
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openFaucet(walletState.networkInfo?.chainIdDecimal || 5042002)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Obter Tokens (Faucet)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Not Connected Warning */}
        {!walletState?.isConnected && (
          <Card className="border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[var(--color-warning)]/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-[var(--color-warning)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Nenhuma carteira conectada</h3>
                  <p className="text-sm text-muted-foreground">
                    Conecte sua carteira MetaMask para enviar transações e interagir com a blockchain.
                  </p>
                </div>
                <Button onClick={handleConnectMetaMask} disabled={isConnecting}>
                  <Link2 className="h-4 w-4 mr-1" />
                  {isConnecting ? "Conectando..." : "Conectar MetaMask"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {txHistory.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Send className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm">{WalletAPI.shortenAddress(tx.hash)}</p>
                        <p className="text-xs text-muted-foreground">
                          Para: {WalletAPI.shortenAddress(tx.to)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">{tx.value} {tx.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Wallets */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Carteiras Salvas
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wallets && wallets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className={`card-hover ${wallet.isDefault ? 'border-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getWalletIcon(wallet.walletType)}</span>
                        <div>
                          <p className="font-medium">{wallet.label || getWalletName(wallet.walletType)}</p>
                          <p className="text-xs text-muted-foreground">{getNetworkName(wallet.chainId)}</p>
                        </div>
                      </div>
                      {wallet.isDefault && (
                        <Badge className="bg-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mb-3">
                      <span className="font-mono text-sm flex-1 truncate">{wallet.address}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(wallet.address)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openExplorer(wallet.address, wallet.chainId)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Explorer
                      </Button>
                      {!wallet.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(wallet.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(wallet.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma carteira salva</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione suas carteiras Web3 para gerenciá-las facilmente.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Primeira Carteira
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Network Info Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Redes Suportadas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Arc Network Card */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">A</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Arc Network Testnet</h3>
                    <p className="text-xs text-muted-foreground">Chain ID: 5042002 (0x4CEF52)</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Token:</span>
                    <span className="font-mono">USDC (6 decimais)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RPC:</span>
                    <span className="font-mono text-xs">rpc.testnet.arc.network</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('https://testnet.arcscan.app', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Explorer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('https://faucet.circle.com/', '_blank')}>
                    Faucet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sepolia Card */}
            <Card className="border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--color-cyan)]/20 flex items-center justify-center">
                    <span className="font-bold text-[var(--color-cyan)]">Ξ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Ethereum Sepolia</h3>
                    <p className="text-xs text-muted-foreground">Chain ID: 11155111 (0xaa36a7)</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Token:</span>
                    <span className="font-mono">ETH (18 decimais)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RPC:</span>
                    <span className="font-mono text-xs">ethereum-sepolia-rpc.publicnode.com</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('https://sepolia.etherscan.io', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Explorer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}>
                    Faucet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
