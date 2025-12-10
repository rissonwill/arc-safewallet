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
  CheckCircle,
  Bug,
  Sparkles,
  Lock,
  Terminal
} from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { useI18n, LanguageSelector } from "@/i18n";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const [glowIndex, setGlowIndex] = useState(0);

  // Animated glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIndex((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FileCode2,
      title: t('home.feature.editor'),
      description: t('home.feature.editorDesc'),
      color: "text-[var(--color-neon-cyan)]",
      bg: "bg-[var(--color-neon-cyan)]/10",
      glow: "neon-glow-cyan",
    },
    {
      icon: Bug,
      title: t('home.feature.debugger'),
      description: t('home.feature.debuggerDesc'),
      color: "text-[var(--color-neon-green)]",
      bg: "bg-[var(--color-neon-green)]/10",
      glow: "neon-glow-green",
    },
    {
      icon: Shield,
      title: t('home.feature.security'),
      description: t('home.feature.securityDesc'),
      color: "text-[var(--color-neon-purple)]",
      bg: "bg-[var(--color-neon-purple)]/10",
      glow: "neon-glow-purple",
    },
    {
      icon: Rocket,
      title: t('home.feature.deploy'),
      description: t('home.feature.deployDesc'),
      color: "text-[var(--color-neon-magenta)]",
      bg: "bg-[var(--color-neon-magenta)]/10",
      glow: "neon-glow-magenta",
    },
    {
      icon: Fuel,
      title: t('home.feature.gas'),
      description: t('home.feature.gasDesc'),
      color: "text-[var(--color-neon-yellow)]",
      bg: "bg-[var(--color-neon-yellow)]/10",
      glow: "",
    },
    {
      icon: Sparkles,
      title: t('home.feature.docs'),
      description: t('home.feature.docsDesc'),
      color: "text-[var(--color-neon-cyan)]",
      bg: "bg-[var(--color-neon-cyan)]/10",
      glow: "neon-glow-cyan",
    },
  ];

  const networks = [
    { name: "Arc Network Testnet", color: "#00FFFF", primary: true },
    { name: "Sepolia Testnet", color: "#627EEA", primary: true },
    { name: "Ethereum Mainnet", color: "#627EEA", primary: false },
    { name: "Polygon", color: "#8247E5", primary: false },
    { name: "BSC", color: "#F3BA2F", primary: false },
    { name: "Arbitrum", color: "#28A0F0", primary: false },
  ];

  const stats = [
    { label: t('home.networksSupported'), value: "6+" },
    { label: t('home.templates'), value: "10+" },
    { label: t('home.vulnerabilities'), value: "15+" },
  ];

  // Remover redirecionamento automático para permitir voltar à Home
  // O usuário pode clicar em "Dashboard" no menu se quiser ir para lá

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none" />
      
      {/* Animated Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-neon-cyan)]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-neon-magenta)]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-neon-purple)]/5 rounded-full blur-[120px]" />
      </div>
      
      {/* Geometric Decorations - Cyber Style */}
      <div className="fixed top-20 left-10 w-32 h-32 border border-[var(--color-neon-cyan)]/30 rounded-full opacity-50 animate-pulse" />
      <div className="fixed top-40 right-20 w-24 h-24 border border-[var(--color-neon-magenta)]/30 rotate-45 opacity-50" />
      <div className="fixed bottom-40 left-20 w-16 h-16 border-2 border-[var(--color-neon-green)]/40 opacity-50" />
      <div className="fixed bottom-20 right-40 w-40 h-40 border border-[var(--color-neon-purple)]/20 rounded-full opacity-30" />
      
      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-neon-cyan)] to-transparent h-[2px] animate-[scan-line_4s_linear_infinite]" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-[var(--color-neon-cyan)]/20 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] flex items-center justify-center neon-glow-cyan">
              <img src="/logo.png" alt="Arc SafeWallet" className="h-6 w-6" />
            </div>
            <span className="headline-cyber text-xl gradient-neon-text">Arc SafeWallet</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button variant="ghost" onClick={() => setLocation("/docs")} className="text-muted-foreground hover:text-[var(--color-neon-cyan)]">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('nav.docs')}
            </Button>
            {isAuthenticated ? (
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold hover:opacity-90 transition-opacity"
              >
                {t('nav.dashboard')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold hover:opacity-90 transition-opacity"
              >
                {t('home.getStarted')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/30 px-4 py-1.5">
              <Zap className="h-3 w-3 mr-1" />
              {t('home.poweredBy')}
            </Badge>
            
            <h1 className="headline-cyber text-4xl md:text-6xl lg:text-7xl mb-6">
              <span className="gradient-neon-text">{t('home.title')}</span>
              <br />
              <span className="text-foreground">{t('home.subtitle')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-bold text-lg px-8 hover:opacity-90 transition-all neon-glow-cyan"
              >
                {t('home.getStarted')}
                <Rocket className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation("/docs")}
                className="border-[var(--color-neon-cyan)]/50 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/10"
              >
                <Terminal className="h-5 w-5 mr-2" />
                {t('home.learnMore')}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold neon-text-cyan">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="relative z-10 py-12 border-y border-[var(--color-neon-cyan)]/10">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">{t('home.networksSupported')}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {networks.map((network, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                  network.primary 
                    ? "border-[var(--color-neon-cyan)]/50 bg-[var(--color-neon-cyan)]/10" 
                    : "border-border bg-card/50"
                }`}
              >
                <div 
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: network.color, boxShadow: `0 0 10px ${network.color}` }}
                />
                <span className={`text-sm ${network.primary ? "text-[var(--color-neon-cyan)] font-medium" : "text-muted-foreground"}`}>
                  {network.name}
                </span>
                {network.primary && (
                  <Badge variant="outline" className="text-[10px] ml-1 border-[var(--color-neon-green)]/50 text-[var(--color-neon-green)]">
                    {t('home.principal')}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="headline-cyber text-3xl md:text-4xl mb-4">
              {t('home.features')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`card-hover border-border bg-card/50 backdrop-blur-sm ${
                  glowIndex === index % 4 ? feature.glow : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <Card className="border-[var(--color-neon-cyan)]/30 bg-gradient-to-br from-[var(--color-neon-cyan)]/5 to-[var(--color-neon-magenta)]/5 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-12 text-center relative">
              {/* Background decoration */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              
              <div className="relative z-10">
                <Lock className="h-12 w-12 mx-auto mb-6 text-[var(--color-neon-cyan)]" />
                <h2 className="headline-cyber text-3xl md:text-4xl mb-4">
                  {t('home.readyToBuild')}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  {t('home.readyToBuildDesc')}
                </p>
                <Button 
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                  className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-bold px-8 hover:opacity-90 transition-all"
                >
                  {t('home.createFreeAccount')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--color-neon-cyan)]/10 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] flex items-center justify-center">
                <img src="/logo.png" alt="Arc SafeWallet" className="h-5 w-5" />
              </div>
              <span className="font-semibold">Arc SafeWallet</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Arc SafeWallet. Powered by Arc Network.
            </p>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/docs")}>
                {t('nav.docs')}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://arcnetwork.io" target="_blank" rel="noopener noreferrer">
                  Arc Network
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
