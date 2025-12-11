import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Rocket,
  ArrowLeft,
  Calendar,
  Target
} from "lucide-react";
import { Link } from "wouter";

const roadmapItems = [
  {
    quarter: "Q4 2024",
    status: "completed",
    title: "Lançamento Beta",
    items: [
      { text: "Editor Solidity com syntax highlighting", done: true },
      { text: "Deploy para SmartVault Network Testnet", done: true },
      { text: "Security Scanner básico", done: true },
      { text: "Integração MetaMask", done: true },
      { text: "Dashboard de projetos", done: true }
    ]
  },
  {
    quarter: "Q1 2025",
    status: "in-progress",
    title: "Expansão de Funcionalidades",
    items: [
      { text: "Debugger integrado com breakpoints", done: true },
      { text: "Deploy multi-chain (Ethereum, Polygon, BSC)", done: true },
      { text: "Gas Tracker em tempo real", done: true },
      { text: "WalletConnect v2 integration", done: false },
      { text: "API pública para desenvolvedores", done: false }
    ]
  },
  {
    quarter: "Q2 2025",
    status: "planned",
    title: "Ferramentas Avançadas",
    items: [
      { text: "Documentação automática com IA", done: false },
      { text: "Testnet Playground com faucet", done: false },
      { text: "SDK para integração externa", done: false },
      { text: "Marketplace de templates", done: false },
      { text: "Auditoria colaborativa", done: false }
    ]
  },
  {
    quarter: "Q3 2025",
    status: "planned",
    title: "Ecossistema Completo",
    items: [
      { text: "NFT Marketplace integrado", done: false },
      { text: "Sistema de governança DAO", done: false },
      { text: "Staking de tokens ARC", done: false },
      { text: "Mobile app (iOS/Android)", done: false },
      { text: "Enterprise features", done: false }
    ]
  }
];

const statusColors = {
  completed: "bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30",
  "in-progress": "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/30",
  planned: "bg-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] border-[var(--color-neon-purple)]/30"
};

const statusLabels = {
  completed: "Concluído",
  "in-progress": "Em Progresso",
  planned: "Planejado"
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SmartVault" className="w-10 h-10" />
              <span className="text-xl font-bold gradient-neon-text" style={{ fontFamily: 'var(--font-cyber)' }}>
                SMARTVAULT
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
      <section className="py-16 bg-gradient-to-b from-[var(--color-neon-purple)]/10 to-background">
        <div className="container text-center">
          <Badge variant="outline" className="mb-4 border-[var(--color-neon-purple)]/50">
            <Target className="w-3 h-3 mr-1" />
            Roadmap Público
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[var(--color-neon-purple)]">Nossa Jornada</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acompanhe o desenvolvimento do SmartVault e veja o que está por vir.
          </p>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            {roadmapItems.map((quarter, index) => (
              <Card key={index} className="relative overflow-hidden">
                {/* Status indicator line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    quarter.status === 'completed' ? 'bg-[var(--color-neon-green)]' :
                    quarter.status === 'in-progress' ? 'bg-[var(--color-neon-cyan)]' :
                    'bg-[var(--color-neon-purple)]'
                  }`}
                />
                
                <CardHeader className="pl-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="font-mono text-lg">{quarter.quarter}</span>
                    </div>
                    <Badge className={statusColors[quarter.status as keyof typeof statusColors]}>
                      {quarter.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {quarter.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                      {quarter.status === 'planned' && <Rocket className="w-3 h-3 mr-1" />}
                      {statusLabels[quarter.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">{quarter.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="pl-6">
                  <ul className="space-y-3">
                    {quarter.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {item.done ? (
                          <CheckCircle className="w-5 h-5 text-[var(--color-neon-green)] shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                        )}
                        <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-green)] mb-2">70%</div>
              <p className="text-muted-foreground">Progresso Total</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-cyan)] mb-2">15</div>
              <p className="text-muted-foreground">Features Entregues</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-neon-purple)] mb-2">10</div>
              <p className="text-muted-foreground">Features Planejadas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
