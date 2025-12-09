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
  Gauge
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const NETWORKS = [
  { chainId: 1, name: "Ethereum", symbol: "ETH", color: "bg-[#627EEA]" },
  { chainId: 137, name: "Polygon", symbol: "MATIC", color: "bg-[#8247E5]" },
  { chainId: 56, name: "BSC", symbol: "BNB", color: "bg-[#F3BA2F]" },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH", color: "bg-[#28A0F0]" },
  { chainId: 10, name: "Optimism", symbol: "ETH", color: "bg-[#FF0420]" },
];

// Simulated gas data when API is not available
const SIMULATED_GAS: Record<number, { slow: string; standard: string; fast: string; baseFee: string }> = {
  1: { slow: "15", standard: "20", fast: "30", baseFee: "12" },
  137: { slow: "30", standard: "50", fast: "80", baseFee: "25" },
  56: { slow: "3", standard: "5", fast: "7", baseFee: "3" },
  42161: { slow: "0.1", standard: "0.15", fast: "0.2", baseFee: "0.1" },
  10: { slow: "0.001", standard: "0.002", fast: "0.003", baseFee: "0.001" },
};

export default function GasTracker() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: gasPrices, isLoading, refetch } = trpc.gasPrice.latest.useQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  const getGasForNetwork = (chainId: number) => {
    const dbGas = gasPrices?.find(g => g.chainId === chainId);
    if (dbGas) return dbGas;
    return SIMULATED_GAS[chainId] || { slow: "0", standard: "0", fast: "0", baseFee: "0" };
  };

  const getGasLevel = (value: string) => {
    const num = parseFloat(value);
    if (num < 20) return { label: "Baixo", color: "text-[var(--color-success)]", icon: TrendingDown };
    if (num < 50) return { label: "Médio", color: "text-[var(--color-warning)]", icon: Gauge };
    return { label: "Alto", color: "text-destructive", icon: TrendingUp };
  };

  const estimateCost = (gasPrice: string, gasLimit: number = 21000) => {
    const priceGwei = parseFloat(gasPrice);
    const costEth = (priceGwei * gasLimit) / 1e9;
    return costEth.toFixed(6);
  };

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
              Monitoramento de gas fees em tempo real para diferentes redes
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Ethereum</p>
                  <p className="headline-massive text-2xl mt-1">
                    {getGasForNetwork(1).standard}
                  </p>
                  <p className="text-xs text-muted-foreground">Gwei</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#627EEA]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#627EEA]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Polygon</p>
                  <p className="headline-massive text-2xl mt-1">
                    {getGasForNetwork(137).standard}
                  </p>
                  <p className="text-xs text-muted-foreground">Gwei</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#8247E5]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#8247E5]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">BSC</p>
                  <p className="headline-massive text-2xl mt-1">
                    {getGasForNetwork(56).standard}
                  </p>
                  <p className="text-xs text-muted-foreground">Gwei</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#F3BA2F]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#F3BA2F]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Arbitrum</p>
                  <p className="headline-massive text-2xl mt-1">
                    {getGasForNetwork(42161).standard}
                  </p>
                  <p className="text-xs text-muted-foreground">Gwei</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#28A0F0]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#28A0F0]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Gas Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            NETWORKS.map((network) => {
              const gas = getGasForNetwork(network.chainId);
              const level = getGasLevel(gas.standard);
              const LevelIcon = level.icon;
              
              return (
                <Card key={network.chainId} className="border-border card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${network.color} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {network.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{network.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Chain ID: {network.chainId}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={level.color}>
                        <LevelIcon className="h-3 w-3 mr-1" />
                        {level.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-[var(--color-success)]/10">
                        <p className="text-xs text-muted-foreground mb-1">Lento</p>
                        <p className="font-mono text-lg font-bold gas-slow">{gas.slow}</p>
                        <p className="text-xs text-muted-foreground">Gwei</p>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-[var(--color-warning)]/10">
                        <p className="text-xs text-muted-foreground mb-1">Médio</p>
                        <p className="font-mono text-lg font-bold gas-standard">{gas.standard}</p>
                        <p className="text-xs text-muted-foreground">Gwei</p>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-destructive/10">
                        <p className="text-xs text-muted-foreground mb-1">Rápido</p>
                        <p className="font-mono text-lg font-bold gas-fast">{gas.fast}</p>
                        <p className="text-xs text-muted-foreground">Gwei</p>
                      </div>
                    </div>
                    
                    {gas.baseFee && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Base Fee</span>
                          <span className="font-mono text-sm">{gas.baseFee} Gwei</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Custo estimado (21k gas)</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="font-mono">{estimateCost(gas.slow)}</p>
                          <p className="text-muted-foreground">{network.symbol}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono">{estimateCost(gas.standard)}</p>
                          <p className="text-muted-foreground">{network.symbol}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono">{estimateCost(gas.fast)}</p>
                          <p className="text-muted-foreground">{network.symbol}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Info Card */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Fuel className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sobre Gas Fees</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gas é a unidade de medida para o esforço computacional necessário para executar operações na blockchain. 
                  O preço do gas é medido em Gwei (1 Gwei = 0.000000001 ETH) e varia de acordo com a demanda da rede.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-[var(--color-success)]">Lento</p>
                    <p className="text-muted-foreground">~10+ minutos</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-warning)]">Médio</p>
                    <p className="text-muted-foreground">~3-5 minutos</p>
                  </div>
                  <div>
                    <p className="font-medium text-destructive">Rápido</p>
                    <p className="text-muted-foreground">~15-30 segundos</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
