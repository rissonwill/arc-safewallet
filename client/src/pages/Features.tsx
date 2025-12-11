import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Shield, 
  Zap, 
  Globe, 
  Bug, 
  FileCode2,
  Wallet,
  Fuel,
  Lock,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/i18n";

const features = [
  {
    icon: Code,
    title: "Editor Solidity Avançado",
    description: "Editor completo com syntax highlighting, autocompletion, validação em tempo real e snippets para acelerar seu desenvolvimento.",
    benefits: ["Syntax highlighting", "Autocompletion inteligente", "Validação em tempo real", "Snippets prontos"],
    color: "cyan"
  },
  {
    icon: Bug,
    title: "Debugger Integrado",
    description: "Debug de contratos com breakpoints, inspeção de variáveis, call stack e step-by-step execution.",
    benefits: ["Breakpoints visuais", "Inspeção de variáveis", "Call stack completo", "Step execution"],
    color: "magenta"
  },
  {
    icon: Shield,
    title: "Security Scanner",
    description: "Análise automática de vulnerabilidades: reentrancy, overflow, access control, gas optimization e mais.",
    benefits: ["Detecção de reentrancy", "Análise de overflow", "Access control audit", "Gas optimization tips"],
    color: "green"
  },
  {
    icon: Globe,
    title: "Deploy Multi-Chain",
    description: "Deploy para Arc Network, Ethereum, Polygon, BSC, Arbitrum e outras redes EVM com um clique.",
    benefits: ["6+ redes suportadas", "Deploy com 1 clique", "Verificação automática", "Gas estimation"],
    color: "purple"
  },
  {
    icon: Fuel,
    title: "Gas Tracker",
    description: "Monitoramento de gas fees em tempo real via APIs do Etherscan e Alchemy para todas as redes.",
    benefits: ["Preços em tempo real", "Histórico de gas", "Alertas de preço", "Estimativas precisas"],
    color: "orange"
  },
  {
    icon: Sparkles,
    title: "Documentação IA",
    description: "Geração automática de documentação técnica com LLM para seus contratos inteligentes.",
    benefits: ["Geração automática", "NatSpec compliant", "Markdown export", "Diagramas UML"],
    color: "cyan"
  },
  {
    icon: Wallet,
    title: "Integração WalletConnect",
    description: "Conecte qualquer wallet compatível com WalletConnect para interagir com seus contratos.",
    benefits: ["MetaMask", "WalletConnect v2", "Coinbase Wallet", "Trust Wallet"],
    color: "magenta"
  },
  {
    icon: Lock,
    title: "Testnet Playground",
    description: "Ambiente seguro para testar seus contratos antes do deploy em mainnet.",
    benefits: ["Faucet integrado", "Ambiente isolado", "Logs detalhados", "Reset rápido"],
    color: "green"
  }
];

const colorClasses = {
  cyan: "text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan)]/10",
  magenta: "text-[var(--color-neon-magenta)] border-[var(--color-neon-magenta)]/30 bg-[var(--color-neon-magenta)]/10",
  green: "text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30 bg-[var(--color-neon-green)]/10",
  purple: "text-[var(--color-neon-purple)] border-[var(--color-neon-purple)]/30 bg-[var(--color-neon-purple)]/10",
  orange: "text-[var(--color-neon-orange)] border-[var(--color-neon-orange)]/30 bg-[var(--color-neon-orange)]/10"
};

export default function Features() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Arc SafeWallet" className="w-10 h-10" />
              <span className="text-xl font-bold gradient-neon-text" style={{ fontFamily: 'var(--font-cyber)' }}>
                ARC SAFEWALLET
              </span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-[var(--color-neon-cyan)]/10 to-background">
        <div className="container text-center">
          <Badge variant="outline" className="mb-4 border-[var(--color-neon-cyan)]/50">
            <Zap className="w-3 h-3 mr-1" />
            Funcionalidades Completas
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-neon-text">
            Tudo que Você Precisa para Web3
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para desenvolver, testar e fazer deploy de smart contracts com segurança e eficiência.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`card-hover border ${colorClasses[feature.color as keyof typeof colorClasses]}`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[var(--color-neon-green)]" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-t from-[var(--color-neon-magenta)]/10 to-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Crie sua conta gratuita e comece a desenvolver smart contracts seguros hoje mesmo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => setLocation("/docs")}>
              Ver Documentação
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
