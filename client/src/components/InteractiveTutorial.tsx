import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wallet,
  FileCode,
  Rocket,
  Shield,
  Zap,
  CheckCircle,
  Play,
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
  action?: string;
  code?: string;
}

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Arc SafeWallet! 🚀",
    description: "Esta é sua plataforma completa para desenvolvimento Web3. Vamos fazer um tour rápido pelas principais funcionalidades.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "wallet",
    title: "Conecte sua Carteira",
    description: "Primeiro, conecte sua carteira Web3 (MetaMask, WalletConnect) para interagir com a blockchain. Isso permite assinar transações e gerenciar seus contratos.",
    icon: <Wallet className="h-8 w-8" />,
    targetSelector: "[data-tutorial='connect-wallet']",
    position: "bottom",
    action: "Clique em 'Conectar Carteira' no menu lateral",
  },
  {
    id: "project",
    title: "Crie seu Primeiro Projeto",
    description: "Organize seus contratos inteligentes em projetos. Cada projeto pode conter múltiplos contratos e configurações de rede.",
    icon: <FileCode className="h-8 w-8" />,
    targetSelector: "[data-tutorial='new-project']",
    position: "right",
    code: `// Exemplo de estrutura de projeto
{
  "name": "Meu Token",
  "network": "Arc Network Testnet",
  "contracts": ["Token.sol", "Staking.sol"]
}`,
  },
  {
    id: "editor",
    title: "Editor de Contratos Solidity",
    description: "Escreva e edite seus contratos inteligentes com syntax highlighting, autocompletion e validação em tempo real.",
    icon: <FileCode className="h-8 w-8" />,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyToken {
    string public name = "Arc Token";
    string public symbol = "ARC";
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }
}`,
  },
  {
    id: "security",
    title: "Scanner de Segurança",
    description: "Antes de fazer deploy, analise seu contrato em busca de vulnerabilidades comuns como reentrancy, overflow e problemas de acesso.",
    icon: <Shield className="h-8 w-8" />,
    action: "Use o Security Scanner para verificar seu código",
  },
  {
    id: "deploy",
    title: "Deploy Multi-Chain",
    description: "Faça deploy do seu contrato em múltiplas redes: Arc Network Testnet, Ethereum Sepolia, Polygon Mumbai e mais.",
    icon: <Rocket className="h-8 w-8" />,
    targetSelector: "[data-tutorial='deploy']",
    position: "bottom",
    code: `// Deploy para Arc Network Testnet
Network: Arc Network Testnet
Chain ID: 1516
RPC: https://rpc-testnet.arcnetwork.io
Explorer: https://testnet.arcscan.io`,
  },
  {
    id: "gas",
    title: "Monitoramento de Gas",
    description: "Acompanhe os preços de gas em tempo real para todas as redes suportadas. Escolha o melhor momento para suas transações.",
    icon: <Zap className="h-8 w-8" />,
  },
  {
    id: "complete",
    title: "Pronto para Começar! 🎉",
    description: "Você completou o tutorial! Agora você está pronto para criar, testar e fazer deploy de contratos inteligentes na Arc Network.",
    icon: <CheckCircle className="h-8 w-8" />,
  },
];

export default function InteractiveTutorial({ onComplete, onSkip }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("arc-safewallet-tutorial-completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem("arc-safewallet-tutorial-skipped", "true");
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 tutorial-overlay flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-cyan)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-magenta)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-neon-purple)]/5 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-2xl border-[var(--color-neon-cyan)]/30 bg-card/95 backdrop-blur-xl shadow-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Progress bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Passo {currentStep + 1} de {TUTORIAL_STEPS.length}
            </span>
            <Badge variant="outline" className="text-xs">
              {Math.round(progress)}% completo
            </Badge>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <CardContent className="p-6">
          {/* Step indicator dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-[var(--color-neon-cyan)]"
                    : index < currentStep
                    ? "w-2 bg-[var(--color-neon-green)]"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--color-neon-cyan)]/20 to-[var(--color-neon-magenta)]/20 flex items-center justify-center text-[var(--color-neon-cyan)] animate-glow-pulse">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-3 headline-cyber gradient-neon-text">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Action hint */}
          {step.action && (
            <div className="mb-6 p-3 rounded-lg bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30">
              <div className="flex items-center gap-2 text-sm">
                <Play className="h-4 w-4 text-[var(--color-neon-cyan)]" />
                <span className="text-[var(--color-neon-cyan)] font-medium">Ação:</span>
                <span>{step.action}</span>
              </div>
            </div>
          )}

          {/* Code example */}
          {step.code && (
            <div className="mb-6 rounded-lg overflow-hidden border border-border">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground font-mono">Exemplo</span>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto bg-[oklch(0.06_0.02_280)]">
                <code className="text-foreground">{step.code}</code>
              </pre>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Pular Tutorial
            </Button>

            <Button
              onClick={handleNext}
              className="gap-1 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold"
            >
              {isLastStep ? (
                <>
                  Começar
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check if tutorial should be shown
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("arc-safewallet-tutorial-completed");
    const skipped = localStorage.getItem("arc-safewallet-tutorial-skipped");
    
    if (!completed && !skipped) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetTutorial = () => {
    localStorage.removeItem("arc-safewallet-tutorial-completed");
    localStorage.removeItem("arc-safewallet-tutorial-skipped");
    setShowTutorial(true);
  };

  return { showTutorial, setShowTutorial, resetTutorial };
}
