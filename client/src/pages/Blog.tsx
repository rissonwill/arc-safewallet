import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Tag
} from "lucide-react";
import { Link, useLocation } from "wouter";

const blogPosts = [
  {
    id: 1,
    slug: "introducao-smart-contracts",
    title: "Introdução aos Smart Contracts: Guia Completo para Iniciantes",
    excerpt: "Aprenda os fundamentos dos smart contracts, como funcionam na blockchain e por que são revolucionários para o mundo Web3.",
    author: "Arc Team",
    date: "2024-12-10",
    readTime: "8 min",
    category: "Tutorial",
    tags: ["smart contracts", "blockchain", "iniciantes"],
    image: "/hero-banner.png"
  },
  {
    id: 2,
    slug: "seguranca-solidity",
    title: "10 Vulnerabilidades Comuns em Solidity e Como Evitá-las",
    excerpt: "Descubra as vulnerabilidades mais comuns em contratos Solidity e aprenda técnicas para proteger seus smart contracts.",
    author: "Security Team",
    date: "2024-12-08",
    readTime: "12 min",
    category: "Segurança",
    tags: ["segurança", "solidity", "vulnerabilidades"],
    image: "/hero-banner.png"
  },
  {
    id: 3,
    slug: "deploy-multi-chain",
    title: "Como Fazer Deploy em Múltiplas Chains com SmartVault",
    excerpt: "Tutorial passo a passo para fazer deploy do seu contrato em Ethereum, Polygon, BSC e SmartVault Network.",
    author: "Dev Team",
    date: "2024-12-05",
    readTime: "10 min",
    category: "Tutorial",
    tags: ["deploy", "multi-chain", "tutorial"],
    image: "/hero-banner.png"
  },
  {
    id: 4,
    slug: "otimizacao-gas",
    title: "Otimização de Gas: Reduza Custos em até 50%",
    excerpt: "Técnicas avançadas para otimizar o consumo de gas dos seus smart contracts e economizar em taxas de transação.",
    author: "Arc Team",
    date: "2024-12-01",
    readTime: "15 min",
    category: "Avançado",
    tags: ["gas", "otimização", "economia"],
    image: "/hero-banner.png"
  },
  {
    id: 5,
    slug: "arc-network-testnet",
    title: "SmartVault Network Testnet: Primeiros Passos",
    excerpt: "Guia completo para começar a desenvolver na SmartVault Network Testnet, incluindo configuração de wallet e faucet.",
    author: "Arc Team",
    date: "2024-11-28",
    readTime: "6 min",
    category: "Tutorial",
    tags: ["arc network", "testnet", "iniciantes"],
    image: "/hero-banner.png"
  },
  {
    id: 6,
    slug: "padroes-design-solidity",
    title: "Padrões de Design em Solidity: Factory, Proxy e mais",
    excerpt: "Conheça os principais padrões de design usados em smart contracts profissionais e quando aplicá-los.",
    author: "Dev Team",
    date: "2024-11-25",
    readTime: "20 min",
    category: "Avançado",
    tags: ["padrões", "design", "arquitetura"],
    image: "/hero-banner.png"
  }
];

const categoryColors: Record<string, string> = {
  "Tutorial": "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]",
  "Segurança": "bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]",
  "Avançado": "bg-[var(--color-neon-magenta)]/20 text-[var(--color-neon-magenta)]"
};

export default function Blog() {
  const [, setLocation] = useLocation();

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
      <section className="py-16 bg-gradient-to-b from-[var(--color-neon-cyan)]/10 to-background">
        <div className="container text-center">
          <Badge variant="outline" className="mb-4 border-[var(--color-neon-cyan)]/50">
            Blog Técnico
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-neon-text">
            Aprenda Web3
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tutoriais, guias e artigos técnicos sobre desenvolvimento blockchain, smart contracts e segurança.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border/50">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant="outline" className="shrink-0">Todos</Button>
            <Button variant="ghost" className="shrink-0">Tutorial</Button>
            <Button variant="ghost" className="shrink-0">Segurança</Button>
            <Button variant="ghost" className="shrink-0">Avançado</Button>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="card-hover overflow-hidden group cursor-pointer">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[post.category]}>
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-[var(--color-neon-cyan)] transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-t from-[var(--color-neon-magenta)]/10 to-background">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Fique por Dentro</h2>
          <p className="text-muted-foreground mb-8">
            Receba os últimos artigos, tutoriais e novidades sobre Web3 diretamente no seu email.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:border-[var(--color-neon-cyan)] focus:outline-none"
            />
            <Button className="bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold">
              Inscrever
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
