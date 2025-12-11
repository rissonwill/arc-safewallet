import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Activity, 
  Wifi, 
  WifiOff, 
  Fuel, 
  Clock, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

interface NetworkInfo {
  name: string;
  chainId: number;
  color: string;
  rpcUrl: string;
  explorer: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  gasPrice: string;
  blockNumber: number;
  lastUpdate: Date;
}

const initialNetworks: NetworkInfo[] = [
  {
    name: "Axiom Network Testnet",
    chainId: 1516,
    color: "#00FFFF",
    rpcUrl: "https://rpc-testnet.arcnetwork.io",
    explorer: "https://testnet.arcscan.io",
    status: "online",
    latency: 45,
    gasPrice: "0.001",
    blockNumber: 1234567,
    lastUpdate: new Date(),
  },
  {
    name: "Sepolia Testnet",
    chainId: 11155111,
    color: "#627EEA",
    rpcUrl: "https://sepolia.infura.io",
    explorer: "https://sepolia.etherscan.io",
    status: "online",
    latency: 120,
    gasPrice: "20",
    blockNumber: 5678901,
    lastUpdate: new Date(),
  },
  {
    name: "Ethereum Mainnet",
    chainId: 1,
    color: "#627EEA",
    rpcUrl: "https://mainnet.infura.io",
    explorer: "https://etherscan.io",
    status: "online",
    latency: 85,
    gasPrice: "35",
    blockNumber: 19234567,
    lastUpdate: new Date(),
  },
  {
    name: "Polygon",
    chainId: 137,
    color: "#8247E5",
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    status: "online",
    latency: 60,
    gasPrice: "80",
    blockNumber: 54321098,
    lastUpdate: new Date(),
  },
  {
    name: "BSC",
    chainId: 56,
    color: "#F3BA2F",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
    status: "online",
    latency: 55,
    gasPrice: "3",
    blockNumber: 36789012,
    lastUpdate: new Date(),
  },
  {
    name: "Arbitrum",
    chainId: 42161,
    color: "#28A0F0",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    status: "online",
    latency: 70,
    gasPrice: "0.1",
    blockNumber: 187654321,
    lastUpdate: new Date(),
  },
];

export default function NetworkStatus() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [networks, setNetworks] = useState<NetworkInfo[]>(initialNetworks);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setNetworks(prev => prev.map(network => ({
      ...network,
      latency: Math.floor(Math.random() * 100) + 30,
      gasPrice: (parseFloat(network.gasPrice) * (0.9 + Math.random() * 0.2)).toFixed(network.chainId === 1516 ? 3 : 0),
      blockNumber: network.blockNumber + Math.floor(Math.random() * 10),
      lastUpdate: new Date(),
      status: Math.random() > 0.1 ? "online" : Math.random() > 0.5 ? "degraded" : "offline",
    })));
    
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-[var(--color-neon-green)]" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-[var(--color-neon-yellow)]" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "border-[var(--color-neon-green)]/50 bg-[var(--color-neon-green)]/10 text-[var(--color-neon-green)]";
      case "degraded":
        return "border-[var(--color-neon-yellow)]/50 bg-[var(--color-neon-yellow)]/10 text-[var(--color-neon-yellow)]";
      case "offline":
        return "border-red-500/50 bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const onlineCount = networks.filter(n => n.status === "online").length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-[var(--color-neon-cyan)]/20 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-[var(--color-neon-cyan)]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={getStatusColor("online")}>
              {onlineCount}/{networks.length} Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="border-[var(--color-neon-cyan)]/50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </nav>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-neon-text">Status das Redes</span>
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de todas as redes suportadas
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Última atualização: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networks.map((network, index) => (
            <Card 
              key={index} 
              className={`border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-neon-cyan)]/50 ${
                network.status === "offline" ? "opacity-60" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${network.color}20` }}
                    >
                      {network.status === "online" ? (
                        <Wifi className="h-5 w-5" style={{ color: network.color }} />
                      ) : (
                        <WifiOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{network.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Chain ID: {network.chainId}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(network.status)}>
                    {getStatusIcon(network.status)}
                    <span className="ml-1 capitalize">{network.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      Latência
                    </div>
                    <p className="font-semibold" style={{ color: network.color }}>
                      {network.latency}ms
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Fuel className="h-3 w-3" />
                      Gas Price
                    </div>
                    <p className="font-semibold" style={{ color: network.color }}>
                      {network.gasPrice} Gwei
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Activity className="h-3 w-3" />
                    Último Bloco
                  </div>
                  <p className="font-mono text-sm">#{network.blockNumber.toLocaleString()}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => window.open(network.explorer, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Explorer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-[var(--color-neon-cyan)]/50 text-[var(--color-neon-cyan)]"
                    onClick={() => setLocation("/deploy")}
                  >
                    Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
