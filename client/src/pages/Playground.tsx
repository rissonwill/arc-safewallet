import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  ArrowLeft,
  Code,
  Terminal,
  Zap,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const sampleContracts = [
  {
    name: "SimpleStorage",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data);
    
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`
  },
  {
    name: "ERC20 Token",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}`
  },
  {
    name: "NFT Collection",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}
    
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
    }
}`
  }
];

export default function Playground() {
  const [code, setCode] = useState(sampleContracts[0].code);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCompile = async () => {
    setIsCompiling(true);
    setOutput("Compilando contrato...\n");
    
    // Simulate compilation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOutput(prev => prev + `
✓ Compilação bem-sucedida!

Compiler: solc 0.8.19
Optimization: Enabled (200 runs)

Contract: SimpleStorage
  - Bytecode size: 234 bytes
  - Estimated gas: 125,432

ABI gerado com sucesso.
Pronto para deploy na SmartVault Network Testnet.
`);
    setIsCompiling(false);
    toast.success("Contrato compilado com sucesso!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código copiado!");
  };

  const loadSample = (sample: typeof sampleContracts[0]) => {
    setCode(sample.code);
    setOutput("");
    toast.info(`Template "${sample.name}" carregado`);
  };

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
      <section className="py-8 bg-gradient-to-b from-[var(--color-neon-green)]/10 to-background">
        <div className="container">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-[var(--color-neon-green)]/50">
              <Zap className="w-3 h-3 mr-1" />
              Testnet Playground
            </Badge>
            <Badge className="bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]">
              SmartVault Network Testnet
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Playground Interativo</h1>
          <p className="text-muted-foreground">
            Escreva, compile e teste seus smart contracts em um ambiente seguro.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          {/* Sample Templates */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {sampleContracts.map((sample, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="sm"
                onClick={() => loadSample(sample)}
                className="shrink-0"
              >
                <Code className="w-3 h-3 mr-1" />
                {sample.name}
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Editor Solidity
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm min-h-[400px] bg-[oklch(0.06_0.02_280)] border-[var(--color-neon-cyan)]/20"
                  placeholder="// Escreva seu contrato Solidity aqui..."
                />
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleCompile}
                    disabled={isCompiling}
                    className="bg-[var(--color-neon-green)] text-black hover:bg-[var(--color-neon-green)]/90"
                  >
                    {isCompiling ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isCompiling ? "Compilando..." : "Compilar"}
                  </Button>
                  <Button variant="outline">
                    Deploy na Testnet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Console */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm min-h-[400px] bg-[oklch(0.06_0.02_280)] border border-[var(--color-neon-cyan)]/20 rounded-lg p-4 overflow-auto whitespace-pre-wrap">
                  {output || "// Output da compilação aparecerá aqui..."}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-[var(--color-neon-cyan)]/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Faucet Integrado</h3>
                <p className="text-sm text-muted-foreground">
                  Obtenha tokens de teste gratuitos para a SmartVault Network Testnet.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-neon-magenta)]/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Ambiente Isolado</h3>
                <p className="text-sm text-muted-foreground">
                  Teste seus contratos sem riscos em um ambiente sandbox seguro.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-neon-green)]/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Logs Detalhados</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize logs de transações e eventos em tempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
