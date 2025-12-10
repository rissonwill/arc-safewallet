import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Plus, 
  FolderKanban, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileCode2,
  ExternalLink,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const NETWORKS = [
  { chainId: 1, name: "Ethereum Mainnet", symbol: "ETH" },
  { chainId: 137, name: "Polygon", symbol: "MATIC" },
  { chainId: 56, name: "BSC", symbol: "BNB" },
  { chainId: 42161, name: "Arbitrum", symbol: "ETH" },
  { chainId: 10, name: "Optimism", symbol: "ETH" },
  { chainId: 5, name: "Goerli Testnet", symbol: "ETH" },
  { chainId: 80001, name: "Mumbai Testnet", symbol: "MATIC" },
];

const RPC_PROVIDERS = [
  { id: "alchemy", name: "Alchemy" },
  { id: "quicknode", name: "QuickNode" },
  { id: "blockdaemon", name: "Blockdaemon" },
  { id: "infura", name: "Infura" },
  { id: "custom", name: "Custom RPC" },
];

export default function Projects() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chainId: 1,
    rpcProvider: "",
    rpcUrl: "",
  });

  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.project.list.useQuery();
  
  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
      toast.success(t('success.saved'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      setIsEditOpen(false);
      setSelectedProject(null);
      toast.success(t('success.saved'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      chainId: 1,
      rpcProvider: "",
      rpcUrl: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error(t('error.generic'));
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!selectedProject) return;
    updateMutation.mutate({
      id: selectedProject.id,
      ...formData,
    });
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      chainId: project.chainId,
      rpcProvider: project.rpcProvider || "",
      rpcUrl: project.rpcUrl || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-[var(--color-success)]">Ativo</Badge>;
      case "archived":
        return <Badge variant="secondary">Arquivado</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNetworkName = (chainId: number) => {
    return NETWORKS.find(n => n.chainId === chainId)?.name || `Chain ${chainId}`;
  };

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProjectForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('projects.name')}</Label>
        <Input
          id="name"
          placeholder="Meu Projeto Web3"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva seu projeto..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('networks.title')}</Label>
          <Select
            value={formData.chainId.toString()}
            onValueChange={(v) => setFormData({ ...formData, chainId: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.select')} />
            </SelectTrigger>
            <SelectContent>
              {NETWORKS.map((network) => (
                <SelectItem key={network.chainId} value={network.chainId.toString()}>
                  {network.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>RPC Provider</Label>
          <Select
            value={formData.rpcProvider}
            onValueChange={(v) => setFormData({ ...formData, rpcProvider: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.select')} />
            </SelectTrigger>
            <SelectContent>
              {RPC_PROVIDERS.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {formData.rpcProvider === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="rpcUrl">URL RPC Customizada</Label>
          <Input
            id="rpcUrl"
            placeholder="https://..."
            value={formData.rpcUrl}
            onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
          />
        </div>
      )}
      
      <DialogFooter>
        <Button type="submit" onClick={onSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? "Salvando..." : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">{t('projects.title')}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('projects.subtitle')}
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                {t('projects.new')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar {t('projects.new')}</DialogTitle>
                <DialogDescription>
                  Configure um novo projeto Web3 com suas preferências de rede.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm onSubmit={handleCreate} submitLabel="Criar Projeto" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`${t('common.search')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-border card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {getNetworkName(project.chainId)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(project.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setLocation(`/contracts?projectId=${project.id}`)}
                    >
                      <FileCode2 className="h-4 w-4 mr-1" />
                      Contratos
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setLocation(`/projects/${project.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t('projects.noProjects')}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {searchQuery 
                  ? "Tente uma busca diferente ou crie um novo projeto."
                  : "Comece criando seu primeiro projeto Web3 para organizar seus contratos inteligentes."}
              </p>
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Criar Primeiro Projeto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Projeto</DialogTitle>
              <DialogDescription>
                Atualize as configurações do seu projeto.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
