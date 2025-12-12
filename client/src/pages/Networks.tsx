import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Network, 
  ExternalLink,
  CheckCircle,
  Globe,
  Zap,
  Shield,
  Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Default networks - SmartVault Network and Sepolia as primary
const DEFAULT_NETWORKS = [
  // PRIMARY NETWORKS
  {
    chainId: 5042002, // 0x4CEF52
    name: "Arc Testnet",
    symbol: "USDC",
    decimals: 6,
    rpcUrl: "https://rpc.testnet.arc.network",
    explorerUrl: "https://testnet.arcscan.app",
    faucetUrl: "https://faucet.circle.com/",
    isTestnet: true,
    isActive: true,
    isPrimary: true,
    color: "#00D4FF",
    gasToken: "USDC",
  },
  {
    chainId: 11155111, // 0xaa36a7
    name: "Ethereum Sepolia",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io",
    faucetUrl: "https://sepoliafaucet.com/",
    isTestnet: true,
    isActive: true,
    isPrimary: true,
    color: "#627EEA",
    gasToken: "ETH",
  },
  // MAINNETS
  {
    chainId: 1,
    name: "Ethereum Mainnet",
    symbol: "ETH",
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    isTestnet: false,
    isActive: true,
    isPrimary: false,
    color: "#627EEA",
  },
  {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    isTestnet: false,
    isActive: true,
    isPrimary: false,
    color: "#8247E5",
  },
  {
    chainId: 56,
    name: "BNB Smart Chain",
    symbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    isTestnet: false,
    isActive: true,
    isPrimary: false,
    color: "#F3BA2F",
  },
  {
    chainId: 42161,
    name: "Arbitrum One",
    symbol: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    isTestnet: false,
    isActive: true,
    isPrimary: false,
    color: "#28A0F0",
  },
  {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    isTestnet: false,
    isActive: true,
    isPrimary: false,
    color: "#FF0420",
  },
  // OTHER TESTNETS
  {
    chainId: 80001,
    name: "Mumbai Testnet",
    symbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true,
    isActive: true,
    isPrimary: false,
    color: "#8247E5",
  },
];

const RPC_PROVIDERS = [
  { name: "Alchemy", description: "APIs e infraestrutura Web3 de alta performance", url: "https://www.alchemy.com" },
  { name: "QuickNode", description: "Nós blockchain rápidos e confiáveis", url: "https://www.quicknode.com" },
  { name: "Blockdaemon", description: "Infraestrutura blockchain institucional", url: "https://blockdaemon.com" },
  { name: "Infura", description: "APIs Ethereum e IPFS escaláveis", url: "https://infura.io" },
];

export default function Networks() {
  const { data: dbNetworks, isLoading } = trpc.network.list.useQuery();
  
  // Use database networks if available, otherwise use defaults
  const networks = dbNetworks && dbNetworks.length > 0 
    ? dbNetworks.map(n => ({
        ...n,
        color: DEFAULT_NETWORKS.find(d => d.chainId === n.chainId)?.color || "#627EEA",
        isPrimary: DEFAULT_NETWORKS.find(d => d.chainId === n.chainId)?.isPrimary || false
      }))
    : DEFAULT_NETWORKS;

  const primaryNetworks = networks.filter(n => n.isPrimary);
  const mainnets = networks.filter(n => !n.isTestnet && !n.isPrimary);
  const testnets = networks.filter(n => n.isTestnet && !n.isPrimary);

  const openExplorer = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-massive text-2xl md:text-3xl">Redes Blockchain</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Redes EVM-compatíveis suportadas pela SmartVault
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Redes Principais</p>
                  <p className="headline-massive text-2xl mt-1">{primaryNetworks.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Mainnets</p>
                  <p className="headline-massive text-2xl mt-1">{mainnets.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Testnets</p>
                  <p className="headline-massive text-2xl mt-1">{testnets.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-label text-xs">Provedores RPC</p>
                  <p className="headline-massive text-2xl mt-1">{RPC_PROVIDERS.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center">
                  <Network className="h-5 w-5 text-[var(--color-cyan)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primary Networks - SmartVault Network & Sepolia */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Redes Principais (SmartVault Network & Sepolia)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {primaryNetworks.map((network) => (
              <Card key={network.chainId} className="border-primary/30 bg-primary/5 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-14 w-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${network.color}30` }}
                      >
                        <span 
                          className="font-bold text-xl"
                          style={{ color: network.color }}
                        >
                          {network.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{network.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Chain ID: {network.chainId}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Símbolo Nativo</span>
                      <span className="font-mono font-medium">{network.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Tipo</span>
                      <Badge variant="outline" className="text-[var(--color-warning)]">
                        Testnet
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">RPC URL</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{network.rpcUrl}</span>
                    </div>
                    {network.explorerUrl && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => openExplorer(network.explorerUrl!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Explorer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mainnets */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redes Principais (Mainnets)
          </h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainnets.map((network) => (
                <Card key={network.chainId} className="border-border card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
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
                          <h3 className="font-medium">{network.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Chain ID: {network.chainId}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-[var(--color-success)]">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Símbolo</span>
                        <span className="font-mono">{network.symbol}</span>
                      </div>
                      {network.explorerUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Explorer</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => openExplorer(network.explorerUrl!)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Other Testnets */}
        {testnets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Outras Redes de Teste
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testnets.map((network) => (
                <Card key={network.chainId} className="border-border card-hover border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center border-2 border-dashed"
                          style={{ borderColor: network.color }}
                        >
                          <span 
                            className="font-bold text-sm"
                            style={{ color: network.color }}
                          >
                            {network.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{network.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Chain ID: {network.chainId}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[var(--color-warning)]">
                        Testnet
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Símbolo</span>
                        <span className="font-mono">{network.symbol}</span>
                      </div>
                      {network.explorerUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Explorer</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => openExplorer(network.explorerUrl!)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* RPC Providers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Provedores RPC Recomendados</CardTitle>
            <CardDescription>
              Serviços de infraestrutura blockchain para conexão com as redes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {RPC_PROVIDERS.map((provider) => (
                <div 
                  key={provider.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(provider.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SmartVault Network Info */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-[var(--color-cyan)]/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="SmartVault" className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Arc Testnet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A SmartVault Network é uma blockchain de alta performance focada em escalabilidade e baixas taxas. 
                  Use a testnet para desenvolver e testar seus contratos inteligentes antes do deploy em produção.
                  Integração nativa com Circle USDC para taxas previsíveis.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Chain ID: 1516</Badge>
                  <Badge variant="outline">Símbolo: ARC</Badge>
                  <Badge variant="outline">EVM Compatível</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open("https://arc.network", "_blank")}>
                    Saiba Mais
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open("https://faucet.arc.network", "_blank")}>
                    Faucet (Tokens de Teste)
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sepolia Info */}
        <Card className="border-[#627EEA]/30 bg-gradient-to-br from-[#627EEA]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#627EEA]/20 flex items-center justify-center shrink-0">
                <span className="font-bold text-2xl text-[#627EEA]">Ξ</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Ethereum Sepolia Testnet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sepolia é a testnet recomendada para desenvolvimento Ethereum. Substitui Goerli como a principal 
                  rede de teste. Use para testar contratos inteligentes com ETH de teste gratuito.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Chain ID: 11155111</Badge>
                  <Badge variant="outline">Símbolo: ETH</Badge>
                  <Badge variant="outline">Proof of Stake</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open("https://sepolia.etherscan.io", "_blank")}>
                    Explorer
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open("https://sepoliafaucet.com", "_blank")}>
                    Faucet (ETH de Teste)
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
