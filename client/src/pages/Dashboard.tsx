import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  FolderKanban, 
  FileCode2, 
  Send, 
  Rocket,
  Plus,
  ArrowRight,
  Fuel,
  TrendingUp,
  Activity,
  HelpCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import InteractiveTutorial, { useTutorial } from "@/components/InteractiveTutorial";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.stats.user.useQuery();
  const { data: recentTx, isLoading: txLoading } = trpc.transaction.list.useQuery({ limit: 5 });
  const { data: gasPrices, isLoading: gasLoading } = trpc.gasPrice.latest.useQuery();
  const { showTutorial, setShowTutorial, resetTutorial } = useTutorial();

  const statCards = [
    { 
      title: "Projetos", 
      value: stats?.projects ?? 0, 
      icon: FolderKanban, 
      color: "text-[var(--color-cyan)]",
      bg: "bg-[var(--color-cyan)]/10",
      path: "/projects"
    },
    { 
      title: "Contratos", 
      value: stats?.contracts ?? 0, 
      icon: FileCode2, 
      color: "text-[var(--color-pink)]",
      bg: "bg-[var(--color-pink)]/10",
      path: "/contracts"
    },
    { 
      title: "Transações", 
      value: stats?.transactions ?? 0, 
      icon: Send, 
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
      path: "/transactions"
    },
    { 
      title: "Deployados", 
      value: stats?.deployedContracts ?? 0, 
      icon: Rocket, 
      color: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning)]/10",
      path: "/contracts"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "tx-confirmed";
      case "pending": return "tx-pending";
      case "failed": return "tx-failed";
      default: return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmada";
      case "pending": return "Pendente";
      case "failed": return "Falhou";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      {/* Tutorial Interativo */}
      {showTutorial && (
        <InteractiveTutorial
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visão geral dos seus projetos e contratos Web3
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetTutorial} variant="ghost" size="sm" title="Ver tutorial">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLocation("/projects")} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo Projeto
            </Button>
            <Button onClick={() => setLocation("/contracts")} size="sm">
              <FileCode2 className="h-4 w-4 mr-1" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card 
              key={stat.title} 
              className="card-hover cursor-pointer border-border"
              onClick={() => setLocation(stat.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="tech-label text-xs">{stat.title}</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-12 mt-1" />
                    ) : (
                      <p className="headline-massive text-2xl mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
                  <CardDescription>Últimas transações blockchain</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/transactions")}>
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentTx && recentTx.length > 0 ? (
                <div className="space-y-2">
                  {recentTx.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-sm truncate">
                            {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Chain ID: {tx.chainId}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma transação ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gas Prices */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Gas Tracker
                  </CardTitle>
                  <CardDescription>Preços em tempo real</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/gas")}>
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gasLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : gasPrices && gasPrices.length > 0 ? (
                <div className="space-y-3">
                  {gasPrices.slice(0, 4).map((gas) => (
                    <div key={gas.chainId} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Chain {gas.chainId}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Lento</span>
                          <p className="font-mono gas-slow">{gas.slow} Gwei</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Médio</span>
                          <p className="font-mono gas-standard">{gas.standard} Gwei</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rápido</span>
                          <p className="font-mono gas-fast">{gas.fast} Gwei</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Fuel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Dados de gas indisponíveis</p>
                  <p className="text-xs mt-1">Conecte a uma rede para monitorar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            <CardDescription>Comece a desenvolver seus contratos Web3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setLocation("/templates")}
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center">
                  <FileCode2 className="h-5 w-5 text-[var(--color-cyan)]" />
                </div>
                <span className="text-sm font-medium">Usar Template</span>
                <span className="text-xs text-muted-foreground">ERC-20, ERC-721, ERC-1155</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setLocation("/contracts")}
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--color-pink)]/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-[var(--color-pink)]" />
                </div>
                <span className="text-sm font-medium">Novo Contrato</span>
                <span className="text-xs text-muted-foreground">Criar do zero</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setLocation("/wallets")}
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-[var(--color-success)]" />
                </div>
                <span className="text-sm font-medium">Conectar Wallet</span>
                <span className="text-xs text-muted-foreground">MetaMask, WalletConnect</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setLocation("/docs")}
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-[var(--color-warning)]" />
                </div>
                <span className="text-sm font-medium">Documentação</span>
                <span className="text-xs text-muted-foreground">Guias e exemplos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
