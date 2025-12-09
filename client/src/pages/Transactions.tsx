import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Send, 
  Search,
  ExternalLink,
  Copy,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const NETWORKS: Record<number, { name: string; explorer: string }> = {
  1: { name: "Ethereum", explorer: "https://etherscan.io" },
  137: { name: "Polygon", explorer: "https://polygonscan.com" },
  56: { name: "BSC", explorer: "https://bscscan.com" },
  42161: { name: "Arbitrum", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", explorer: "https://optimistic.etherscan.io" },
  5: { name: "Goerli", explorer: "https://goerli.etherscan.io" },
  80001: { name: "Mumbai", explorer: "https://mumbai.polygonscan.com" },
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { data: transactions, isLoading } = trpc.transaction.list.useQuery({ limit: 100 });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const openExplorer = (txHash: string, chainId: number) => {
    const network = NETWORKS[chainId];
    if (network) {
      window.open(`${network.explorer}/tx/${txHash}`, "_blank");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[var(--color-warning)]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-[var(--color-success)]">Confirmada</Badge>;
      case "pending":
        return <Badge className="bg-[var(--color-warning)] text-black">Pendente</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "deploy":
        return <Badge variant="outline" className="border-[var(--color-cyan)] text-[var(--color-cyan)]">Deploy</Badge>;
      case "call":
        return <Badge variant="outline" className="border-[var(--color-pink)] text-[var(--color-pink)]">Call</Badge>;
      case "transfer":
        return <Badge variant="outline" className="border-[var(--color-success)] text-[var(--color-success)]">Transfer</Badge>;
      case "approve":
        return <Badge variant="outline" className="border-[var(--color-warning)] text-[var(--color-warning)]">Approve</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const getNetworkName = (chainId: number) => {
    return NETWORKS[chainId]?.name || `Chain ${chainId}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string | null) => {
    if (!value || value === "0") return "0 ETH";
    const eth = parseFloat(value) / 1e18;
    return `${eth.toFixed(6)} ETH`;
  };

  const openDetail = (tx: any) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = 
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType = typeFilter === "all" || tx.txType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-massive text-2xl md:text-3xl">Transações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explorador de transações blockchain com histórico completo
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por hash, endereço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="deploy">Deploy</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Histórico de Transações</CardTitle>
            <CardDescription>
              {filteredTransactions?.length || 0} transações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Para</TableHead>
                      <TableHead>Rede</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow 
                        key={tx.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetail(tx)}
                      >
                        <TableCell>
                          {getStatusIcon(tx.status)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatAddress(tx.txHash)}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(tx.txType)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-destructive" />
                            {formatAddress(tx.fromAddress)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.toAddress ? (
                            <div className="flex items-center gap-1">
                              <ArrowDownLeft className="h-3 w-3 text-[var(--color-success)]" />
                              {formatAddress(tx.toAddress)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getNetworkName(tx.chainId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatValue(tx.value)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openExplorer(tx.txHash, tx.chainId);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Nenhuma transação encontrada</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "As transações aparecerão aqui quando você interagir com a blockchain."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Detalhes da Transação
              </DialogTitle>
              <DialogDescription>
                Informações completas da transação blockchain
              </DialogDescription>
            </DialogHeader>
            
            {selectedTx && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedTx.status)}
                  {getTypeBadge(selectedTx.txType)}
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Hash da Transação</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm break-all">{selectedTx.txHash}</p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy(selectedTx.txHash, "Hash")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">De</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-sm">{formatAddress(selectedTx.fromAddress)}</p>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(selectedTx.fromAddress, "Endereço")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Para</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-sm">
                          {selectedTx.toAddress ? formatAddress(selectedTx.toAddress) : "-"}
                        </p>
                        {selectedTx.toAddress && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(selectedTx.toAddress, "Endereço")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Rede</p>
                      <p className="font-medium">{getNetworkName(selectedTx.chainId)}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Valor</p>
                      <p className="font-mono">{formatValue(selectedTx.value)}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Bloco</p>
                      <p className="font-mono">{selectedTx.blockNumber || "-"}</p>
                    </div>
                  </div>
                  
                  {selectedTx.gasUsed && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Gas Usado</p>
                        <p className="font-mono">{selectedTx.gasUsed}</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Gas Price</p>
                        <p className="font-mono">{selectedTx.gasPrice || "-"} Gwei</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Criada em</p>
                      <p className="text-sm">
                        {new Date(selectedTx.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    
                    {selectedTx.confirmedAt && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Confirmada em</p>
                        <p className="text-sm">
                          {new Date(selectedTx.confirmedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => openExplorer(selectedTx.txHash, selectedTx.chainId)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no Explorer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
