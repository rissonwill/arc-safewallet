import { useState, useEffect } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Fuel, Shield, Mail, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const NETWORKS = [
  { chainId: 1, name: "Ethereum", color: "bg-blue-500" },
  { chainId: 5042002, name: "Arc Testnet", color: "bg-purple-500" },
  { chainId: 137, name: "Polygon", color: "bg-violet-500" },
  { chainId: 56, name: "BSC", color: "bg-yellow-500" },
  { chainId: 42161, name: "Arbitrum", color: "bg-cyan-500" },
  { chainId: 11155111, name: "Sepolia", color: "bg-gray-500" },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const authLoading = !user;
  
  const { data: prefs, isLoading: prefsLoading } = trpc.notificationPrefs.get.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  const updateMutation = trpc.notificationPrefs.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved", { description: "Your notification preferences have been updated." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const [settings, setSettings] = useState({
    enableTransactionAlerts: true,
    enableGasAlerts: true,
    enableSecurityAlerts: true,
    gasAlertThreshold: 20,
    preferredChains: [1, 5042002, 137],
    emailNotifications: false,
  });

  useEffect(() => {
    if (prefs) {
      setSettings({
        enableTransactionAlerts: prefs.enableTransactionAlerts,
        enableGasAlerts: prefs.enableGasAlerts,
        enableSecurityAlerts: prefs.enableSecurityAlerts,
        gasAlertThreshold: prefs.gasAlertThreshold,
        preferredChains: prefs.preferredChains || [1, 5042002, 137],
        emailNotifications: prefs.emailNotifications,
      });
    }
  }, [prefs]);

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const toggleChain = (chainId: number) => {
    setSettings(prev => ({
      ...prev,
      preferredChains: prev.preferredChains.includes(chainId)
        ? prev.preferredChains.filter(id => id !== chainId)
        : [...prev.preferredChains, chainId],
    }));
  };

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to manage your notification settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-neon-text">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure how and when you want to receive alerts
          </p>
        </div>

        <div className="space-y-6">
          {/* Alert Types */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Alert Types
              </CardTitle>
              <CardDescription>Choose which types of alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label className="text-base">Transaction Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your transactions are confirmed
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableTransactionAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTransactionAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Fuel className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <Label className="text-base">Gas Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when gas prices drop below your threshold
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableGasAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableGasAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security issues with your contracts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableSecurityAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSecurityAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gas Threshold */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                Gas Alert Threshold
              </CardTitle>
              <CardDescription>
                Receive alerts when gas price drops below this value (in Gwei)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current threshold</span>
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    {settings.gasAlertThreshold} Gwei
                  </Badge>
                </div>
                <Slider
                  value={[settings.gasAlertThreshold]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, gasAlertThreshold: value }))}
                  min={5}
                  max={100}
                  step={5}
                  disabled={!settings.enableGasAlerts}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 Gwei</span>
                  <span>50 Gwei</span>
                  <span>100 Gwei</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferred Networks */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Preferred Networks</CardTitle>
              <CardDescription>
                Select which networks you want to receive alerts for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {NETWORKS.map((network) => (
                  <Badge
                    key={network.chainId}
                    variant={settings.preferredChains.includes(network.chainId) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      settings.preferredChains.includes(network.chainId)
                        ? `${network.color} text-white`
                        : "hover:bg-accent"
                    }`}
                    onClick={() => toggleChain(network.chainId)}
                  >
                    {network.name}
                    {settings.preferredChains.includes(network.chainId) && (
                      <Check className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Receive alerts via email in addition to in-app notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Emails will be sent to: {user.email || "Not configured"}
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  disabled={!user.email}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
