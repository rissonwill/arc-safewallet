import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  FileCode2, 
  Shield, 
  Rocket, 
  Wallet,
  CheckCircle
} from "lucide-react";

interface OnboardingTourProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

const tourSteps = [
  {
    title: "Bem-vindo ao SmartVault!",
    description: "Sua plataforma completa para desenvolvimento e gerenciamento de smart contracts. Vamos fazer um tour rápido pelas principais funcionalidades.",
    icon: Wallet,
    color: "var(--color-neon-cyan)",
  },
  {
    title: "Editor Solidity",
    description: "Escreva, compile e teste seus contratos inteligentes com syntax highlighting, autocompletion e validação em tempo real.",
    icon: FileCode2,
    color: "var(--color-neon-cyan)",
  },
  {
    title: "Scanner de Segurança",
    description: "Detecte vulnerabilidades automaticamente antes do deploy. Análise de reentrancy, overflow, access control e mais.",
    icon: Shield,
    color: "var(--color-neon-purple)",
  },
  {
    title: "Deploy Multi-Chain",
    description: "Faça deploy em múltiplas redes simultaneamente: Arc Network, Ethereum, Polygon, BSC e outras redes EVM compatíveis.",
    icon: Rocket,
    color: "var(--color-neon-magenta)",
  },
  {
    title: "Pronto para começar!",
    description: "Explore o dashboard, conecte sua wallet e comece a criar seus smart contracts com segurança.",
    icon: CheckCircle,
    color: "var(--color-neon-green)",
  },
];

export function OnboardingTour({ onComplete, isFirstVisit }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isFirstVisit);

  useEffect(() => {
    if (isFirstVisit) {
      setIsVisible(true);
    }
  }, [isFirstVisit]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("arc-safewallet-onboarding-complete", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 bg-background/95 border-[var(--color-neon-cyan)]/30 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div 
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <Icon className="h-8 w-8" style={{ color: step.color }} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: step.color }}>
            {step.title}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? "w-8 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)]" 
                      : index < currentStep 
                        ? "w-2 bg-[var(--color-neon-green)]"
                        : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="border-[var(--color-neon-cyan)]/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold"
              >
                {currentStep === tourSteps.length - 1 ? "Começar" : "Próximo"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Passo {currentStep + 1} de {tourSteps.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
