import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de idioma suportados
export type Language = 'pt' | 'en';

// Interface do contexto
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Traduções
const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navegação
    'nav.home': 'Início',
    'nav.dashboard': 'Painel',
    'nav.projects': 'Projetos',
    'nav.contracts': 'Contratos',
    'nav.templates': 'Templates',
    'nav.transactions': 'Transações',
    'nav.gasTracker': 'Monitor de Gas',
    'nav.wallets': 'Carteiras',
    'nav.networks': 'Redes',
    'nav.deploy': 'Deploy',
    'nav.staking': 'Staking',
    'nav.nftMarketplace': 'NFT Marketplace',
    'nav.docs': 'Documentação',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    
    // Página Inicial
    'home.title': 'Arc SafeWallet',
    'home.subtitle': 'Sua Carteira Web3 Multi-Rede Segura',
    'home.description': 'Gerencie seus ativos digitais, contratos inteligentes e NFTs em múltiplas blockchains com segurança e facilidade.',
    'home.getStarted': 'Começar Agora',
    'home.learnMore': 'Saiba Mais',
    'home.connectWallet': 'Conectar Carteira',
    'home.features': 'Recursos',
    'home.feature1.title': 'Multi-Rede',
    'home.feature1.desc': 'Suporte a Arc Network, Ethereum, Polygon e mais.',
    'home.feature2.title': 'Contratos Inteligentes',
    'home.feature2.desc': 'Crie, compile e faça deploy de contratos Solidity.',
    'home.feature3.title': 'NFT Marketplace',
    'home.feature3.desc': 'Compre, venda e crie NFTs facilmente.',
    'home.feature4.title': 'Staking',
    'home.feature4.desc': 'Ganhe recompensas fazendo stake dos seus tokens.',
    'home.feature5.title': 'Segurança',
    'home.feature5.desc': 'Scanner de vulnerabilidades e debugger integrado.',
    'home.feature6.title': 'Gas Tracker',
    'home.feature6.desc': 'Monitore preços de gas em tempo real.',
    
    // Dashboard
    'dashboard.welcome': 'Bem-vindo ao Arc SafeWallet',
    'dashboard.totalBalance': 'Saldo Total',
    'dashboard.projects': 'Projetos',
    'dashboard.contracts': 'Contratos',
    'dashboard.transactions': 'Transações',
    'dashboard.recentActivity': 'Atividade Recente',
    'dashboard.quickActions': 'Ações Rápidas',
    'dashboard.newProject': 'Novo Projeto',
    'dashboard.deployContract': 'Deploy Contrato',
    'dashboard.sendTokens': 'Enviar Tokens',
    
    // Carteiras
    'wallets.title': 'Carteiras',
    'wallets.connect': 'Conectar Carteira',
    'wallets.disconnect': 'Desconectar',
    'wallets.connected': 'Conectado',
    'wallets.notConnected': 'Não Conectado',
    'wallets.balance': 'Saldo',
    'wallets.address': 'Endereço',
    'wallets.network': 'Rede',
    'wallets.switchNetwork': 'Trocar Rede',
    'wallets.addNetwork': 'Adicionar Rede',
    'wallets.copyAddress': 'Copiar Endereço',
    'wallets.viewExplorer': 'Ver no Explorer',
    
    // Contratos
    'contracts.title': 'Contratos Inteligentes',
    'contracts.new': 'Novo Contrato',
    'contracts.compile': 'Compilar',
    'contracts.deploy': 'Deploy',
    'contracts.verify': 'Verificar',
    'contracts.interact': 'Interagir',
    'contracts.source': 'Código Fonte',
    'contracts.abi': 'ABI',
    'contracts.bytecode': 'Bytecode',
    'contracts.address': 'Endereço',
    'contracts.network': 'Rede',
    'contracts.status': 'Status',
    'contracts.deployed': 'Deployado',
    'contracts.pending': 'Pendente',
    'contracts.failed': 'Falhou',
    
    // Staking
    'staking.title': 'Staking',
    'staking.stake': 'Fazer Stake',
    'staking.unstake': 'Retirar Stake',
    'staking.claim': 'Resgatar Recompensas',
    'staking.stakedAmount': 'Valor em Stake',
    'staking.rewards': 'Recompensas',
    'staking.apy': 'APY',
    'staking.totalStaked': 'Total em Stake',
    
    // NFT
    'nft.title': 'NFT Marketplace',
    'nft.mint': 'Criar NFT',
    'nft.buy': 'Comprar',
    'nft.sell': 'Vender',
    'nft.myNfts': 'Meus NFTs',
    'nft.allNfts': 'Todos os NFTs',
    'nft.price': 'Preço',
    'nft.owner': 'Proprietário',
    
    // Transações
    'transactions.title': 'Transações',
    'transactions.hash': 'Hash',
    'transactions.from': 'De',
    'transactions.to': 'Para',
    'transactions.value': 'Valor',
    'transactions.gas': 'Gas',
    'transactions.status': 'Status',
    'transactions.confirmed': 'Confirmada',
    'transactions.pending': 'Pendente',
    'transactions.failed': 'Falhou',
    
    // Gas Tracker
    'gas.title': 'Monitor de Gas',
    'gas.slow': 'Lento',
    'gas.standard': 'Padrão',
    'gas.fast': 'Rápido',
    'gas.instant': 'Instantâneo',
    'gas.gwei': 'Gwei',
    'gas.estimatedTime': 'Tempo Estimado',
    
    // Redes
    'networks.title': 'Redes Blockchain',
    'networks.arcTestnet': 'Arc Testnet',
    'networks.sepolia': 'Ethereum Sepolia',
    'networks.chainId': 'Chain ID',
    'networks.rpc': 'RPC URL',
    'networks.explorer': 'Explorer',
    'networks.faucet': 'Faucet',
    'networks.gasToken': 'Token de Gas',
    
    // Comum
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Visualizar',
    'common.copy': 'Copiar',
    'common.copied': 'Copiado!',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.noData': 'Nenhum dado encontrado',
    'common.comingSoon': 'Em breve',
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.contracts': 'Contracts',
    'nav.templates': 'Templates',
    'nav.transactions': 'Transactions',
    'nav.gasTracker': 'Gas Tracker',
    'nav.wallets': 'Wallets',
    'nav.networks': 'Networks',
    'nav.deploy': 'Deploy',
    'nav.staking': 'Staking',
    'nav.nftMarketplace': 'NFT Marketplace',
    'nav.docs': 'Documentation',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Home Page
    'home.title': 'Arc SafeWallet',
    'home.subtitle': 'Your Secure Multi-Network Web3 Wallet',
    'home.description': 'Manage your digital assets, smart contracts and NFTs across multiple blockchains with security and ease.',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',
    'home.connectWallet': 'Connect Wallet',
    'home.features': 'Features',
    'home.feature1.title': 'Multi-Network',
    'home.feature1.desc': 'Support for Arc Network, Ethereum, Polygon and more.',
    'home.feature2.title': 'Smart Contracts',
    'home.feature2.desc': 'Create, compile and deploy Solidity contracts.',
    'home.feature3.title': 'NFT Marketplace',
    'home.feature3.desc': 'Buy, sell and create NFTs easily.',
    'home.feature4.title': 'Staking',
    'home.feature4.desc': 'Earn rewards by staking your tokens.',
    'home.feature5.title': 'Security',
    'home.feature5.desc': 'Built-in vulnerability scanner and debugger.',
    'home.feature6.title': 'Gas Tracker',
    'home.feature6.desc': 'Monitor gas prices in real-time.',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to Arc SafeWallet',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.projects': 'Projects',
    'dashboard.contracts': 'Contracts',
    'dashboard.transactions': 'Transactions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newProject': 'New Project',
    'dashboard.deployContract': 'Deploy Contract',
    'dashboard.sendTokens': 'Send Tokens',
    
    // Wallets
    'wallets.title': 'Wallets',
    'wallets.connect': 'Connect Wallet',
    'wallets.disconnect': 'Disconnect',
    'wallets.connected': 'Connected',
    'wallets.notConnected': 'Not Connected',
    'wallets.balance': 'Balance',
    'wallets.address': 'Address',
    'wallets.network': 'Network',
    'wallets.switchNetwork': 'Switch Network',
    'wallets.addNetwork': 'Add Network',
    'wallets.copyAddress': 'Copy Address',
    'wallets.viewExplorer': 'View on Explorer',
    
    // Contracts
    'contracts.title': 'Smart Contracts',
    'contracts.new': 'New Contract',
    'contracts.compile': 'Compile',
    'contracts.deploy': 'Deploy',
    'contracts.verify': 'Verify',
    'contracts.interact': 'Interact',
    'contracts.source': 'Source Code',
    'contracts.abi': 'ABI',
    'contracts.bytecode': 'Bytecode',
    'contracts.address': 'Address',
    'contracts.network': 'Network',
    'contracts.status': 'Status',
    'contracts.deployed': 'Deployed',
    'contracts.pending': 'Pending',
    'contracts.failed': 'Failed',
    
    // Staking
    'staking.title': 'Staking',
    'staking.stake': 'Stake',
    'staking.unstake': 'Unstake',
    'staking.claim': 'Claim Rewards',
    'staking.stakedAmount': 'Staked Amount',
    'staking.rewards': 'Rewards',
    'staking.apy': 'APY',
    'staking.totalStaked': 'Total Staked',
    
    // NFT
    'nft.title': 'NFT Marketplace',
    'nft.mint': 'Mint NFT',
    'nft.buy': 'Buy',
    'nft.sell': 'Sell',
    'nft.myNfts': 'My NFTs',
    'nft.allNfts': 'All NFTs',
    'nft.price': 'Price',
    'nft.owner': 'Owner',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.hash': 'Hash',
    'transactions.from': 'From',
    'transactions.to': 'To',
    'transactions.value': 'Value',
    'transactions.gas': 'Gas',
    'transactions.status': 'Status',
    'transactions.confirmed': 'Confirmed',
    'transactions.pending': 'Pending',
    'transactions.failed': 'Failed',
    
    // Gas Tracker
    'gas.title': 'Gas Tracker',
    'gas.slow': 'Slow',
    'gas.standard': 'Standard',
    'gas.fast': 'Fast',
    'gas.instant': 'Instant',
    'gas.gwei': 'Gwei',
    'gas.estimatedTime': 'Estimated Time',
    
    // Networks
    'networks.title': 'Blockchain Networks',
    'networks.arcTestnet': 'Arc Testnet',
    'networks.sepolia': 'Ethereum Sepolia',
    'networks.chainId': 'Chain ID',
    'networks.rpc': 'RPC URL',
    'networks.explorer': 'Explorer',
    'networks.faucet': 'Faucet',
    'networks.gasToken': 'Gas Token',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.noData': 'No data found',
    'common.comingSoon': 'Coming soon',
  },
};

// Contexto
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Tentar recuperar do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-safewallet-language');
      if (saved === 'pt' || saved === 'en') {
        return saved;
      }
      // Detectar idioma do navegador
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('pt')) {
        return 'pt';
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc-safewallet-language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Atualizar atributo lang do HTML
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Componente de seleção de idioma
export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1 border border-border/50">
      <button
        onClick={() => setLanguage('pt')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          language === 'pt'
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  );
}
