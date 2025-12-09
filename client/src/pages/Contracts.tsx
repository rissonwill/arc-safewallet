import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { 
  Plus, 
  FileCode2, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Rocket,
  Copy,
  Download,
  Search,
  Sparkles,
  Save,
  Code,
  FileJson,
  BookOpen
} from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Contracts() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const projectIdParam = new URLSearchParams(search).get("projectId");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("source");
  
  const [formData, setFormData] = useState({
    projectId: projectIdParam ? parseInt(projectIdParam) : 0,
    name: "",
    description: "",
    sourceCode: "",
    templateType: "",
  });

  const utils = trpc.useUtils();
  const { data: contracts, isLoading } = trpc.contract.list.useQuery(
    projectIdParam ? { projectId: parseInt(projectIdParam) } : undefined
  );
  const { data: projects } = trpc.project.list.useQuery();
  const { data: templates } = trpc.template.list.useQuery();
  
  const createMutation = trpc.contract.create.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar contrato: ${error.message}`);
    },
  });

  const updateMutation = trpc.contract.update.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate();
      toast.success("Contrato atualizado!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contract.delete.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate();
      toast.success("Contrato excluído!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const saveToS3Mutation = trpc.contract.saveToS3.useMutation({
    onSuccess: () => {
      toast.success("Contrato salvo no S3!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar no S3: ${error.message}`);
    },
  });

  const generateDocsMutation = trpc.contract.generateDocumentation.useMutation({
    onSuccess: (data) => {
      if (selectedContract) {
        setSelectedContract({ ...selectedContract, aiDocumentation: data.documentation });
      }
      utils.contract.list.invalidate();
      toast.success("Documentação gerada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar documentação: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      projectId: projectIdParam ? parseInt(projectIdParam) : 0,
      name: "",
      description: "",
      sourceCode: "",
      templateType: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Nome do contrato é obrigatório");
      return;
    }
    if (!formData.projectId) {
      toast.error("Selecione um projeto");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSaveCode = () => {
    if (!selectedContract) return;
    updateMutation.mutate({
      id: selectedContract.id,
      sourceCode: selectedContract.sourceCode,
    });
  };

  const handleSaveToS3 = () => {
    if (!selectedContract) return;
    saveToS3Mutation.mutate({
      id: selectedContract.id,
      sourceCode: selectedContract.sourceCode,
      abi: selectedContract.abi ? JSON.stringify(selectedContract.abi) : undefined,
      bytecode: selectedContract.bytecode,
    });
  };

  const handleGenerateDocs = () => {
    if (!selectedContract) return;
    generateDocsMutation.mutate({ id: selectedContract.id });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const handleUseTemplate = (template: any) => {
    setFormData({
      ...formData,
      name: `${template.name} Contract`,
      sourceCode: template.sourceCode,
      templateType: template.templateType,
    });
  };

  const openEditor = (contract: any) => {
    setSelectedContract(contract);
    setIsEditorOpen(true);
    setActiveTab("source");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return <Badge className="bg-[var(--color-success)]">Deployado</Badge>;
      case "compiled":
        return <Badge className="bg-[var(--color-cyan)]">Compilado</Badge>;
      case "verified":
        return <Badge className="bg-[var(--color-warning)]">Verificado</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredContracts = contracts?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="headline-massive text-2xl md:text-3xl">Contratos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie seus contratos inteligentes Solidity
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Contrato</DialogTitle>
                <DialogDescription>
                  Crie um novo contrato do zero ou use um template.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="template">Usar Template</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Contrato</Label>
                      <Input
                        id="name"
                        placeholder="MyToken"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Projeto</Label>
                      <Select
                        value={formData.projectId.toString()}
                        onValueChange={(v) => setFormData({ ...formData, projectId: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o projeto" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva seu contrato..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sourceCode">Código Solidity (opcional)</Label>
                    <Textarea
                      id="sourceCode"
                      placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // ...&#10;}"
                      value={formData.sourceCode}
                      onChange={(e) => setFormData({ ...formData, sourceCode: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="template" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Nome do Contrato</Label>
                      <Input
                        id="templateName"
                        placeholder="MyToken"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Projeto</Label>
                      <Select
                        value={formData.projectId.toString()}
                        onValueChange={(v) => setFormData({ ...formData, projectId: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o projeto" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {templates && templates.length > 0 ? (
                      templates.map((template) => (
                        <div 
                          key={template.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.templateType === template.templateType 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleUseTemplate(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline">{template.templateType.toUpperCase()}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum template disponível</p>
                        <p className="text-sm">Templates serão adicionados em breve</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Contrato"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Contracts Grid */}
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
        ) : filteredContracts && filteredContracts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="border-border card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[var(--color-pink)]/10 flex items-center justify-center">
                        <FileCode2 className="h-5 w-5 text-[var(--color-pink)]" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{contract.name}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          v{contract.version}
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
                        <DropdownMenuItem onClick={() => openEditor(contract)}>
                          <Code className="h-4 w-4 mr-2" />
                          Editar Código
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyCode(contract.sourceCode || "")}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Código
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(contract.id)}
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
                  {contract.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contract.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(contract.status)}
                    {contract.templateType && (
                      <Badge variant="outline" className="text-xs">
                        {contract.templateType.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  {contract.contractAddress && (
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Endereço:</p>
                      <p className="font-mono text-xs truncate">{contract.contractAddress}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditor(contract)}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Editor
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      disabled={contract.status === "deployed"}
                    >
                      <Rocket className="h-4 w-4 mr-1" />
                      Deploy
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
                <FileCode2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Nenhum contrato encontrado</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                {searchQuery 
                  ? "Tente uma busca diferente ou crie um novo contrato."
                  : "Comece criando seu primeiro contrato inteligente."}
              </p>
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Criar Primeiro Contrato
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-5xl h-[80vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <FileCode2 className="h-5 w-5" />
                    {selectedContract?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Editor de contrato Solidity
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateDocs}
                    disabled={generateDocsMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {generateDocsMutation.isPending ? "Gerando..." : "Gerar Docs"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSaveToS3}
                    disabled={saveToS3Mutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Salvar S3
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveCode}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList>
                <TabsTrigger value="source">
                  <Code className="h-4 w-4 mr-1" />
                  Código
                </TabsTrigger>
                <TabsTrigger value="abi">
                  <FileJson className="h-4 w-4 mr-1" />
                  ABI
                </TabsTrigger>
                <TabsTrigger value="docs">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Documentação
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="source" className="flex-1 mt-4">
                <ScrollArea className="h-[50vh] rounded-lg border">
                  <Textarea
                    value={selectedContract?.sourceCode || ""}
                    onChange={(e) => setSelectedContract({ 
                      ...selectedContract, 
                      sourceCode: e.target.value 
                    })}
                    placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Seu código aqui&#10;}"
                    className="min-h-[50vh] font-mono text-sm border-0 resize-none code-editor"
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="abi" className="flex-1 mt-4">
                <ScrollArea className="h-[50vh] rounded-lg border p-4">
                  {selectedContract?.abi ? (
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedContract.abi, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileJson className="h-12 w-12 mb-2 opacity-50" />
                      <p>ABI não disponível</p>
                      <p className="text-sm">Compile o contrato para gerar o ABI</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="docs" className="flex-1 mt-4">
                <ScrollArea className="h-[50vh] rounded-lg border p-4">
                  {selectedContract?.aiDocumentation ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedContract.aiDocumentation}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Sparkles className="h-12 w-12 mb-2 opacity-50" />
                      <p>Documentação não gerada</p>
                      <p className="text-sm">Clique em "Gerar Docs" para criar documentação com IA</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
