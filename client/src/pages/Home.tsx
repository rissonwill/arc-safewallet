import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  FileCode2, 
  Wallet, 
  Fuel,
  ArrowRight,
  Blocks,
  Shield,
  Zap,
  Globe,
  Code,
  BookOpen,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: FileCode2,
      title: "Editor Solidity",
      description: "Editor de contratos inteligentes com syntax highlighting e compilação integrada",
      color: "text-[var(--color-cyan)]",
      bg: "bg-[var(--color-cyan)]/10",
    },
    {
      icon: Rocket,
      title: "Deploy Multi-Chain",
      description: "Deploy para Ethereum, Polygon, BSC, Arbitrum e outras redes EVM",
      color: "text-[var(--color-pink)]",
      bg: "bg-[var(--color-pink)]/10",
    },
    {
      icon: Wallet,
      title: "Integração Web3",
      description: "Conecte MetaMask, WalletConnect e outras carteiras populares",
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
    {
      icon: Fuel,
      title: "Gas Tracker",
      description: "Monitoramento de gas fees em tempo real para otimizar custos",
      color: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning)]/10",
    },
    {
      icon: Blocks,
      title: "Templates Prontos",
      description: "ERC-20, ERC-721, ERC-1155 e outros padrões auditados",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Shield,
      title: "Documentação IA",
      description: "Geração automática de documentação técnica com LLM",
      color: "text-[var(--color-cyan)]",
      bg: "bg-[var(--color-cyan)]/10",
    },
  ];

  const networks = [
    { name: "Ethereum", color: "#627EEA" },
    { name: "Polygon", color: "#8247E5" },
    { name: "BSC", color: "#F3BA2F" },
    { name: "Arbitrum", color: "#28A0F0" },
    { name: "Optimism", color: "#FF0420" },
    { name: "Arc Network", color: "#00D4FF" },
  ];

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 blueprint-grid opacity-30 pointer-events-none" />
      
      {/* Geometric Decorations */}
      <div className="fixed top-20 left-10 w-32 h-32 border border-[var(--color-cyan)]/20 rounded-full opacity-50" />
      <div className="fixed top-40 right-20 w-24 h-24 border border-[var(--color-pink)]/20 rotate-45 opacity-50" />
      <div className="fixed bottom-40 left-20 w-16 h-16 border border-[var(--color-cyan)]/30 opacity-50" />
      <div className="fixed bottom-20 right-40 w-40 h-40 border border-[var(--color-pink)]/20 rounded-full opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="headline-massive text-xl">Super Dev Web3</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/docs")}>
              <BookOpen className="h-4 w-4 mr-1" />
              Docs
            </Button>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              Entrar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Formula decoration */}
            <div className="flex justify-center gap-4 mb-6 text-xs font-mono text-muted-foreground/50">
              <span>∫ blockchain dx</span>
              <span>•</span>
              <span>Σ smart contracts</span>
              <span>•</span>
              <span>∂ Web3 / ∂t</span>
            </div>
            
            <Badge variant="outline" className="mb-6 border-primary/30">
              <Zap className="h-3 w-3 mr-1" />
              Plataforma de Desenvolvimento Web3
            </Badge>
            
            <h1 className="headline-massive text-4xl md:text-6xl lg:text-7xl mb-6">
              Desenvolva Contratos
              <br />
              <span className="text-primary">Inteligentes</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Plataforma completa para gerenciar projetos Web3, criar contratos Solidity, 
              fazer deploy em múltiplas blockchains e monitorar transações.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/docs")}>
                <BookOpen className="h-5 w-5 mr-2" />
                Ver Documentação
              </Button>
            </div>
            
            {/* Tech labels */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {["Solidity", "EVM", "TypeScript", "OpenZeppelin", "Ethers.js"].map((tech) => (
                <span key={tech} className="tech-label text-xs px-2 py-1 rounded bg-muted">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="relative z-10 py-12 border-y border-border/50 bg-muted/30">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Suporte para múltiplas redes blockchain
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {networks.map((network) => (
              <div key={network.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: network.color }}
                />
                <span className="text-sm font-medium">{network.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="headline-massive text-3xl md:text-4xl mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para desenvolvimento Web3, desde a criação 
              até o deploy e monitoramento de contratos inteligentes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border card-hover">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="relative z-10 py-20 bg-muted/30 border-y border-border/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <Globe className="h-3 w-3 mr-1" />
                Integrações
              </Badge>
              <h2 className="headline-massive text-3xl md:text-4xl mb-4">
                Arc Network & Circle
              </h2>
              <p className="text-muted-foreground mb-6">
                Integração completa com Arc Network para alta performance e Circle.com 
                para pagamentos em USDC com taxas previsíveis.
              </p>
              
              <div className="space-y-3">
                {[
                  "Suporte a múltiplas blockchains EVM-compatíveis",
                  "Taxas previsíveis com USDC",
                  "Provedores de nó: Alchemy, QuickNode, Blockdaemon",
                  "Deploy simplificado para produção",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              {/* Blueprint-style diagram */}
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 border-2 border-dashed border-[var(--color-cyan)]/30 rounded-lg" />
                <div className="absolute inset-4 border border-[var(--color-pink)]/20 rounded-lg" />
                <div className="absolute inset-8 border border-border rounded-lg bg-background/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Blocks className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      Web3 Infrastructure
                    </p>
                  </div>
                </div>
                {/* Connection lines */}
                <div className="absolute top-1/2 left-0 w-8 h-px bg-[var(--color-cyan)]/50" />
                <div className="absolute top-1/2 right-0 w-8 h-px bg-[var(--color-pink)]/50" />
                <div className="absolute top-0 left-1/2 w-px h-8 bg-[var(--color-cyan)]/50" />
                <div className="absolute bottom-0 left-1/2 w-px h-8 bg-[var(--color-pink)]/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="headline-massive text-3xl md:text-4xl mb-4">
                Pronto para começar?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Crie sua conta gratuitamente e comece a desenvolver 
                contratos inteligentes em minutos.
              </p>
              <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
                Criar Conta Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Super Dev Web3</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Plataforma de desenvolvimento Web3 • {new Date().getFullYear()}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => setLocation("/docs")} className="hover:text-foreground transition-colors">
                Documentação
              </button>
              <span>•</span>
              <a href="https://arc.network" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Arc Network
              </a>
              <span>•</span>
              <a href="https://circle.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Circle
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
