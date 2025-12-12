import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Fuel, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Clock,
  Gauge,
  Star,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const NETWORKS = [
  { chainId: 1516, name: "SmartVault Network", symbol: "ARC", color: "#00D4FF", isPrimary: true },
  { chainId: 11155111, name: "Sepolia", symbol: "ETH", color: "#627EEA", isPrimary: true },
  { chainId: 1, name: "Ethereum", symbol: "ETH", color: "#627EEA", isPrimary: false },
  { chainId: 137, name: "Polygon", symbol: "MATIC", color: "#8247E5", isPrimary: false },
  { chainId: 56, name: "BSC", symbol: "BNB", color: "#F3BA2F", isPrimary: false },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH", color: "#28A0F0", isPrimary: false },
];

export default function GasTracker() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: gasPrices, isLoading, refetch } = trpc.gasPrice.latest.useQuery(undefined, {
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (gasPrices) {
      setLastUpdate(new Date());
    }
  }, [gasPrices]);

  const getGasForNetwork = (chainId: number) => {
    const gas = gasPrices?.find((g: any) => g.chainId === chainId);
    if (gas) {
      return {
        slow: gas.slow?.toString() || "0",
        standard: gas.standard?.toString() || "0",
        fast: gas.fast?.toString() || "0",
        baseFee: gas.baseFee?.toString() || null,
      };
    }
    return null;
  };

  const getGasLevel = (value: string) => {
    const num = parseFloat(value);
    if (num < 20) return { label: "Baixo", color: "text-[var(--color-success)]", bgColor: "bg-[var(--color-success)]", icon: TrendingDown };
    if (num < 50) return { label: "Médio", color: "text-[var(--color-warning)]", bgColor: "bg-[var(--color-warning)]", icon: Gauge };
    return { label: "Alto", color: "text-destructive", bgColor: "bg-destructive", icon: TrendingUp };
  };

  const estimateCost = (gasPrice: string, gasLimit: number = 21000) => {
    const priceGwei = parseFloat(gasPrice);
    const costEth = (priceGwei * gasLimit) / 1e9;
    return costEth.toFixed(6);
  };

  const primaryNetworks = NETWORKS.filter(n => n.isPrimary);
  const otherNetworks = NETWORKS.filter(n => !n.isPrimary);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl flex items-center gap-2">
              <Fuel className="h-8 w-8 text-primary" />
              Gas Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitoramento de gas fees em tempo real via APIs públicas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 text-[var(--color-success)] animate-pulse" />
              <span>Ao vivo</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              {lastUpdate.toLocaleTimeString("pt-BR")}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Primary Networks - SmartVault Network & Sepolia */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Redes Principais
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {primaryNetworks.map((network) => {
              const gas = getGasForNetwork(network.chainId);
              const standardLevel = gas ? getGasLevel(gas.standard) : null;
              
              return (
                <Card key={network.chainId} className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${network.color}30` }}
                        >
                          <span 
                            className="font-bold text-lg"
                            style={{ color: network.color }}
                          >
                            {network.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{network.name}</CardTitle>
                          <CardDescription>Chain ID: {network.chainId}</CardDescription>
                        </div>
                      </div>
                      {standardLevel && (
                        <Badge className={standardLevel.bgColor}>
                          <standardLevel.icon className="h-3 w-3 mr-1" />
                          {standardLevel.label}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : gas ? (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 rounded-lg bg-background/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">🐢 Lento</p>
                          <p className="text-2xl font-bold text-[var(--color-success)]">{gas.slow}</p>
                          <p className="text-xs text-muted-foreground">Gwei</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50 text-center border-2 border-primary/30">
                          <p className="text-xs text-muted-foreground mb-1">⚡ Padrão</p>
                          <p className="text-2xl font-bold text-primary">{gas.standard}</p>
                          <p className="text-xs text-muted-foreground">Gwei</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">🚀 Rápido</p>
                          <p className="text-2xl font-bold text-[var(--color-warning)]">{gas.fast}</p>
                          <p className="text-xs text-muted-foreground">Gwei</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Fuel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Dados não disponíveis</p>
                        <p className="text-xs">Conecte a uma rede para monitorar</p>
                      </div>
                    )}
                    
                    {gas && gas.baseFee && (
                      <div className="mt-3 p-2 rounded-lg bg-muted/50 text-center">
                        <span className="text-xs text-muted-foreground">Base Fee: </span>
                        <span className="text-sm font-mono">{gas.baseFee} Gwei</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Other Networks */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Outras Redes
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherNetworks.map((network) => {
              const gas = getGasForNetwork(network.chainId);
              const standardLevel = gas ? getGasLevel(gas.standard) : null;
              
              return (
                <Card key={network.chainId} className="border-border card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${network.color}20` }}
                        >
                          <span 
                            className="font-bold text-sm"
                            style={{ color: network.color }}
                          >
                            {network.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{network.name}</p>
                          <p className="text-xs text-muted-foreground">{network.symbol}</p>
                        </div>
                      </div>
                      {standardLevel && (
                        <div className={`h-2 w-2 rounded-full ${standardLevel.bgColor}`} />
                      )}
                    </div>
                    
                    {isLoading ? (
                      <Skeleton className="h-12 w-full" />
                    ) : gas ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Lento</span>
                          <span className="font-mono text-[var(--color-success)]">{gas.slow} Gwei</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Padrão</span>
                          <span className="font-mono font-medium">{gas.standard} Gwei</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rápido</span>
                          <span className="font-mono text-[var(--color-warning)]">{gas.fast} Gwei</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-muted-foreground text-sm">
                        Sem dados
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cost Estimator */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Estimativa de Custo
            </CardTitle>
            <CardDescription>
              Custo estimado para transações comuns (baseado no gas padrão)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Rede</th>
                    <th className="text-right py-2 font-medium">Transfer (21k gas)</th>
                    <th className="text-right py-2 font-medium">ERC-20 (65k gas)</th>
                    <th className="text-right py-2 font-medium">Swap (150k gas)</th>
                    <th className="text-right py-2 font-medium">NFT Mint (200k gas)</th>
                  </tr>
                </thead>
                <tbody>
                  {NETWORKS.map((network) => {
                    const gas = getGasForNetwork(network.chainId);
                    const standardGas = gas ? parseFloat(gas.standard) : 0;
                    
                    return (
                      <tr key={network.chainId} className="border-b border-border/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: network.color }}
                            />
                            <span>{network.name}</span>
                            {network.isPrimary && (
                              <Star className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 font-mono">
                          {gas ? `${estimateCost(gas.standard, 21000)} ${network.symbol}` : "-"}
                        </td>
                        <td className="text-right py-3 font-mono">
                          {gas ? `${estimateCost(gas.standard, 65000)} ${network.symbol}` : "-"}
                        </td>
                        <td className="text-right py-3 font-mono">
                          {gas ? `${estimateCost(gas.standard, 150000)} ${network.symbol}` : "-"}
                        </td>
                        <td className="text-right py-3 font-mono">
                          {gas ? `${estimateCost(gas.standard, 200000)} ${network.symbol}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-[var(--color-cyan)]/20 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-[var(--color-cyan)]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Dados em Tempo Real</h4>
                <p className="text-sm text-muted-foreground">
                  Os preços de gas são obtidos diretamente das APIs públicas do Etherscan, Polygon Gas Station 
                  e RPCs das redes. Os dados são atualizados automaticamente a cada 30 segundos. 
                  Para SmartVault Network e Sepolia (testnets), os custos são significativamente menores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
