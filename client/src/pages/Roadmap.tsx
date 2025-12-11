import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Rocket,
  ArrowLeft,
  Calendar,
  Target,
  Zap,
  Shield,
  Coins,
  Globe,
  Smartphone,
  Users,
  Code,
  Database,
  Lock,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n";

interface RoadmapItem {
  quarter: string;
  status: 'completed' | 'in-progress' | 'planned';
  titleKey: string;
  items: { textKey: string; done: boolean; icon?: React.ReactNode }[];
}

const roadmapItems: RoadmapItem[] = [
  {
    quarter: "Q4 2024",
    status: "completed",
    titleKey: "roadmap.q4_2024.title",
    items: [
      { textKey: "roadmap.q4_2024.item1", done: true, icon: <Code className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2024.item2", done: true, icon: <Rocket className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2024.item3", done: true, icon: <Shield className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2024.item4", done: true, icon: <Lock className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2024.item5", done: true, icon: <Database className="w-4 h-4" /> }
    ]
  },
  {
    quarter: "Q1 2025",
    status: "completed",
    titleKey: "roadmap.q1_2025.title",
    items: [
      { textKey: "roadmap.q1_2025.item1", done: true, icon: <Code className="w-4 h-4" /> },
      { textKey: "roadmap.q1_2025.item2", done: true, icon: <Globe className="w-4 h-4" /> },
      { textKey: "roadmap.q1_2025.item3", done: true, icon: <Zap className="w-4 h-4" /> },
      { textKey: "roadmap.q1_2025.item4", done: true, icon: <Lock className="w-4 h-4" /> },
      { textKey: "roadmap.q1_2025.item5", done: true, icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    quarter: "Q2 2025",
    status: "in-progress",
    titleKey: "roadmap.q2_2025.title",
    items: [
      { textKey: "roadmap.q2_2025.item1", done: true, icon: <Coins className="w-4 h-4" /> },
      { textKey: "roadmap.q2_2025.item2", done: true, icon: <TrendingUp className="w-4 h-4" /> },
      { textKey: "roadmap.q2_2025.item3", done: false, icon: <Code className="w-4 h-4" /> },
      { textKey: "roadmap.q2_2025.item4", done: false, icon: <Database className="w-4 h-4" /> },
      { textKey: "roadmap.q2_2025.item5", done: false, icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    quarter: "Q3 2025",
    status: "planned",
    titleKey: "roadmap.q3_2025.title",
    items: [
      { textKey: "roadmap.q3_2025.item1", done: false, icon: <Smartphone className="w-4 h-4" /> },
      { textKey: "roadmap.q3_2025.item2", done: false, icon: <Globe className="w-4 h-4" /> },
      { textKey: "roadmap.q3_2025.item3", done: false, icon: <Shield className="w-4 h-4" /> },
      { textKey: "roadmap.q3_2025.item4", done: false, icon: <Lock className="w-4 h-4" /> },
      { textKey: "roadmap.q3_2025.item5", done: false, icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    quarter: "Q4 2025",
    status: "planned",
    titleKey: "roadmap.q4_2025.title",
    items: [
      { textKey: "roadmap.q4_2025.item1", done: false, icon: <Globe className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2025.item2", done: false, icon: <Coins className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2025.item3", done: false, icon: <TrendingUp className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2025.item4", done: false, icon: <Users className="w-4 h-4" /> },
      { textKey: "roadmap.q4_2025.item5", done: false, icon: <Rocket className="w-4 h-4" /> }
    ]
  }
];

const statusColors = {
  completed: "bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)] border-[var(--color-neon-green)]/30",
  "in-progress": "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/30",
  planned: "bg-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] border-[var(--color-neon-purple)]/30"
};

export default function Roadmap() {
  const { t } = useI18n();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('roadmap.status.completed');
      case 'in-progress': return t('roadmap.status.inProgress');
      case 'planned': return t('roadmap.status.planned');
      default: return status;
    }
  };

  // Calculate progress
  const totalItems = roadmapItems.reduce((acc, q) => acc + q.items.length, 0);
  const completedItems = roadmapItems.reduce((acc, q) => acc + q.items.filter(i => i.done).length, 0);
  const progressPercent = Math.round((completedItems / totalItems) * 100);

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
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-[var(--color-neon-purple)]/10 to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-neon-purple)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container text-center relative z-10">
          <Badge variant="outline" className="mb-4 border-[var(--color-neon-purple)]/50 animate-pulse">
            <Target className="w-3 h-3 mr-1" />
            {t('roadmap.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-neon-text">{t('roadmap.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('roadmap.subtitle')}
          </p>
          
          {/* Progress bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t('roadmap.progress')}</span>
              <span className="text-[var(--color-neon-green)] font-bold">{progressPercent}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-green)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-neon-green)] via-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] hidden md:block" />
            
            <div className="space-y-8">
              {roadmapItems.map((quarter, index) => (
                <Card 
                  key={index} 
                  className="relative overflow-hidden ml-0 md:ml-16 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-neon-cyan)]/10"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[4.5rem] top-6 w-4 h-4 rounded-full hidden md:block ${
                    quarter.status === 'completed' ? 'bg-[var(--color-neon-green)]' :
                    quarter.status === 'in-progress' ? 'bg-[var(--color-neon-cyan)] animate-pulse' :
                    'bg-[var(--color-neon-purple)]'
                  }`} />
                  
                  {/* Status indicator line */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      quarter.status === 'completed' ? 'bg-[var(--color-neon-green)]' :
                      quarter.status === 'in-progress' ? 'bg-[var(--color-neon-cyan)]' :
                      'bg-[var(--color-neon-purple)]'
                    }`}
                  />
                  
                  <CardHeader className="pl-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="font-mono text-lg font-bold">{quarter.quarter}</span>
                      </div>
                      <Badge className={statusColors[quarter.status]}>
                        {quarter.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {quarter.status === 'in-progress' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                        {quarter.status === 'planned' && <Rocket className="w-3 h-3 mr-1" />}
                        {getStatusLabel(quarter.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2 gradient-neon-text">
                      {t(quarter.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pl-6">
                    <ul className="space-y-3">
                      {quarter.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 group">
                          {item.done ? (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-neon-green)]/20 flex items-center justify-center shrink-0">
                              <CheckCircle className="w-4 h-4 text-[var(--color-neon-green)]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 shrink-0 group-hover:border-[var(--color-neon-cyan)]/50 transition-colors" />
                          )}
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.icon}
                          </span>
                          <span className={`${item.done ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>
                            {t(item.textKey)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-[var(--color-neon-green)] mb-2 group-hover:scale-110 transition-transform">
                {progressPercent}%
              </div>
              <p className="text-muted-foreground">{t('roadmap.stats.progress')}</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[var(--color-neon-cyan)] mb-2 group-hover:scale-110 transition-transform">
                {completedItems}
              </div>
              <p className="text-muted-foreground">{t('roadmap.stats.delivered')}</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[var(--color-neon-purple)] mb-2 group-hover:scale-110 transition-transform">
                {totalItems - completedItems}
              </div>
              <p className="text-muted-foreground">{t('roadmap.stats.planned')}</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[var(--color-neon-magenta)] mb-2 group-hover:scale-110 transition-transform">
                5
              </div>
              <p className="text-muted-foreground">{t('roadmap.stats.quarters')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">{t('roadmap.cta.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('roadmap.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-purple)] hover:opacity-90">
                <Rocket className="w-5 h-5" />
                {t('roadmap.cta.getStarted')}
              </Button>
            </Link>
            <a href="https://github.com/rissonwill/arc-safewallet" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                <Code className="w-5 h-5" />
                {t('roadmap.cta.viewGithub')}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
