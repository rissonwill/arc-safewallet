import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar,
  Sparkles,
  Bug,
  Zap,
  Shield,
  Rocket,
  Code,
  GitBranch,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  changes: {
    type: "feature" | "fix" | "improvement" | "security";
    text: string;
    textEn: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2025-01-15",
    type: "major",
    title: "Lançamento Oficial",
    titleEn: "Official Launch",
    description: "Primeira versão estável do SmartVault com todas as funcionalidades principais.",
    descriptionEn: "First stable version of SmartVault with all main features.",
    changes: [
      { type: "feature", text: "Editor Solidity com syntax highlighting completo", textEn: "Solidity Editor with complete syntax highlighting" },
      { type: "feature", text: "Deploy multi-chain para Ethereum, Polygon, BSC e Arc", textEn: "Multi-chain deploy to Ethereum, Polygon, BSC and Arc" },
      { type: "feature", text: "Security Scanner com detecção de 15+ vulnerabilidades", textEn: "Security Scanner with 15+ vulnerability detection" },
      { type: "feature", text: "Integração MetaMask e WalletConnect v2", textEn: "MetaMask and WalletConnect v2 integration" },
      { type: "feature", text: "Dashboard de projetos com analytics", textEn: "Project dashboard with analytics" },
      { type: "security", text: "Auditoria de segurança completa", textEn: "Complete security audit" },
    ]
  },
  {
    version: "0.9.0",
    date: "2024-12-20",
    type: "minor",
    title: "Beta Público",
    titleEn: "Public Beta",
    description: "Versão beta aberta para a comunidade com melhorias significativas.",
    descriptionEn: "Open beta version for the community with significant improvements.",
    changes: [
      { type: "feature", text: "NFT Marketplace integrado", textEn: "Integrated NFT Marketplace" },
      { type: "feature", text: "Staking Vault com recompensas", textEn: "Staking Vault with rewards" },
      { type: "feature", text: "Sistema de governança DAO", textEn: "DAO governance system" },
      { type: "improvement", text: "Performance do editor melhorada em 50%", textEn: "Editor performance improved by 50%" },
      { type: "fix", text: "Correção de bugs no deploy para testnet", textEn: "Fixed bugs in testnet deploy" },
    ]
  },
  {
    version: "0.8.0",
    date: "2024-11-15",
    type: "minor",
    title: "Debugger & Gas Tracker",
    titleEn: "Debugger & Gas Tracker",
    description: "Novas ferramentas de desenvolvimento e otimização.",
    descriptionEn: "New development and optimization tools.",
    changes: [
      { type: "feature", text: "Debugger integrado com breakpoints", textEn: "Integrated debugger with breakpoints" },
      { type: "feature", text: "Gas Tracker em tempo real", textEn: "Real-time Gas Tracker" },
      { type: "feature", text: "Estimativa de custos de transação", textEn: "Transaction cost estimation" },
      { type: "improvement", text: "Interface do dashboard redesenhada", textEn: "Redesigned dashboard interface" },
      { type: "fix", text: "Correção de conexão com redes testnet", textEn: "Fixed testnet network connection" },
    ]
  },
  {
    version: "0.7.0",
    date: "2024-10-01",
    type: "minor",
    title: "Multi-idioma & UX",
    titleEn: "Multi-language & UX",
    description: "Suporte a múltiplos idiomas e melhorias de experiência do usuário.",
    descriptionEn: "Multi-language support and user experience improvements.",
    changes: [
      { type: "feature", text: "Suporte a Português e Inglês", textEn: "Portuguese and English support" },
      { type: "feature", text: "Tema dark mode otimizado", textEn: "Optimized dark mode theme" },
      { type: "improvement", text: "Navegação mobile aprimorada", textEn: "Enhanced mobile navigation" },
      { type: "improvement", text: "Animações e transições suaves", textEn: "Smooth animations and transitions" },
      { type: "fix", text: "Correção de layout em dispositivos móveis", textEn: "Fixed layout on mobile devices" },
    ]
  },
  {
    version: "0.6.0",
    date: "2024-09-01",
    type: "minor",
    title: "Templates & Documentação",
    titleEn: "Templates & Documentation",
    description: "Biblioteca de templates e documentação interativa.",
    descriptionEn: "Template library and interactive documentation.",
    changes: [
      { type: "feature", text: "10+ templates de smart contracts", textEn: "10+ smart contract templates" },
      { type: "feature", text: "Documentação interativa com exemplos", textEn: "Interactive documentation with examples" },
      { type: "feature", text: "Gerador de documentação automático", textEn: "Automatic documentation generator" },
      { type: "improvement", text: "Busca inteligente de funções", textEn: "Smart function search" },
    ]
  },
  {
    version: "0.5.0",
    date: "2024-08-01",
    type: "minor",
    title: "Alpha Privado",
    titleEn: "Private Alpha",
    description: "Primeira versão alpha para testadores selecionados.",
    descriptionEn: "First alpha version for selected testers.",
    changes: [
      { type: "feature", text: "Editor de código básico", textEn: "Basic code editor" },
      { type: "feature", text: "Deploy para Sepolia testnet", textEn: "Deploy to Sepolia testnet" },
      { type: "feature", text: "Conexão com MetaMask", textEn: "MetaMask connection" },
      { type: "security", text: "Implementação de autenticação segura", textEn: "Secure authentication implementation" },
    ]
  },
];

export default function Changelog() {
  const [, setLocation] = useLocation();
  const { t, language } = useI18n();

  const getTypeColor = (type: "major" | "minor" | "patch") => {
    switch (type) {
      case "major":
        return "bg-[var(--color-neon-magenta)]/20 text-[var(--color-neon-magenta)] border-[var(--color-neon-magenta)]/50";
      case "minor":
        return "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/50";
      case "patch":
        return "bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/50";
    }
  };

  const getTypeLabel = (type: "major" | "minor" | "patch") => {
    switch (type) {
      case "major":
        return language === "pt" ? "Major" : "Major";
      case "minor":
        return language === "pt" ? "Minor" : "Minor";
      case "patch":
        return language === "pt" ? "Patch" : "Patch";
    }
  };

  const getChangeIcon = (type: "feature" | "fix" | "improvement" | "security") => {
    switch (type) {
      case "feature":
        return <Sparkles className="h-4 w-4 text-[var(--color-neon-cyan)]" />;
      case "fix":
        return <Bug className="h-4 w-4 text-[var(--color-neon-magenta)]" />;
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-[var(--color-neon-green)]" />;
      case "security":
        return <Shield className="h-4 w-4 text-[var(--color-neon-purple)]" />;
    }
  };

  const getChangeLabel = (type: "feature" | "fix" | "improvement" | "security") => {
    switch (type) {
      case "feature":
        return language === "pt" ? "Novo" : "New";
      case "fix":
        return language === "pt" ? "Correção" : "Fix";
      case "improvement":
        return language === "pt" ? "Melhoria" : "Improvement";
      case "security":
        return language === "pt" ? "Segurança" : "Security";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
      
      {/* Animated Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--color-neon-purple)]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--color-neon-cyan)]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--color-neon-purple)]/40 bg-background backdrop-blur-xl shadow-lg shadow-black/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-neon-cyan)] via-[var(--color-neon-magenta)] to-[var(--color-neon-purple)] rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] flex items-center justify-center shadow-lg shadow-[var(--color-neon-cyan)]/50">
                <img src="/smartvault-logo.png" alt="SmartVault" className="h-6 w-6 sm:h-8 sm:w-8 drop-shadow-[0_0_8px_var(--color-neon-cyan)]" />
              </div>
            </div>
            <span className="font-bold text-lg sm:text-2xl uppercase tracking-wider gradient-neon-text drop-shadow-[0_0_10px_var(--color-neon-cyan)]" style={{ fontFamily: 'var(--font-cyber)' }}>SmartVault</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-[var(--color-neon-cyan)]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "pt" ? "Voltar" : "Back"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 sm:pt-32">
        <div className="container max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] border-[var(--color-neon-purple)]/50 px-4 py-1.5">
              <GitBranch className="h-3 w-3 mr-1" />
              {language === "pt" ? "Histórico de Versões" : "Version History"}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-neon-text">Changelog</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "pt" 
                ? "Acompanhe todas as atualizações, novas funcionalidades e correções do SmartVault."
                : "Track all updates, new features and fixes of SmartVault."
              }
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-neon-cyan)] via-[var(--color-neon-purple)] to-[var(--color-neon-magenta)] transform md:-translate-x-1/2" />

            {/* Changelog Entries */}
            <div className="space-y-8">
              {changelogData.map((entry, index) => (
                <div 
                  key={entry.version}
                  className={`relative flex flex-col md:flex-row gap-4 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] transform -translate-x-1/2 md:-translate-x-1/2 mt-6 shadow-lg shadow-[var(--color-neon-cyan)]/50 z-10" />

                  {/* Content */}
                  <div className={`flex-1 pl-8 md:pl-0 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                    <Card className="bg-card/80 backdrop-blur-sm border-[var(--color-neon-purple)]/30 hover:border-[var(--color-neon-cyan)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-neon-cyan)]/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[var(--color-neon-cyan)]">v{entry.version}</span>
                            <Badge className={getTypeColor(entry.type)}>
                              {getTypeLabel(entry.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(entry.date)}
                          </div>
                        </div>
                        <CardTitle className="text-lg text-foreground mt-2">
                          {language === "pt" ? entry.title : entry.titleEn}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {language === "pt" ? entry.description : entry.descriptionEn}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {entry.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="flex items-start gap-2 text-sm">
                              <span className="mt-0.5">{getChangeIcon(change.type)}</span>
                              <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">[{getChangeLabel(change.type)}]</span>{" "}
                                {language === "pt" ? change.text : change.textEn}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-[var(--color-neon-cyan)]/30 text-center p-4">
              <p className="text-3xl font-bold text-[var(--color-neon-cyan)]">6</p>
              <p className="text-sm text-muted-foreground">{language === "pt" ? "Versões" : "Versions"}</p>
            </Card>
            <Card className="bg-card/50 border-[var(--color-neon-magenta)]/30 text-center p-4">
              <p className="text-3xl font-bold text-[var(--color-neon-magenta)]">25+</p>
              <p className="text-sm text-muted-foreground">{language === "pt" ? "Features" : "Features"}</p>
            </Card>
            <Card className="bg-card/50 border-[var(--color-neon-green)]/30 text-center p-4">
              <p className="text-3xl font-bold text-[var(--color-neon-green)]">10+</p>
              <p className="text-sm text-muted-foreground">{language === "pt" ? "Correções" : "Fixes"}</p>
            </Card>
            <Card className="bg-card/50 border-[var(--color-neon-purple)]/30 text-center p-4">
              <p className="text-3xl font-bold text-[var(--color-neon-purple)]">8</p>
              <p className="text-sm text-muted-foreground">{language === "pt" ? "Meses" : "Months"}</p>
            </Card>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === "pt" 
                ? "Quer ver o que vem por aí?"
                : "Want to see what's coming?"
              }
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "pt"
                ? "Confira nosso roadmap para ver as próximas funcionalidades planejadas."
                : "Check our roadmap to see the upcoming planned features."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => setLocation("/roadmap")}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold hover:opacity-90"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {language === "pt" ? "Ver Roadmap" : "View Roadmap"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="border-[var(--color-neon-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/10"
              >
                <Code className="h-4 w-4 mr-2" />
                {language === "pt" ? "Começar a Desenvolver" : "Start Developing"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
