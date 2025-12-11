import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Fuel, 
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";

export default function Analytics() {
  const { t } = useI18n();
  const [days, setDays] = useState(30);
  
  const { data: analytics, isLoading } = trpc.stats.analytics.useQuery({ days });
  const { data: txStats } = trpc.stats.transactionStats.useQuery();

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!analytics) return null;
    
    const totalTx = analytics.dailyVolume.reduce((sum, d) => sum + d.count, 0);
    const avgDaily = totalTx / (days || 1);
    const totalGas = analytics.totalGasUsed;
    const avgGasPerTx = totalTx > 0 ? totalGas / totalTx : 0;
    
    // Tendência (comparar última semana com semana anterior)
    const lastWeek = analytics.dailyVolume.slice(-7);
    const prevWeek = analytics.dailyVolume.slice(-14, -7);
    const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.count, 0);
    const prevWeekTotal = prevWeek.reduce((sum, d) => sum + d.count, 0);
    const trend = prevWeekTotal > 0 ? ((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0;
    
    return { totalTx, avgDaily, totalGas, avgGasPerTx, trend };
  }, [analytics, days]);

  // Encontrar chain mais usada
  const topChain = useMemo(() => {
    if (!analytics?.byChain?.length) return null;
    return analytics.byChain.reduce((max, c) => c.count > max.count ? c : max, analytics.byChain[0]);
  }, [analytics]);

  // Nomes das chains
  const chainNames: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    56: "BSC",
    42161: "Arbitrum",
    1516: "Arc Network",
    11155111: "Sepolia",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('analytics.subtitle') || 'Métricas e insights das suas transações'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs text-muted-foreground">Total Transações</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="headline-massive text-2xl mt-1">{metrics?.totalTx || 0}</p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-[var(--color-cyan)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs text-muted-foreground">Média Diária</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="headline-massive text-2xl mt-1">{metrics?.avgDaily.toFixed(1) || 0}</p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-pink)]/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[var(--color-pink)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs text-muted-foreground">Gas Total</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="headline-massive text-2xl mt-1">
                      {metrics?.totalGas ? (metrics.totalGas / 1e9).toFixed(2) : 0} Gwei
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <Fuel className="h-5 w-5 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs text-muted-foreground">Tendência</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      {(metrics?.trend || 0) >= 0 ? (
                        <ArrowUp className="h-4 w-4 text-[var(--color-success)]" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-[var(--color-error)]" />
                      )}
                      <p className={`headline-massive text-2xl ${(metrics?.trend || 0) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                        {Math.abs(metrics?.trend || 0).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Volume Diário */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Volume de Transações</CardTitle>
              <CardDescription>Transações por dia nos últimos {days} dias</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : analytics?.dailyVolume && analytics.dailyVolume.length > 0 ? (
                <div className="h-[200px] flex items-end gap-1">
                  {analytics.dailyVolume.slice(-30).map((day, i) => {
                    const maxCount = Math.max(...analytics.dailyVolume.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[var(--color-cyan)] to-[var(--color-pink)] rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.date}: ${day.count} transações`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {day.count} tx
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>Nenhuma transação no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Por Chain */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Transações por Rede</CardTitle>
              <CardDescription>Distribuição por blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : analytics?.byChain && analytics.byChain.length > 0 ? (
                <div className="space-y-3">
                  {analytics.byChain.map((chain) => {
                    const total = analytics.byChain.reduce((sum, c) => sum + c.count, 0);
                    const percent = total > 0 ? (chain.count / total) * 100 : 0;
                    return (
                      <div key={chain.chainId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{chainNames[chain.chainId] || `Chain ${chain.chainId}`}</span>
                          <span className="text-muted-foreground">{chain.count} ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-pink)] rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>Nenhuma transação no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Por Tipo */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Transação</CardTitle>
              <CardDescription>Distribuição por tipo de operação</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : analytics?.byType && analytics.byType.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {analytics.byType.map((type) => {
                    const colors: Record<string, string> = {
                      deploy: "bg-[var(--color-cyan)]",
                      transfer: "bg-[var(--color-success)]",
                      call: "bg-[var(--color-pink)]",
                      approve: "bg-[var(--color-warning)]",
                    };
                    return (
                      <div key={type.txType} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-3 w-3 rounded-full ${colors[type.txType] || 'bg-primary'}`} />
                          <span className="text-sm font-medium capitalize">{type.txType}</span>
                        </div>
                        <p className="text-2xl font-bold">{type.count}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>Nenhuma transação no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status das Transações */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Status das Transações</CardTitle>
              <CardDescription>Visão geral do status</CardDescription>
            </CardHeader>
            <CardContent>
              {!txStats ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-[var(--color-success)]/10">
                      <p className="text-2xl font-bold text-[var(--color-success)]">{txStats.confirmed}</p>
                      <p className="text-xs text-muted-foreground">Confirmadas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--color-warning)]/10">
                      <p className="text-2xl font-bold text-[var(--color-warning)]">{txStats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--color-error)]/10">
                      <p className="text-2xl font-bold text-[var(--color-error)]">{txStats.failed}</p>
                      <p className="text-xs text-muted-foreground">Falhas</p>
                    </div>
                  </div>
                  
                  {/* Barra de sucesso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso</span>
                      <span className="text-[var(--color-success)]">
                        {txStats.total > 0 ? ((txStats.confirmed / txStats.total) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-[var(--color-success)]"
                        style={{ width: `${txStats.total > 0 ? (txStats.confirmed / txStats.total) * 100 : 0}%` }}
                      />
                      <div 
                        className="h-full bg-[var(--color-warning)]"
                        style={{ width: `${txStats.total > 0 ? (txStats.pending / txStats.total) * 100 : 0}%` }}
                      />
                      <div 
                        className="h-full bg-[var(--color-error)]"
                        style={{ width: `${txStats.total > 0 ? (txStats.failed / txStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
