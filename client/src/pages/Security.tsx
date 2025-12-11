import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Bug,
  FileSearch,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";

const securityFeatures = [
  {
    icon: Bug,
    title: "Detecção de Reentrancy",
    description: "Identificação automática de vulnerabilidades de reentrancy que podem drenar fundos do contrato.",
    severity: "critical"
  },
  {
    icon: AlertTriangle,
    title: "Overflow/Underflow",
    description: "Análise de operações matemáticas que podem causar overflow ou underflow em variáveis.",
    severity: "high"
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Verificação de permissões e controle de acesso em funções críticas do contrato.",
    severity: "high"
  },
  {
    icon: Eye,
    title: "Front-Running",
    description: "Detecção de vulnerabilidades que permitem front-running de transações.",
    severity: "medium"
  },
  {
    icon: FileSearch,
    title: "Gas Optimization",
    description: "Sugestões para otimizar o consumo de gas e reduzir custos de transação.",
    severity: "low"
  },
  {
    icon: Zap,
    title: "Denial of Service",
    description: "Identificação de padrões que podem causar DoS no contrato.",
    severity: "high"
  }
];

const severityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

const auditProcess = [
  {
    step: 1,
    title: "Upload do Código",
    description: "Faça upload do seu contrato Solidity ou cole o código diretamente no editor."
  },
  {
    step: 2,
    title: "Análise Automática",
    description: "Nosso scanner analisa o código em busca de vulnerabilidades conhecidas."
  },
  {
    step: 3,
    title: "Relatório Detalhado",
    description: "Receba um relatório completo com todas as vulnerabilidades encontradas."
  },
  {
    step: 4,
    title: "Correção Guiada",
    description: "Siga as sugestões de correção para cada vulnerabilidade identificada."
  }
];

export default function Security() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Axiom Labs" className="w-10 h-10" />
              <span className="text-xl font-bold gradient-neon-text" style={{ fontFamily: 'var(--font-cyber)' }}>
                AXIOM LABS
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
      <section className="py-16 bg-gradient-to-b from-[var(--color-neon-green)]/10 to-background">
        <div className="container text-center">
          <Badge variant="outline" className="mb-4 border-[var(--color-neon-green)]/50">
            <Shield className="w-3 h-3 mr-1" />
            Segurança em Primeiro Lugar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[var(--color-neon-green)]">Security Scanner</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Análise automática de vulnerabilidades em smart contracts. Proteja seus usuários e fundos antes do deploy.
          </p>
        </div>
      </section>

      {/* Vulnerabilities Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Vulnerabilidades Detectadas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-neon-green)]/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-[var(--color-neon-green)]" />
                    </div>
                    <Badge className={severityColors[feature.severity as keyof typeof severityColors]}>
                      {feature.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Process */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {auditProcess.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-neon-cyan)] text-black font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-cyan)] mb-2">15+</div>
              <p className="text-muted-foreground">Tipos de Vulnerabilidades</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-magenta)] mb-2">1000+</div>
              <p className="text-muted-foreground">Contratos Analisados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-green)] mb-2">99.9%</div>
              <p className="text-muted-foreground">Taxa de Detecção</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-purple)] mb-2">&lt;5s</div>
              <p className="text-muted-foreground">Tempo de Análise</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-t from-[var(--color-neon-green)]/10 to-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Proteja Seus Contratos</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Comece a análise de segurança agora e garanta que seus smart contracts estão seguros.
          </p>
          <Button 
            onClick={() => setLocation("/dashboard")}
            className="bg-[var(--color-neon-green)] text-black font-semibold hover:bg-[var(--color-neon-green)]/90"
          >
            Analisar Contrato
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
