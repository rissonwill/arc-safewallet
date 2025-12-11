import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Vote, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users,
  TrendingUp,
  Shield,
  Coins,
  Plus,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/i18n';

// Tipos
interface Proposal {
  id: number;
  title: string;
  description: string;
  category: 'treasury' | 'protocol' | 'community' | 'emergency';
  proposer: string;
  status: 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed' | 'pending';
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
  startTime: number;
  endTime: number;
}

// Dados de exemplo
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: 'Aumentar recompensas de staking para 15% APY',
    description: 'Proposta para aumentar as recompensas de staking de 12% para 15% APY, incentivando mais holders a fazer stake de seus tokens ARC.',
    category: 'protocol',
    proposer: '0x1234...5678',
    status: 'active',
    forVotes: 125000,
    againstVotes: 45000,
    abstainVotes: 10000,
    quorum: 40000,
    startTime: Date.now() - 86400000 * 2,
    endTime: Date.now() + 86400000 * 5,
  },
  {
    id: 2,
    title: 'Alocar 50.000 ARC para marketing',
    description: 'Proposta para alocar 50.000 tokens ARC do treasury para campanhas de marketing e parcerias estratégicas.',
    category: 'treasury',
    proposer: '0xabcd...efgh',
    status: 'succeeded',
    forVotes: 200000,
    againstVotes: 30000,
    abstainVotes: 5000,
    quorum: 40000,
    startTime: Date.now() - 86400000 * 10,
    endTime: Date.now() - 86400000 * 3,
  },
  {
    id: 3,
    title: 'Adicionar suporte à rede Avalanche',
    description: 'Integrar a rede Avalanche à plataforma Arc SafeWallet, permitindo deploy e interação com contratos na AVAX.',
    category: 'protocol',
    proposer: '0x9876...5432',
    status: 'queued',
    forVotes: 180000,
    againstVotes: 20000,
    abstainVotes: 15000,
    quorum: 40000,
    startTime: Date.now() - 86400000 * 15,
    endTime: Date.now() - 86400000 * 8,
  },
  {
    id: 4,
    title: 'Reduzir taxa do marketplace para 2%',
    description: 'Proposta para reduzir a taxa do NFT Marketplace de 2.5% para 2%, tornando a plataforma mais competitiva.',
    category: 'protocol',
    proposer: '0xdef0...1234',
    status: 'defeated',
    forVotes: 35000,
    againstVotes: 150000,
    abstainVotes: 8000,
    quorum: 40000,
    startTime: Date.now() - 86400000 * 20,
    endTime: Date.now() - 86400000 * 13,
  },
];

const STATS = {
  totalProposals: 24,
  activeProposals: 3,
  totalVoters: 1250,
  treasuryBalance: '2,500,000 ARC',
  quorumPercentage: 4,
  votingPeriod: '7 dias',
};

export default function Governance() {
  const { t } = useI18n();
  const [proposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'community' as const,
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'treasury': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'protocol': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'community': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'treasury': return 'Treasury';
      case 'protocol': return 'Protocol';
      case 'community': return 'Community';
      case 'emergency': return 'Emergency';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'succeeded': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'defeated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'queued': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'executed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Votação Ativa';
      case 'succeeded': return 'Aprovada';
      case 'defeated': return 'Rejeitada';
      case 'queued': return 'Na Fila';
      case 'executed': return 'Executada';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const filteredProposals = selectedCategory === 'all' 
    ? proposals 
    : proposals.filter(p => p.category === selectedCategory);

  const handleVote = (proposalId: number, vote: 'for' | 'against' | 'abstain') => {
    const voteLabels = { for: 'A FAVOR', against: 'CONTRA', abstain: 'ABSTENÇÃO' };
    toast.success(`Voto registrado: ${voteLabels[vote]} na proposta #${proposalId}`);
  };

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      toast.error('Preencha todos os campos');
      return;
    }
    toast.success('Proposta criada com sucesso! Aguardando confirmação na blockchain.');
    setIsCreateDialogOpen(false);
    setNewProposal({ title: '', description: '', category: 'community' });
  };

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Encerrada';
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h restantes`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Governança DAO
            </h1>
            <p className="text-muted-foreground mt-1">
              Participe das decisões do protocolo Arc SafeWallet
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>Criar Nova Proposta</DialogTitle>
                <DialogDescription>
                  Você precisa de pelo menos 1.000 ARC para criar uma proposta.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    placeholder="Título da proposta"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newProposal.category} 
                    onValueChange={(v: any) => setNewProposal({ ...newProposal, category: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treasury">Treasury</SelectItem>
                      <SelectItem value="protocol">Protocol</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    placeholder="Descreva sua proposta em detalhes..."
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[120px]"
                  />
                </div>
                <Button 
                  onClick={handleCreateProposal}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600"
                >
                  Criar Proposta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{STATS.totalProposals}</p>
                  <p className="text-xs text-muted-foreground">Total Propostas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Vote className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{STATS.activeProposals}</p>
                  <p className="text-xs text-muted-foreground">Votações Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{STATS.totalVoters}</p>
                  <p className="text-xs text-muted-foreground">Votantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{STATS.treasuryBalance}</p>
                  <p className="text-xs text-muted-foreground">Treasury</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{STATS.quorumPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Quorum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{STATS.votingPeriod}</p>
                  <p className="text-xs text-muted-foreground">Período</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              Todas
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setSelectedCategory('all')}>
              Ativas
            </TabsTrigger>
            <TabsTrigger value="treasury" onClick={() => setSelectedCategory('treasury')}>
              Treasury
            </TabsTrigger>
            <TabsTrigger value="protocol" onClick={() => setSelectedCategory('protocol')}>
              Protocol
            </TabsTrigger>
            <TabsTrigger value="community" onClick={() => setSelectedCategory('community')}>
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredProposals.map((proposal) => {
              const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
              const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
              const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
              const quorumReached = totalVotes >= proposal.quorum;

              return (
                <Card key={proposal.id} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getCategoryColor(proposal.category)}>
                            {getCategoryLabel(proposal.category)}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(proposal.status)}>
                            {getStatusLabel(proposal.status)}
                          </Badge>
                          {quorumReached && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Quorum Atingido
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{proposal.title}</CardTitle>
                        <CardDescription className="text-sm">
                          Proposta #{proposal.id} · Por {proposal.proposer}
                        </CardDescription>
                      </div>
                      {proposal.status === 'active' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatTimeRemaining(proposal.endTime)}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{proposal.description}</p>

                    {/* Voting Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-green-400">
                          <ThumbsUp className="w-4 h-4" />
                          A Favor: {proposal.forVotes.toLocaleString()} ({forPercentage.toFixed(1)}%)
                        </span>
                        <span className="flex items-center gap-2 text-red-400">
                          <ThumbsDown className="w-4 h-4" />
                          Contra: {proposal.againstVotes.toLocaleString()} ({againstPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${forPercentage}%` }}
                        />
                        <div 
                          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400"
                          style={{ width: `${againstPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total de votos: {totalVotes.toLocaleString()}</span>
                        <span>Quorum necessário: {proposal.quorum.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Vote Buttons */}
                    {proposal.status === 'active' && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/20"
                          onClick={() => handleVote(proposal.id, 'for')}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          A Favor
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => handleVote(proposal.id, 'against')}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Contra
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                          onClick={() => handleVote(proposal.id, 'abstain')}
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          Abstenção
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="active">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 text-center">
                <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Filtre por "Todas" e veja as propostas com status "Votação Ativa"
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treasury">
            {filteredProposals.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma proposta de Treasury encontrada
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="protocol">
            {filteredProposals.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma proposta de Protocol encontrada
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="community">
            {filteredProposals.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma proposta de Community encontrada
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/20">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Como funciona a Governança?</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Holders com 1.000+ ARC podem criar propostas</li>
                  <li>• Votação dura 7 dias após período de discussão de 1 dia</li>
                  <li>• Quorum mínimo de 4% do supply total para aprovação</li>
                  <li>• Propostas aprovadas passam por timelock de 24h antes da execução</li>
                  <li>• Delegue seus votos se não puder participar ativamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
