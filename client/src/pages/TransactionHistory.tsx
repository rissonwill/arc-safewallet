import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  ArrowDownLeft,
  FileCode,
  Coins,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

const NETWORKS: Record<number, { name: string; explorer: string; symbol: string }> = {
  1: { name: "Ethereum", explorer: "https://etherscan.io", symbol: "ETH" },
  5042002: { name: "Arc Testnet", explorer: "https://testnet.arcscan.app", symbol: "USDC" },
  11155111: { name: "Sepolia", explorer: "https://sepolia.etherscan.io", symbol: "ETH" },
  137: { name: "Polygon", explorer: "https://polygonscan.com", symbol: "MATIC" },
  56: { name: "BSC", explorer: "https://bscscan.com", symbol: "BNB" },
  42161: { name: "Arbitrum", explorer: "https://arbiscan.io", symbol: "ETH" },
};

const TX_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  deploy: { label: "Deploy", icon: <FileCode className="h-4 w-4" /> },
  call: { label: "Call", icon: <ArrowUpRight className="h-4 w-4" /> },
  transfer: { label: "Transfer", icon: <Coins className="h-4 w-4" /> },
  approve: { label: "Approve", icon: <CheckCircle2 className="h-4 w-4" /> },
  other: { label: "Other", icon: <ArrowDownLeft className="h-4 w-4" /> },
};

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="h-3 w-3" /> },
  confirmed: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="h-3 w-3" /> },
};

export default function TransactionHistory() {
  const { user } = useAuth();
  const authLoading = false;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: historyData, isLoading, refetch } = trpc.transaction.history.useQuery({
    page,
    limit: 20,
    chainId: chainFilter !== "all" ? parseInt(chainFilter) : undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    txType: typeFilter !== "all" ? typeFilter as any : undefined,
    search: search || undefined,
  }, {
    enabled: !!user,
  });

  const { data: stats } = trpc.transaction.stats.useQuery(undefined, {
    enabled: !!user,
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string | null, chainId: number) => {
    if (!value || value === "0") return "-";
    const network = NETWORKS[chainId];
    const ethValue = parseFloat(value) / 1e18;
    return `${ethValue.toFixed(4)} ${network?.symbol || "ETH"}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to view your transaction history.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold gradient-neon-text">Transaction History</h1>
              <p className="text-sm text-muted-foreground">View all your blockchain transactions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={chainFilter} onValueChange={setChainFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  {Object.entries(NETWORKS).map(([id, net]) => (
                    <SelectItem key={id} value={id}>{net.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deploy">Deploy</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Transactions
              </CardTitle>
              {historyData && (
                <span className="text-sm text-muted-foreground">
                  {historyData.total} total
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : historyData?.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyData?.transactions.map((tx) => {
                  const network = NETWORKS[tx.chainId] || { name: `Chain ${tx.chainId}`, explorer: "", symbol: "ETH" };
                  const txType = TX_TYPE_LABELS[tx.txType] || TX_TYPE_LABELS.other;
                  const status = STATUS_STYLES[tx.status];

                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-[var(--color-neon-cyan)]/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]">
                          {txType.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{formatAddress(tx.txHash)}</span>
                            {network.explorer && (
                              <a
                                href={`${network.explorer}/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-neon-cyan)] hover:opacity-80"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{formatAddress(tx.fromAddress)}</span>
                            <ArrowUpRight className="h-3 w-3" />
                            <span>{tx.toAddress ? formatAddress(tx.toAddress) : "Contract Creation"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 md:mt-0">
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatValue(tx.value, tx.chainId)}</div>
                          <div className="text-xs text-muted-foreground">{network.name}</div>
                        </div>
                        <Badge variant="outline" className={status.color}>
                          {status.icon}
                          <span className="ml-1">{tx.status}</span>
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {historyData && historyData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {historyData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(historyData.totalPages, p + 1))}
                  disabled={page === historyData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
