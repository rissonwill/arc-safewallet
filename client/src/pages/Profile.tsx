import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n";
import { 
  User, 
  Wallet, 
  Activity, 
  FileCode2, 
  FolderKanban, 
  Send,
  Shield,
  Clock,
  Copy,
  ExternalLink,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Buscar estatísticas do usuário
  const { data: stats, isLoading: statsLoading } = trpc.stats.user.useQuery();
  const { data: transactions } = trpc.transaction.list.useQuery({ limit: 5 });
  const { data: projects } = trpc.project.list.useQuery();
  const { data: contracts } = trpc.contract.list.useQuery();

  const walletAddress = user?.openId || user?.name || '';
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      toast.success("Endereço copiado!");
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const openExplorer = () => {
    if (walletAddress) {
      window.open(`https://etherscan.io/address/${walletAddress}`, '_blank');
    }
  };

  // Calcular tempo desde o registro
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Hoje';

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-cyber text-3xl">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie sua conta e veja seu histórico de atividades
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card Principal do Perfil */}
          <Card className="md:col-span-1 wireframe-card">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-pink)] flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">
                {user?.name || 'Usuário Web3'}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Wallet className="h-4 w-4" />
                {shortAddress || 'Carteira não conectada'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletAddress && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={copyAddress}
                  >
                    {copiedAddress ? (
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copiar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={openExplorer}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Membro desde
                  </span>
                  <span>{memberSince}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Status
                  </span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Tipo
                  </span>
                  <Badge variant="outline">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="md:col-span-2 wireframe-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--color-cyan)]" />
                Estatísticas da Conta
              </CardTitle>
              <CardDescription>
                Resumo das suas atividades na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <FolderKanban className="h-8 w-8 mx-auto mb-2 text-[var(--color-cyan)]" />
                    <div className="text-2xl font-bold">{stats?.projects || 0}</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <FileCode2 className="h-8 w-8 mx-auto mb-2 text-[var(--color-pink)]" />
                    <div className="text-2xl font-bold">{stats?.contracts || 0}</div>
                    <div className="text-xs text-muted-foreground">Contratos</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Send className="h-8 w-8 mx-auto mb-2 text-[var(--color-warning)]" />
                    <div className="text-2xl font-bold">{stats?.transactions || 0}</div>
                    <div className="text-xs text-muted-foreground">Transações</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{stats?.deployedContracts || 0}</div>
                    <div className="text-xs text-muted-foreground">Deployados</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Atividade Recente */}
        <Card className="wireframe-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-cyan)]" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Suas últimas transações e ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        tx.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-500' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        <Send className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {tx.type === 'deploy' ? 'Deploy de Contrato' : 
                           tx.type === 'transfer' ? 'Transferência' : 
                           tx.type || 'Transação'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.hash ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` : 'Hash não disponível'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={
                        tx.status === 'confirmed' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }>
                        {tx.status === 'confirmed' ? 'Confirmado' : 
                         tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('pt-BR') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Suas transações aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projetos Recentes */}
        <Card className="wireframe-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-[var(--color-pink)]" />
              Meus Projetos
            </CardTitle>
            <CardDescription>
              Projetos Web3 que você criou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 6).map((project: any) => (
                  <div 
                    key={project.id}
                    className="p-4 rounded-lg border border-border hover:border-[var(--color-cyan)]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-pink)]/20 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-[var(--color-cyan)]" />
                      </div>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.network || 'Multi-chain'}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || 'Sem descrição'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum projeto criado</p>
                <p className="text-sm">Crie seu primeiro projeto Web3</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
