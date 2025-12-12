import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
// Login agora é feito via MetaMask
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  FolderKanban,
  FileCode2,
  Send,
  Fuel,
  BookOpen,
  Wallet,
  Network,
  Blocks,
  Settings,
  Rocket,
  Vault,
  Image,
  Vote,
  Sun,
  Moon,
  BarChart3
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useI18n, LanguageSelector } from "@/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { Home, Loader2, User } from "lucide-react";
import { WalletAPI } from "@/lib/walletApi";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const getMenuItems = (t: (key: string) => string) => [
  { icon: Home, label: t('nav.home'), path: "/" },
  { icon: LayoutDashboard, label: t('nav.dashboard'), path: "/dashboard" },
  { icon: FolderKanban, label: t('nav.projects'), path: "/projects" },
  { icon: FileCode2, label: t('nav.contracts'), path: "/contracts" },
  { icon: Blocks, label: t('nav.templates'), path: "/templates" },
  { icon: Rocket, label: t('nav.deploy'), path: "/deploy" },
  { icon: Vault, label: t('nav.staking'), path: "/staking" },
  { icon: Image, label: t('nav.nftMarketplace'), path: "/nft-marketplace" },
  { icon: Vote, label: t('nav.governance'), path: "/governance" },
  { icon: Send, label: t('nav.transactions'), path: "/transactions" },
  { icon: BarChart3, label: t('nav.analytics') || 'Analytics', path: "/analytics" },
  { icon: Fuel, label: t('nav.gasTracker'), path: "/gas" },
  { icon: Wallet, label: t('nav.wallets'), path: "/wallets" },
  { icon: Network, label: t('nav.networks'), path: "/networks" },
  { icon: BookOpen, label: t('nav.docs'), path: "/docs" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

// Componente de login com carteira
function WalletLoginScreen() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingType, setConnectingType] = useState<'metamask' | 'walletconnect' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);
  const utils = trpc.useUtils();
  
  const getNonceMutation = trpc.auth.getWalletNonce.useMutation();
  const walletLoginMutation = trpc.auth.walletLogin.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Login realizado com sucesso!");
    },
    onError: (err) => {
      setError(err.message);
      toast.error("Erro ao fazer login: " + err.message);
    },
  });

  // Tentar reconeção automática ao carregar
  useEffect(() => {
    const tryAutoConnect = async () => {
      const savedWallet = localStorage.getItem('smartvault-last-wallet');
      if (!savedWallet) {
        setIsAutoConnecting(false);
        return;
      }

      try {
        if (savedWallet === 'metamask' && WalletAPI.isMetaMaskInstalled()) {
          // Verificar se já está conectado
          const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            await handleLogin(accounts[0]);
            return;
          }
        }
      } catch (err) {
        // Auto-connect silently failed
      }
      setIsAutoConnecting(false);
    };

    tryAutoConnect();
  }, []);

  const handleLogin = async (account: string) => {
    try {
      const { nonce } = await getNonceMutation.mutateAsync({ address: account });
      const signature = await WalletAPI.signMessage(nonce);
      await walletLoginMutation.mutateAsync({ address: account, signature, nonce });
    } catch (err: any) {
      throw err;
    }
  };

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    setConnectingType('metamask');
    setError(null);

    try {
      if (!WalletAPI.isMetaMaskInstalled()) {
        setError("MetaMask não encontrado. Por favor, instale a extensão MetaMask.");
        setIsConnecting(false);
        setConnectingType(null);
        return;
      }

      const account = await WalletAPI.connectWallet();
      if (!account) {
        setError("Não foi possível conectar a carteira.");
        setIsConnecting(false);
        setConnectingType(null);
        return;
      }

      // Salvar preferência de carteira
      localStorage.setItem('smartvault-last-wallet', 'metamask');
      
      await handleLogin(account);

    } catch (err: any) {
      console.error("Erro ao conectar carteira:", err);
      if (err.code === 4001) {
        setError("Conexão cancelada pelo usuário.");
      } else {
        setError(err.message || "Erro ao conectar carteira.");
      }
    } finally {
      setIsConnecting(false);
      setConnectingType(null);
    }
  };

  const handleConnectWalletConnect = async () => {
    setIsConnecting(true);
    setConnectingType('walletconnect');
    setError(null);

    try {
      // Importar WalletConnect dinamicamente
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const provider = await EthereumProvider.init({
        projectId: '3a8170812b534d0ff9d794f19a901d64',
        chains: [1, 137, 11155111, 5042002],
        showQrModal: true,
        metadata: {
          name: 'SmartVault',
          description: 'Secure Web3 Development Platform',
          url: window.location.origin,
          icons: [window.location.origin + '/smartvault-logo.png']
        }
      });

      await provider.connect();
      const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      
      if (accounts && accounts.length > 0) {
        localStorage.setItem('smartvault-last-wallet', 'walletconnect');
        await handleLogin(accounts[0]);
      } else {
        setError("Não foi possível obter a conta da carteira.");
      }

    } catch (err: any) {
      console.error("Erro WalletConnect:", err);
      if (err.message?.includes('User rejected')) {
        setError("Conexão cancelada pelo usuário.");
      } else {
        setError(err.message || "Erro ao conectar via WalletConnect.");
      }
    } finally {
      setIsConnecting(false);
      setConnectingType(null);
    }
  };

  // Mostrar loading durante auto-connect
  if (isAutoConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen blueprint-grid">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-cyan)]" />
          <p className="text-muted-foreground">Reconectando carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen blueprint-grid">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center wireframe-cyan">
              <img src="/smartvault-logo.png" alt="SmartVault" className="h-8 w-8" />
            </div>
            <h1 className="headline-massive text-3xl">SmartVault</h1>
          </div>
          <p className="tech-label text-center">
            Secure Wallet for SmartVault Network & Ethereum
          </p>
        </div>
        
        <div className="w-full p-6 bg-card rounded-lg border border-border shadow-sm space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Conecte sua carteira para acessar o dashboard e gerenciar seus projetos Web3.
          </p>
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
              {error}
            </div>
          )}
          
          {/* Botão MetaMask */}
          <Button
            onClick={handleConnectMetaMask}
            disabled={isConnecting}
            size="lg"
            className="w-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-pink)] hover:opacity-90"
          >
            {connectingType === 'metamask' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Conectar MetaMask
              </>
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Botão WalletConnect */}
          <Button
            onClick={handleConnectWalletConnect}
            disabled={isConnecting}
            size="lg"
            variant="outline"
            className="w-full border-[var(--color-cyan)]/30 hover:bg-[var(--color-cyan)]/10"
          >
            {connectingType === 'walletconnect' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Abrindo QR Code...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.09 8.5c3.26-3.2 8.56-3.2 11.82 0l.39.38a.4.4 0 010 .58l-1.34 1.31a.21.21 0 01-.3 0l-.54-.53a5.82 5.82 0 00-8.24 0l-.58.57a.21.21 0 01-.3 0L5.66 9.5a.4.4 0 010-.58l.43-.42zm14.6 2.71l1.2 1.17a.4.4 0 010 .58l-5.4 5.3a.42.42 0 01-.59 0l-3.83-3.76a.1.1 0 00-.15 0l-3.84 3.76a.42.42 0 01-.59 0l-5.4-5.3a.4.4 0 010-.58l1.2-1.17a.42.42 0 01.59 0l3.83 3.76a.1.1 0 00.15 0l3.84-3.76a.42.42 0 01.59 0l3.83 3.76a.1.1 0 00.15 0l3.83-3.76a.42.42 0 01.59 0z"/>
                </svg>
                WalletConnect
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Ao conectar, você concorda com nossos termos de uso.
          </p>
        </div>
        
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
            Ethereum
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[var(--color-pink)]" />
            Polygon
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
            Arc Network
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return <WalletLoginScreen />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { t } = useI18n();
  const { theme, toggleTheme, switchable } = useTheme();
  const menuItems = getMenuItems(t);
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-border">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <img src="/smartvault-logo.png" alt="SmartVault" className="h-6 w-6 shrink-0" />
                  <span className="font-semibold tracking-tight truncate text-sm">
                    SmartVault
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-2">
            <SidebarMenu className="px-2">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-9 transition-all font-normal text-sm ${isActive ? "bg-primary/10 text-primary" : ""}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {switchable && (
                  <>
                    <DropdownMenuItem
                      onClick={toggleTheme}
                      className="cursor-pointer"
                    >
                      {theme === 'dark' ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4" />
                      )}
                      <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setLocation("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('nav.profile') || 'Meu Perfil'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="blueprint-grid">
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-2">
                <img src="/smartvault-logo.png" alt="SmartVault" className="h-5 w-5" />
                <span className="font-medium text-sm">
                  {activeMenuItem?.label ?? "Menu"}
                </span>
              </div>
            </div>
            <LanguageSelector />
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
