import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Palette,
  Save
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    deployNotifications: true,
    transactionNotifications: true,
    
    // Preferences
    defaultNetwork: "1",
    gasPreference: "standard",
    autoCompile: true,
    
    // API Keys
    alchemyKey: "",
    infuraKey: "",
    etherscanKey: "",
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success("Configurações salvas com sucesso!");
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="headline-massive text-2xl md:text-3xl flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas preferências e configurações da plataforma
          </p>
        </div>

        {/* Profile Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Perfil</CardTitle>
            </div>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={user?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              As informações do perfil são gerenciadas através do Manus OAuth.
            </p>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure quando receber notificações por email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Notificações por Email</p>
                <p className="text-xs text-muted-foreground">
                  Receber atualizações importantes por email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Deploy de Contratos</p>
                <p className="text-xs text-muted-foreground">
                  Notificar quando um contrato for deployado com sucesso
                </p>
              </div>
              <Switch
                checked={settings.deployNotifications}
                onCheckedChange={() => handleToggle("deployNotifications")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Transações Confirmadas</p>
                <p className="text-xs text-muted-foreground">
                  Notificar quando transações forem confirmadas na blockchain
                </p>
              </div>
              <Switch
                checked={settings.transactionNotifications}
                onCheckedChange={() => handleToggle("transactionNotifications")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Preferências</CardTitle>
            </div>
            <CardDescription>
              Personalize sua experiência de desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rede Padrão</Label>
                <Select
                  value={settings.defaultNetwork}
                  onValueChange={(v) => setSettings({ ...settings, defaultNetwork: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ethereum Mainnet</SelectItem>
                    <SelectItem value="137">Polygon</SelectItem>
                    <SelectItem value="56">BSC</SelectItem>
                    <SelectItem value="42161">Arbitrum</SelectItem>
                    <SelectItem value="5">Goerli Testnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Preferência de Gas</Label>
                <Select
                  value={settings.gasPreference}
                  onValueChange={(v) => setSettings({ ...settings, gasPreference: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Lento (Econômico)</SelectItem>
                    <SelectItem value="standard">Médio (Padrão)</SelectItem>
                    <SelectItem value="fast">Rápido (Prioridade)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Compilação Automática</p>
                <p className="text-xs text-muted-foreground">
                  Compilar contratos automaticamente ao salvar
                </p>
              </div>
              <Switch
                checked={settings.autoCompile}
                onCheckedChange={() => handleToggle("autoCompile")}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Chaves de API</CardTitle>
            </div>
            <CardDescription>
              Configure suas chaves de API para provedores externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alchemy">Alchemy API Key</Label>
              <Input
                id="alchemy"
                type="password"
                placeholder="Sua chave Alchemy..."
                value={settings.alchemyKey}
                onChange={(e) => setSettings({ ...settings, alchemyKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha em <a href="https://www.alchemy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">alchemy.com</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="infura">Infura API Key</Label>
              <Input
                id="infura"
                type="password"
                placeholder="Sua chave Infura..."
                value={settings.infuraKey}
                onChange={(e) => setSettings({ ...settings, infuraKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha em <a href="https://infura.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">infura.io</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etherscan">Etherscan API Key</Label>
              <Input
                id="etherscan"
                type="password"
                placeholder="Sua chave Etherscan..."
                value={settings.etherscanKey}
                onChange={(e) => setSettings({ ...settings, etherscanKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha em <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">etherscan.io</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Segurança</CardTitle>
            </div>
            <CardDescription>
              Configurações de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[var(--color-success)] mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Autenticação Segura</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sua conta está protegida através do Manus OAuth. Suas chaves privadas de carteira 
                    nunca são armazenadas em nossos servidores - apenas os endereços públicos são salvos para referência.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
