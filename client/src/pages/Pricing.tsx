import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Shield, Rocket, Crown, ArrowLeft, Sparkles } from "lucide-react";


export default function Pricing() {
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation();

  const plans = [
    {
      name: "Free",
      description: "Perfeito para começar e explorar a plataforma",
      price: { monthly: 0, yearly: 0 },
      icon: Zap,
      color: "from-gray-500 to-gray-600",
      features: [
        { name: "3 Projetos", included: true },
        { name: "Editor Solidity básico", included: true },
        { name: "Deploy em Testnets", included: true },
        { name: "Scanner de segurança (5/mês)", included: true },
        { name: "Suporte da comunidade", included: true },
        { name: "Deploy em Mainnet", included: false },
        { name: "Templates premium", included: false },
        { name: "API Access", included: false },
        { name: "Suporte prioritário", included: false },
      ],
      cta: "Começar Grátis",
      popular: false,
    },
    {
      name: "Pro",
      description: "Para desenvolvedores e pequenas equipes",
      price: { monthly: 29, yearly: 290 },
      icon: Shield,
      color: "from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)]",
      features: [
        { name: "Projetos ilimitados", included: true },
        { name: "Editor Solidity avançado", included: true },
        { name: "Deploy em Testnets", included: true },
        { name: "Scanner de segurança ilimitado", included: true },
        { name: "Deploy em Mainnet", included: true },
        { name: "10 Templates premium", included: true },
        { name: "API Access (10k req/mês)", included: true },
        { name: "Suporte por email", included: true },
        { name: "Auditoria automática", included: false },
      ],
      cta: "Assinar Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Para empresas e projetos de grande escala",
      price: { monthly: 199, yearly: 1990 },
      icon: Crown,
      color: "from-[var(--color-neon-magenta)] to-[var(--color-neon-purple)]",
      features: [
        { name: "Tudo do Pro", included: true },
        { name: "Projetos e usuários ilimitados", included: true },
        { name: "Templates exclusivos", included: true },
        { name: "API Access ilimitado", included: true },
        { name: "Auditoria automática completa", included: true },
        { name: "Deploy privado (on-premise)", included: true },
        { name: "SLA 99.9%", included: true },
        { name: "Suporte 24/7 dedicado", included: true },
        { name: "Consultoria de segurança", included: true },
      ],
      cta: "Falar com Vendas",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-neon-cyan)]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-neon-magenta)]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-neon-cyan)]/20 bg-background/95 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] flex items-center justify-center">
              <img src="/smartvault-logo.png" alt="SmartVault" className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg gradient-neon-text">SmartVault</span>
          </div>
          <Button onClick={() => setLocation("/dashboard")} className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)]">
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Economize 17% com plano anual
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-neon-text">Planos e Preços</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para suas necessidades de desenvolvimento Web3
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === "yearly" 
                  ? "bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)]" 
                  : "bg-muted"
              }`}
            >
              <div 
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                }`} 
              />
            </button>
            <span className={billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}>
              Anual
              <Badge variant="outline" className="ml-2 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30">
                -17%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? "border-[var(--color-neon-cyan)] shadow-[0_0_30px_rgba(0,212,255,0.3)]" 
                  : "border-border/50 hover:border-[var(--color-neon-cyan)]/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold gradient-neon-text">
                    ${billingCycle === "monthly" ? plan.price.monthly : Math.round(plan.price.yearly / 12)}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                  {billingCycle === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Cobrado ${plan.price.yearly}/ano
                    </p>
                  )}
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-[var(--color-neon-green)] flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? "bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] hover:opacity-90" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={async () => {
                    if (plan.name === "Free") {
                      setLocation("/dashboard");
                    } else if (plan.name === "Enterprise") {
                      toast.info("Entre em contato pelo Discord para planos Enterprise");
                      window.open("https://discord.gg/buildonarc", "_blank");
                    } else {
                      try {
                        toast.info("Redirecionando para o checkout...");
                        const result = await createCheckout.mutateAsync({
                          plan: "pro",
                          interval: billingCycle === "monthly" ? "month" : "year",
                        });
                        if (result.checkoutUrl) {
                          window.open(result.checkoutUrl, "_blank");
                        }
                      } catch (error) {
                        toast.error("Erro ao iniciar checkout. Tente novamente.");
                      }
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-neon-text">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card/50">
              <h3 className="font-semibold mb-2">Posso mudar de plano a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border/50 bg-card/50">
              <h3 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito (Visa, Mastercard, Amex), PIX e criptomoedas 
                (ETH, USDC, USDT) para pagamentos.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border/50 bg-card/50">
              <h3 className="font-semibold mb-2">Existe período de teste gratuito?</h3>
              <p className="text-muted-foreground">
                O plano Free é gratuito para sempre! Para planos pagos, oferecemos 14 dias 
                de teste gratuito com todas as funcionalidades.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border/50 bg-card/50">
              <h3 className="font-semibold mb-2">Como funciona o suporte?</h3>
              <p className="text-muted-foreground">
                Free: Comunidade Discord. Pro: Email com resposta em 24h. 
                Enterprise: Suporte dedicado 24/7 com SLA garantido.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="p-12 rounded-2xl border border-[var(--color-neon-cyan)]/30 bg-gradient-to-br from-[var(--color-neon-cyan)]/10 to-[var(--color-neon-magenta)]/10">
            <h2 className="text-3xl font-bold mb-4">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano 
              para suas necessidades de desenvolvimento Web3.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/faq")}
                className="border-[var(--color-neon-cyan)]/50 hover:bg-[var(--color-neon-cyan)]/10"
              >
                Ver FAQ Completo
              </Button>
              <Button 
                onClick={() => window.open("https://discord.gg/buildonarc", "_blank")}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)]"
              >
                Falar com Suporte
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 SmartVault. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
