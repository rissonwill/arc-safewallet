import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  FileCode,
  Bug,
  Lock,
  Unlock,
  Zap,
  RefreshCw,
} from "lucide-react";

interface Vulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  line?: number;
  recommendation: string;
  category: string;
}

interface ScanResult {
  score: number;
  vulnerabilities: Vulnerability[];
  scannedAt: Date;
  gasOptimizations: number;
  codeQuality: number;
}

interface SecurityScannerProps {
  sourceCode: string;
  contractName: string;
  onClose?: () => void;
}

// Vulnerability patterns to check
const VULNERABILITY_PATTERNS = [
  {
    pattern: /\.call\{value:/,
    id: "reentrancy",
    severity: "critical" as const,
    title: "Potential Reentrancy Vulnerability",
    description: "External calls with value transfer can be exploited for reentrancy attacks.",
    recommendation: "Use the Checks-Effects-Interactions pattern or ReentrancyGuard from OpenZeppelin.",
    category: "Security",
  },
  {
    pattern: /tx\.origin/,
    id: "tx-origin",
    severity: "high" as const,
    title: "tx.origin Authentication",
    description: "Using tx.origin for authentication is vulnerable to phishing attacks.",
    recommendation: "Use msg.sender instead of tx.origin for authentication.",
    category: "Security",
  },
  {
    pattern: /selfdestruct|suicide/,
    id: "selfdestruct",
    severity: "high" as const,
    title: "Selfdestruct Usage",
    description: "selfdestruct can be used to force-send Ether and destroy the contract.",
    recommendation: "Avoid using selfdestruct unless absolutely necessary. Consider alternative patterns.",
    category: "Security",
  },
  {
    pattern: /block\.timestamp/,
    id: "timestamp",
    severity: "low" as const,
    title: "Block Timestamp Dependency",
    description: "Block timestamps can be manipulated by miners within a small range.",
    recommendation: "Avoid using block.timestamp for critical logic. Use block numbers for time-sensitive operations.",
    category: "Security",
  },
  {
    pattern: /assembly\s*\{/,
    id: "assembly",
    severity: "medium" as const,
    title: "Inline Assembly Usage",
    description: "Inline assembly bypasses Solidity's safety checks and can introduce vulnerabilities.",
    recommendation: "Review assembly code carefully. Document all assembly blocks and their purpose.",
    category: "Code Quality",
  },
  {
    pattern: /pragma solidity \^?0\.[0-6]\./,
    id: "old-solidity",
    severity: "medium" as const,
    title: "Outdated Solidity Version",
    description: "Using an older Solidity version may expose the contract to known vulnerabilities.",
    recommendation: "Upgrade to Solidity 0.8.x or later for built-in overflow protection.",
    category: "Best Practices",
  },
  {
    pattern: /public\s+.*\[\]/,
    id: "public-array",
    severity: "low" as const,
    title: "Public Array Without Getter",
    description: "Public arrays without custom getters can cause gas issues when accessed.",
    recommendation: "Implement a custom getter function that returns array length or paginated results.",
    category: "Gas Optimization",
  },
  {
    pattern: /for\s*\([^)]*\.length/,
    id: "loop-length",
    severity: "low" as const,
    title: "Array Length in Loop",
    description: "Reading array length in each iteration wastes gas.",
    recommendation: "Cache the array length in a local variable before the loop.",
    category: "Gas Optimization",
  },
  {
    pattern: /unchecked\s*\{/,
    id: "unchecked",
    severity: "info" as const,
    title: "Unchecked Arithmetic",
    description: "Unchecked blocks bypass overflow/underflow checks.",
    recommendation: "Ensure unchecked arithmetic is intentional and safe.",
    category: "Code Quality",
  },
  {
    pattern: /delegatecall/,
    id: "delegatecall",
    severity: "high" as const,
    title: "Delegatecall Usage",
    description: "delegatecall executes code in the context of the calling contract, which can be dangerous.",
    recommendation: "Carefully validate the target address. Consider using a proxy pattern with proper access controls.",
    category: "Security",
  },
];

export default function SecurityScanner({ sourceCode, contractName, onClose }: SecurityScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setResult(null);

    const vulnerabilities: Vulnerability[] = [];
    const lines = sourceCode.split("\n");

    // Simulate scanning progress
    for (let i = 0; i < VULNERABILITY_PATTERNS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(((i + 1) / VULNERABILITY_PATTERNS.length) * 100);

      const pattern = VULNERABILITY_PATTERNS[i];
      
      // Check each line for the pattern
      lines.forEach((line, lineIndex) => {
        if (pattern.pattern.test(line)) {
          vulnerabilities.push({
            id: `${pattern.id}-${lineIndex}`,
            severity: pattern.severity,
            title: pattern.title,
            description: pattern.description,
            line: lineIndex + 1,
            recommendation: pattern.recommendation,
            category: pattern.category,
          });
        }
      });
    }

    // Calculate score
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length;
    const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length;
    const lowCount = vulnerabilities.filter((v) => v.severity === "low").length;

    let score = 100;
    score -= criticalCount * 25;
    score -= highCount * 15;
    score -= mediumCount * 8;
    score -= lowCount * 3;
    score = Math.max(0, Math.min(100, score));

    // Simulate additional metrics
    const gasOptimizations = vulnerabilities.filter((v) => v.category === "Gas Optimization").length;
    const codeQuality = Math.max(0, 100 - (vulnerabilities.length * 5));

    setResult({
      score,
      vulnerabilities,
      scannedAt: new Date(),
      gasOptimizations,
      codeQuality,
    });

    setIsScanning(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ShieldAlert className="h-4 w-4" />;
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--color-neon-green)]";
    if (score >= 60) return "text-[var(--color-neon-yellow)]";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[var(--color-neon-purple)]/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-[var(--color-neon-purple)]" />
          </div>
          <div>
            <h2 className="font-semibold">Security Scanner</h2>
            <p className="text-xs text-muted-foreground">{contractName}.sol</p>
          </div>
        </div>
        
        <Button
          onClick={runScan}
          disabled={isScanning}
          className="gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {result ? "Rescan" : "Start Scan"}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isScanning ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <Shield className="h-16 w-16 text-[var(--color-neon-cyan)] animate-pulse mb-6" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Contract...</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Checking for vulnerabilities and security issues
            </p>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>
        ) : result ? (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Security Score</p>
                    <Badge className={`mt-2 ${result.score >= 60 ? "bg-[var(--color-neon-green)]" : "bg-orange-500"}`}>
                      {getScoreLabel(result.score)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl font-bold text-[var(--color-neon-magenta)]">
                      {result.vulnerabilities.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Issues Found</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {result.vulnerabilities.filter(v => v.severity === "critical").length > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          {result.vulnerabilities.filter(v => v.severity === "critical").length} Critical
                        </Badge>
                      )}
                      {result.vulnerabilities.filter(v => v.severity === "high").length > 0 && (
                        <Badge className="bg-orange-500 text-[10px]">
                          {result.vulnerabilities.filter(v => v.severity === "high").length} High
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl font-bold text-[var(--color-neon-cyan)]">
                      {result.codeQuality}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Code Quality</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {result.gasOptimizations} Gas Tips
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerabilities List */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Detected Issues
                  </CardTitle>
                  <CardDescription>
                    Review and fix these issues to improve security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.vulnerabilities.length === 0 ? (
                    <div className="text-center py-8">
                      <ShieldCheck className="h-12 w-12 text-[var(--color-neon-green)] mx-auto mb-3" />
                      <p className="font-medium text-[var(--color-neon-green)]">No Issues Found!</p>
                      <p className="text-sm text-muted-foreground">
                        Your contract passed all security checks
                      </p>
                    </div>
                  ) : (
                    result.vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(vuln.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={getSeverityColor(vuln.severity).split(" ")[0]}>
                              {getSeverityIcon(vuln.severity)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{vuln.title}</h4>
                                <Badge variant="outline" className="text-[10px]">
                                  {vuln.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {vuln.description}
                              </p>
                              {vuln.line && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  <FileCode className="h-3 w-3 inline mr-1" />
                                  Line {vuln.line}
                                </p>
                              )}
                              <div className="mt-3 p-2 rounded bg-background/50">
                                <p className="text-xs">
                                  <span className="font-medium text-[var(--color-neon-green)]">
                                    Recommendation:
                                  </span>{" "}
                                  {vuln.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`shrink-0 uppercase text-[10px] ${getSeverityColor(vuln.severity)}`}
                          >
                            {vuln.severity}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Scan Info */}
              <div className="text-xs text-muted-foreground text-center">
                Scanned at {result.scannedAt.toLocaleString("pt-BR")}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="h-20 w-20 rounded-full bg-[var(--color-neon-purple)]/10 flex items-center justify-center mb-6">
              <Shield className="h-10 w-10 text-[var(--color-neon-purple)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Security Analysis</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Scan your smart contract for common vulnerabilities, security issues, 
              and gas optimization opportunities.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-neon-green)]" />
                <span>Reentrancy Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-neon-green)]" />
                <span>Access Control Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-neon-green)]" />
                <span>Integer Overflow</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-neon-green)]" />
                <span>Gas Optimization</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
