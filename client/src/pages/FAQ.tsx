import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, ArrowLeft, Wallet, Code, Shield, Zap, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const { t, language } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: language === "pt" ? "Todas" : "All", icon: HelpCircle },
    { id: "wallet", label: language === "pt" ? "Carteira" : "Wallet", icon: Wallet },
    { id: "contracts", label: language === "pt" ? "Contratos" : "Contracts", icon: Code },
    { id: "security", label: language === "pt" ? "Segurança" : "Security", icon: Shield },
    { id: "network", label: language === "pt" ? "Redes" : "Networks", icon: Zap },
  ];

  const faqs: FAQItem[] = language === "pt" ? [
    // Carteira
    {
      category: "wallet",
      question: "Como conectar minha carteira MetaMask?",
      answer: "Clique no botão 'Connect Wallet' na página inicial ou no dashboard. Selecione MetaMask na lista de carteiras disponíveis. Uma janela do MetaMask será aberta pedindo permissão para conectar. Aprove a conexão e sua carteira estará conectada."
    },
    {
      category: "wallet",
      question: "Quais carteiras são suportadas?",
      answer: "Suportamos MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, Rainbow e Phantom. Você pode conectar qualquer carteira compatível com WalletConnect através do QR code."
    },
    {
      category: "wallet",
      question: "Como trocar de rede na carteira?",
      answer: "Após conectar sua carteira, clique no seletor de rede no header. Escolha a rede desejada (Arc Testnet, Sepolia, etc.). Se a rede não estiver configurada, o sistema pedirá para adicioná-la automaticamente."
    },
    {
      category: "wallet",
      question: "Preciso de tokens para usar a plataforma?",
      answer: "Para interagir com contratos e fazer transações, você precisa de tokens nativos da rede para pagar gas. Na Arc Testnet, use USDC como gas token. Na Sepolia, use ETH de testnet. Acesse os faucets oficiais para obter tokens gratuitos de teste."
    },
    // Contratos
    {
      category: "contracts",
      question: "Como fazer deploy de um contrato?",
      answer: "1) Vá para a página de Deploy. 2) Selecione o template de contrato ou cole seu código Solidity. 3) Configure os parâmetros do construtor. 4) Escolha a rede de destino. 5) Clique em Deploy e confirme a transação na sua carteira."
    },
    {
      category: "contracts",
      question: "Quais templates de contrato estão disponíveis?",
      answer: "Oferecemos templates para ERC-20 (tokens fungíveis), ERC-721 (NFTs), ERC-1155 (multi-token), Staking Vault (staking com recompensas) e NFT Marketplace (compra/venda de NFTs)."
    },
    {
      category: "contracts",
      question: "Como verificar meu contrato no Etherscan?",
      answer: "Após o deploy, vá para a página do contrato e clique em 'Verificar no Etherscan'. O sistema enviará automaticamente o código fonte e os parâmetros de compilação. A verificação pode levar alguns minutos."
    },
    {
      category: "contracts",
      question: "O que é o Security Scanner?",
      answer: "O Security Scanner analisa seu código Solidity em busca de vulnerabilidades comuns como reentrancy, overflow/underflow, acesso não autorizado e más práticas. Ele gera um relatório com recomendações de correção."
    },
    // Segurança
    {
      category: "security",
      question: "Meus dados estão seguros?",
      answer: "Sim. Não armazenamos suas chaves privadas. A autenticação é feita via OAuth e todas as transações são assinadas localmente na sua carteira. Seus contratos são armazenados de forma criptografada."
    },
    {
      category: "security",
      question: "O que é a Governança DAO?",
      answer: "A Governança permite que holders de tokens ARC votem em propostas que afetam o protocolo. Você pode criar propostas, delegar votos e participar de decisões descentralizadas. Todas as votações são registradas on-chain."
    },
    {
      category: "security",
      question: "Como funciona o Timelock?",
      answer: "O Timelock adiciona um período de espera de 24 horas entre a aprovação de uma proposta e sua execução. Isso dá tempo para a comunidade revisar e, se necessário, tomar medidas contra propostas maliciosas."
    },
    // Redes
    {
      category: "network",
      question: "Quais redes blockchain são suportadas?",
      answer: "Suportamos Axiom Network Testnet, Ethereum Mainnet, Sepolia Testnet, Polygon, BSC, Arbitrum, Optimism, Base e Avalanche. Novas redes são adicionadas regularmente."
    },
    {
      category: "network",
      question: "O que é a Axiom Network?",
      answer: "Axiom Network é uma blockchain Layer 2 focada em finalidade determinística sub-segundo e baixas taxas. Usa USDC como token de gas, facilitando a previsibilidade de custos para desenvolvedores."
    },
    {
      category: "network",
      question: "Como obter tokens de teste?",
      answer: "Para Arc Testnet, acesse faucet.circle.com. Para Sepolia, acesse sepoliafaucet.com. Esses faucets distribuem tokens gratuitos para desenvolvimento e testes."
    },
    {
      category: "network",
      question: "Qual é o gas fee na Axiom Network?",
      answer: "A Axiom Network usa um gas price mínimo de 160 Gwei com USDC como token de gas. Isso resulta em taxas previsíveis e estáveis, diferente de redes que usam tokens voláteis."
    },
  ] : [
    // Wallet
    {
      category: "wallet",
      question: "How do I connect my MetaMask wallet?",
      answer: "Click the 'Connect Wallet' button on the homepage or dashboard. Select MetaMask from the list of available wallets. A MetaMask window will open asking for permission to connect. Approve the connection and your wallet will be connected."
    },
    {
      category: "wallet",
      question: "Which wallets are supported?",
      answer: "We support MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, Rainbow, and Phantom. You can connect any WalletConnect-compatible wallet via QR code."
    },
    {
      category: "wallet",
      question: "How do I switch networks in my wallet?",
      answer: "After connecting your wallet, click the network selector in the header. Choose your desired network (Arc Testnet, Sepolia, etc.). If the network isn't configured, the system will prompt you to add it automatically."
    },
    {
      category: "wallet",
      question: "Do I need tokens to use the platform?",
      answer: "To interact with contracts and make transactions, you need native network tokens to pay for gas. On Arc Testnet, use USDC as the gas token. On Sepolia, use testnet ETH. Visit official faucets to get free test tokens."
    },
    // Contracts
    {
      category: "contracts",
      question: "How do I deploy a contract?",
      answer: "1) Go to the Deploy page. 2) Select a contract template or paste your Solidity code. 3) Configure constructor parameters. 4) Choose the target network. 5) Click Deploy and confirm the transaction in your wallet."
    },
    {
      category: "contracts",
      question: "What contract templates are available?",
      answer: "We offer templates for ERC-20 (fungible tokens), ERC-721 (NFTs), ERC-1155 (multi-token), Staking Vault (staking with rewards), and NFT Marketplace (buy/sell NFTs)."
    },
    {
      category: "contracts",
      question: "How do I verify my contract on Etherscan?",
      answer: "After deployment, go to the contract page and click 'Verify on Etherscan'. The system will automatically submit the source code and compilation parameters. Verification may take a few minutes."
    },
    {
      category: "contracts",
      question: "What is the Security Scanner?",
      answer: "The Security Scanner analyzes your Solidity code for common vulnerabilities like reentrancy, overflow/underflow, unauthorized access, and bad practices. It generates a report with fix recommendations."
    },
    // Security
    {
      category: "security",
      question: "Is my data secure?",
      answer: "Yes. We don't store your private keys. Authentication is done via OAuth and all transactions are signed locally in your wallet. Your contracts are stored encrypted."
    },
    {
      category: "security",
      question: "What is DAO Governance?",
      answer: "Governance allows ARC token holders to vote on proposals that affect the protocol. You can create proposals, delegate votes, and participate in decentralized decisions. All votes are recorded on-chain."
    },
    {
      category: "security",
      question: "How does the Timelock work?",
      answer: "The Timelock adds a 24-hour waiting period between proposal approval and execution. This gives the community time to review and, if necessary, take action against malicious proposals."
    },
    // Networks
    {
      category: "network",
      question: "Which blockchain networks are supported?",
      answer: "We support Axiom Network Testnet, Ethereum Mainnet, Sepolia Testnet, Polygon, BSC, Arbitrum, Optimism, Base, and Avalanche. New networks are added regularly."
    },
    {
      category: "network",
      question: "What is Axiom Network?",
      answer: "Axiom Network is a Layer 2 blockchain focused on sub-second deterministic finality and low fees. It uses USDC as the gas token, making cost predictability easier for developers."
    },
    {
      category: "network",
      question: "How do I get test tokens?",
      answer: "For Arc Testnet, visit faucet.circle.com. For Sepolia, visit sepoliafaucet.com. These faucets distribute free tokens for development and testing."
    },
    {
      category: "network",
      question: "What is the gas fee on Axiom Network?",
      answer: "Axiom Network uses a minimum gas price of 160 Gwei with USDC as the gas token. This results in predictable and stable fees, unlike networks that use volatile tokens."
    },
  ];

  const filteredFaqs = activeCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Axiom Labs" className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AXIOM LABS
              </span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {language === "pt" ? "Voltar" : "Back"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-purple-900/20 to-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {language === "pt" ? "Perguntas Frequentes" : "Frequently Asked Questions"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "pt" 
              ? "Encontre respostas para as dúvidas mais comuns sobre a plataforma Axiom Labs."
              : "Find answers to the most common questions about the Axiom Labs platform."}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border/50">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className={`gap-2 ${activeCategory === cat.id ? "bg-gradient-to-r from-cyan-500 to-purple-600" : ""}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card 
                key={index} 
                className={`border-border/50 transition-all duration-300 hover:border-cyan-500/50 ${openIndex === index ? "border-cyan-500/50 shadow-lg shadow-cyan-500/10" : ""}`}
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-lg pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t border-border/50 pt-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-t from-purple-900/20 to-background">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "pt" ? "Ainda tem dúvidas?" : "Still have questions?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === "pt" 
              ? "Entre em contato conosco através das nossas comunidades."
              : "Get in touch with us through our communities."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://discord.gg/buildonarc" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Discord Arc
              </Button>
            </a>
            <a href="https://discord.gg/buildoncircle" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Discord Circle
              </Button>
            </a>
            <a href="https://twitter.com/smartcript" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Twitter
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
