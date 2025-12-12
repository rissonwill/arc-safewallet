import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bug,
  Play,
  Pause,
  SkipForward,
  ArrowDownToLine,
  ArrowUpFromLine,
  Square,
  Circle,
  AlertTriangle,
  CheckCircle,
  Info,
  Code2,
  Layers,
  Terminal,
  Zap,
} from "lucide-react";

interface BreakpointInfo {
  line: number;
  enabled: boolean;
  condition?: string;
}

interface VariableInfo {
  name: string;
  type: string;
  value: string;
  scope: "state" | "local" | "memory";
}

interface StackFrame {
  functionName: string;
  contractName: string;
  line: number;
  gasUsed: number;
}

interface DebuggerProps {
  sourceCode: string;
  contractName: string;
  onClose?: () => void;
}

export default function SolidityDebugger({ sourceCode, contractName, onClose }: DebuggerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [breakpoints, setBreakpoints] = useState<BreakpointInfo[]>([]);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [callStack, setCallStack] = useState<StackFrame[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: "info" | "error" | "success" | "warning"; message: string; timestamp: Date }>>([]);

  const lines = sourceCode.split("\n");

  // Toggle breakpoint on a line
  const toggleBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => {
      const existing = prev.find((bp) => bp.line === line);
      if (existing) {
        return prev.filter((bp) => bp.line !== line);
      }
      return [...prev, { line, enabled: true }];
    });
    addConsoleMessage("info", `Breakpoint ${breakpoints.find(bp => bp.line === line) ? "removed from" : "added to"} line ${line}`);
  }, [breakpoints]);

  // Add message to console
  const addConsoleMessage = (type: "info" | "error" | "success" | "warning", message: string) => {
    setConsoleOutput((prev) => [...prev, { type, message, timestamp: new Date() }]);
  };

  // Start debugging session
  const startDebugging = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentLine(1);
    addConsoleMessage("success", `Starting debug session for ${contractName}`);
    
    // Simulate initial state variables
    setVariables([
      { name: "owner", type: "address", value: "0x742d...F3c2", scope: "state" },
      { name: "totalSupply", type: "uint256", value: "1000000", scope: "state" },
      { name: "name", type: "string", value: '"My Token"', scope: "state" },
      { name: "symbol", type: "string", value: '"MTK"', scope: "state" },
    ]);

    setCallStack([
      { functionName: "constructor", contractName, line: 1, gasUsed: 21000 },
    ]);
  };

  // Stop debugging
  const stopDebugging = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentLine(null);
    setVariables([]);
    setCallStack([]);
    addConsoleMessage("info", "Debug session ended");
  };

  // Step over
  const stepOver = () => {
    if (currentLine !== null && currentLine < lines.length) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);
      
      // Check for breakpoint
      const bp = breakpoints.find((b) => b.line === nextLine && b.enabled);
      if (bp) {
        setIsPaused(true);
        addConsoleMessage("warning", `Breakpoint hit at line ${nextLine}`);
      }

      // Simulate variable changes
      if (nextLine % 5 === 0) {
        setVariables((prev) => [
          ...prev,
          { name: `temp_${nextLine}`, type: "uint256", value: String(Math.floor(Math.random() * 1000)), scope: "local" },
        ]);
      }
    }
  };

  // Step into
  const stepInto = () => {
    stepOver();
    addConsoleMessage("info", "Stepping into function...");
    setCallStack((prev) => [
      ...prev,
      { functionName: "transfer", contractName, line: currentLine || 0, gasUsed: 5000 },
    ]);
  };

  // Step out
  const stepOut = () => {
    if (callStack.length > 1) {
      setCallStack((prev) => prev.slice(0, -1));
      addConsoleMessage("info", "Stepping out of function");
    }
  };

  // Continue execution
  const continueExecution = () => {
    setIsPaused(false);
    addConsoleMessage("info", "Continuing execution...");
    
    // Find next breakpoint
    const nextBp = breakpoints
      .filter((bp) => bp.enabled && bp.line > (currentLine || 0))
      .sort((a, b) => a.line - b.line)[0];
    
    if (nextBp) {
      setCurrentLine(nextBp.line);
      setIsPaused(true);
      addConsoleMessage("warning", `Breakpoint hit at line ${nextBp.line}`);
    } else {
      setCurrentLine(lines.length);
      addConsoleMessage("success", "Execution completed");
    }
  };

  // Get line class based on state
  const getLineClass = (lineNum: number) => {
    const classes = ["debug-line", "flex", "items-start", "gap-2", "px-2", "py-0.5", "text-sm", "font-mono"];
    
    if (currentLine === lineNum) {
      classes.push("bg-[var(--color-neon-cyan)]/20", "border-l-2", "border-[var(--color-neon-cyan)]");
    }
    
    if (breakpoints.find((bp) => bp.line === lineNum)) {
      classes.push("debug-breakpoint");
    }
    
    return classes.join(" ");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-[var(--color-neon-green)]" />
          <span className="font-semibold">Debugger</span>
          <Badge variant="outline" className="text-xs">
            {contractName}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {!isRunning ? (
            <Button size="sm" variant="ghost" onClick={startDebugging} className="gap-1">
              <Play className="h-4 w-4 text-[var(--color-neon-green)]" />
              Start
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button size="sm" variant="ghost" onClick={continueExecution} className="gap-1">
                  <Play className="h-4 w-4 text-[var(--color-neon-green)]" />
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsPaused(true)} className="gap-1">
                  <Pause className="h-4 w-4 text-[var(--color-neon-yellow)]" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={stepOver} disabled={!isPaused}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={stepInto} disabled={!isPaused}>
                <ArrowDownToLine className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={stepOut} disabled={!isPaused || callStack.length <= 1}>
                <ArrowUpFromLine className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={stopDebugging}>
                <Square className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source code panel */}
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="p-2 border-b border-border bg-muted/50">
            <span className="text-xs text-muted-foreground font-mono">{contractName}.sol</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 debug-console">
              {lines.map((line, index) => {
                const lineNum = index + 1;
                const hasBreakpoint = breakpoints.find((bp) => bp.line === lineNum);
                
                return (
                  <div key={lineNum} className={getLineClass(lineNum)}>
                    {/* Breakpoint gutter */}
                    <button
                      onClick={() => toggleBreakpoint(lineNum)}
                      className="w-4 h-4 flex items-center justify-center shrink-0 hover:bg-[var(--color-neon-magenta)]/20 rounded"
                    >
                      {hasBreakpoint ? (
                        <Circle className="h-3 w-3 fill-[var(--color-neon-magenta)] text-[var(--color-neon-magenta)]" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground/30 hover:text-[var(--color-neon-magenta)]/50" />
                      )}
                    </button>
                    
                    {/* Line number */}
                    <span className="w-8 text-right text-muted-foreground text-xs shrink-0">
                      {lineNum}
                    </span>
                    
                    {/* Current line indicator */}
                    <span className="w-4 shrink-0">
                      {currentLine === lineNum && (
                        <Zap className="h-3 w-3 text-[var(--color-neon-cyan)] animate-pulse" />
                      )}
                    </span>
                    
                    {/* Code */}
                    <pre className="flex-1 text-foreground whitespace-pre overflow-x-auto">
                      {line || " "}
                    </pre>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Side panels */}
        <div className="w-80 flex flex-col">
          <Tabs defaultValue="variables" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-card">
              <TabsTrigger value="variables" className="gap-1 text-xs">
                <Code2 className="h-3 w-3" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="callstack" className="gap-1 text-xs">
                <Layers className="h-3 w-3" />
                Call Stack
              </TabsTrigger>
              <TabsTrigger value="console" className="gap-1 text-xs">
                <Terminal className="h-3 w-3" />
                Console
              </TabsTrigger>
            </TabsList>

            <TabsContent value="variables" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {variables.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Start debugging to inspect variables
                    </p>
                  ) : (
                    <>
                      {/* State variables */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">State Variables</p>
                        {variables.filter(v => v.scope === "state").map((v, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/50 text-xs mb-1">
                            <div>
                              <span className="text-[var(--color-neon-cyan)]">{v.name}</span>
                              <span className="text-muted-foreground ml-1">: {v.type}</span>
                            </div>
                            <span className="font-mono text-[var(--color-neon-green)]">{v.value}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Local variables */}
                      {variables.filter(v => v.scope === "local").length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Local Variables</p>
                          {variables.filter(v => v.scope === "local").map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/50 text-xs mb-1">
                              <div>
                                <span className="text-[var(--color-neon-magenta)]">{v.name}</span>
                                <span className="text-muted-foreground ml-1">: {v.type}</span>
                              </div>
                              <span className="font-mono text-[var(--color-neon-yellow)]">{v.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="callstack" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {callStack.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No active call stack
                    </p>
                  ) : (
                    callStack.map((frame, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-xs ${i === callStack.length - 1 ? "bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30" : "bg-muted/50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[var(--color-neon-cyan)]">
                            {frame.functionName}()
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            Line {frame.line}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-muted-foreground">
                          <span>{frame.contractName}</span>
                          <span>Gas: {frame.gasUsed.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="console" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1 font-mono text-xs">
                  {consoleOutput.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Console output will appear here
                    </p>
                  ) : (
                    consoleOutput.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 py-1">
                        {log.type === "info" && <Info className="h-3 w-3 text-[var(--color-neon-cyan)] shrink-0 mt-0.5" />}
                        {log.type === "error" && <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />}
                        {log.type === "success" && <CheckCircle className="h-3 w-3 text-[var(--color-neon-green)] shrink-0 mt-0.5" />}
                        {log.type === "warning" && <AlertTriangle className="h-3 w-3 text-[var(--color-neon-yellow)] shrink-0 mt-0.5" />}
                        <span className={
                          log.type === "error" ? "text-destructive" :
                          log.type === "success" ? "text-[var(--color-neon-green)]" :
                          log.type === "warning" ? "text-[var(--color-neon-yellow)]" :
                          "text-foreground"
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
