import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  RefreshCw,
  Lightbulb,
  FileCode,
  Wrench,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ErrorSuggestion {
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  docLink?: string;
}

interface EnhancedErrorProps {
  type: "solidity" | "transaction" | "wallet" | "network" | "general";
  code?: string;
  message: string;
  details?: string;
  line?: number;
  column?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// Error patterns and their solutions
const ERROR_PATTERNS: Record<string, { pattern: RegExp; suggestions: ErrorSuggestion[] }> = {
  // Solidity Errors
  undeclaredIdentifier: {
    pattern: /Undeclared identifier|not found|undefined/i,
    suggestions: [
      {
        title: "Verifique a declaração da variável",
        description: "Certifique-se de que a variável foi declarada antes de ser usada.",
        docLink: "https://docs.soliditylang.org/en/latest/types.html",
      },
      {
        title: "Importe o contrato necessário",
        description: "Se estiver usando um contrato externo, adicione o import no topo do arquivo.",
      },
    ],
  },
  typeMismatch: {
    pattern: /type mismatch|cannot convert|incompatible types/i,
    suggestions: [
      {
        title: "Converta o tipo explicitamente",
        description: "Use conversão de tipo explícita, por exemplo: uint256(valor) ou address(contrato).",
        docLink: "https://docs.soliditylang.org/en/latest/types.html#conversions",
      },
    ],
  },
  outOfGas: {
    pattern: /out of gas|gas required exceeds/i,
    suggestions: [
      {
        title: "Aumente o limite de gas",
        description: "A transação precisa de mais gas. Tente aumentar o gasLimit.",
      },
      {
        title: "Otimize o contrato",
        description: "Reduza loops, use tipos menores quando possível, e evite operações caras.",
        docLink: "https://docs.soliditylang.org/en/latest/internals/optimizer.html",
      },
    ],
  },
  revert: {
    pattern: /execution reverted|revert|require failed/i,
    suggestions: [
      {
        title: "Verifique as condições do require",
        description: "A transação falhou em uma verificação require(). Verifique os parâmetros.",
      },
      {
        title: "Verifique permissões",
        description: "Certifique-se de que a carteira tem permissão para executar esta função.",
      },
    ],
  },
  insufficientFunds: {
    pattern: /insufficient funds|not enough balance/i,
    suggestions: [
      {
        title: "Adicione fundos à carteira",
        description: "Sua carteira não tem saldo suficiente para esta transação.",
        actionLabel: "Obter ETH de Teste",
      },
      {
        title: "Reduza o valor da transação",
        description: "Considere enviar um valor menor ou aguarde ter mais fundos.",
      },
    ],
  },
  nonce: {
    pattern: /nonce too low|nonce too high|replacement transaction/i,
    suggestions: [
      {
        title: "Reset do nonce",
        description: "Há uma transação pendente. Aguarde ou cancele a transação anterior.",
      },
      {
        title: "Limpe transações pendentes",
        description: "No MetaMask: Configurações > Avançado > Limpar dados de atividade.",
      },
    ],
  },
  userRejected: {
    pattern: /user rejected|user denied|cancelled by user/i,
    suggestions: [
      {
        title: "Transação cancelada",
        description: "Você cancelou a transação na carteira. Tente novamente quando estiver pronto.",
      },
    ],
  },
  networkError: {
    pattern: /network error|connection refused|timeout/i,
    suggestions: [
      {
        title: "Verifique sua conexão",
        description: "Certifique-se de que você está conectado à internet.",
      },
      {
        title: "Troque de RPC",
        description: "O provedor RPC pode estar com problemas. Tente usar outro endpoint.",
      },
    ],
  },
  contractNotDeployed: {
    pattern: /contract not deployed|no code at address/i,
    suggestions: [
      {
        title: "Verifique o endereço do contrato",
        description: "O contrato pode não existir nesta rede ou o endereço está incorreto.",
      },
      {
        title: "Verifique a rede",
        description: "Certifique-se de que está conectado à rede correta.",
      },
    ],
  },
};

function getErrorSuggestions(message: string): ErrorSuggestion[] {
  for (const [, config] of Object.entries(ERROR_PATTERNS)) {
    if (config.pattern.test(message)) {
      return config.suggestions;
    }
  }
  
  // Default suggestions
  return [
    {
      title: "Verifique os parâmetros",
      description: "Revise os valores que você está enviando para a função.",
    },
    {
      title: "Consulte a documentação",
      description: "A documentação do contrato pode ter mais informações sobre este erro.",
      docLink: "https://docs.soliditylang.org/",
    },
  ];
}

function getErrorIcon(type: string) {
  switch (type) {
    case "solidity":
      return <FileCode className="h-5 w-5" />;
    case "transaction":
      return <AlertCircle className="h-5 w-5" />;
    case "wallet":
      return <AlertTriangle className="h-5 w-5" />;
    case "network":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
}

function getErrorColor(type: string) {
  switch (type) {
    case "solidity":
      return "text-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/10 border-[var(--color-neon-magenta)]/30";
    case "transaction":
      return "text-red-500 bg-red-500/10 border-red-500/30";
    case "wallet":
      return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    case "network":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    default:
      return "text-red-500 bg-red-500/10 border-red-500/30";
  }
}

export default function EnhancedError({
  type,
  code,
  message,
  details,
  line,
  column,
  onRetry,
  onDismiss,
}: EnhancedErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const suggestions = getErrorSuggestions(message);
  const colorClass = getErrorColor(type);

  const copyError = () => {
    const errorText = `Error: ${message}${code ? `\nCode: ${code}` : ""}${details ? `\nDetails: ${details}` : ""}${line ? `\nLine: ${line}` : ""}`;
    navigator.clipboard.writeText(errorText);
    toast.success("Erro copiado para a área de transferência");
  };

  return (
    <Card className={`border ${colorClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              {getErrorIcon(type)}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Erro Detectado
                {code && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {code}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {type === "solidity" && "Erro de compilação Solidity"}
                {type === "transaction" && "Erro na transação"}
                {type === "wallet" && "Erro de carteira"}
                {type === "network" && "Erro de rede"}
                {type === "general" && "Erro geral"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={copyError}>
              <Copy className="h-4 w-4" />
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="icon" onClick={onDismiss}>
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error message */}
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-sm font-mono break-all">{message}</p>
          {(line || column) && (
            <p className="text-xs text-muted-foreground mt-2">
              {line && `Linha ${line}`}
              {line && column && ", "}
              {column && `Coluna ${column}`}
            </p>
          )}
        </div>

        {/* Details (collapsible) */}
        {details && (
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
            {showDetails && (
              <pre className="mt-2 p-3 rounded-lg bg-background/50 border border-border text-xs font-mono overflow-x-auto">
                {details}
              </pre>
            )}
          </div>
        )}

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-[var(--color-neon-yellow)]" />
            Sugestões
          </div>
          
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-[var(--color-neon-cyan)]/5 border border-[var(--color-neon-cyan)]/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-neon-cyan)]">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {suggestion.action && suggestion.actionLabel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={suggestion.action}
                        className="text-xs h-7"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {suggestion.actionLabel}
                      </Button>
                    )}
                    {suggestion.docLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(suggestion.docLink, "_blank")}
                        className="text-xs h-7"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Docs
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {onRetry && (
          <div className="flex justify-end pt-2">
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Toast-style error notification
export function showEnhancedError(
  message: string,
  type: EnhancedErrorProps["type"] = "general"
) {
  const suggestions = getErrorSuggestions(message);
  const firstSuggestion = suggestions[0];

  toast.error(message, {
    description: firstSuggestion?.description,
    duration: 8000,
    action: firstSuggestion?.docLink
      ? {
          label: "Ver Docs",
          onClick: () => window.open(firstSuggestion.docLink, "_blank"),
        }
      : undefined,
  });
}

// Utility to parse Solidity compiler errors
export function parseSolidityError(error: string): {
  message: string;
  line?: number;
  column?: number;
  code?: string;
} {
  // Pattern: ContractName.sol:10:5: Error: message
  const match = error.match(/(\w+\.sol):(\d+):(\d+):\s*(Error|Warning):\s*(.+)/);
  
  if (match) {
    return {
      message: match[5],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      code: match[4].toUpperCase(),
    };
  }

  // Pattern: Error (code): message
  const codeMatch = error.match(/Error\s*\((\d+)\):\s*(.+)/);
  if (codeMatch) {
    return {
      message: codeMatch[2],
      code: codeMatch[1],
    };
  }

  return { message: error };
}
