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
    'nav.governance': 'Governança',
    'nav.docs': 'Documentação',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    
    // Página Inicial
    'home.title': 'Arc SafeWallet',
    'home.subtitle': 'Contratos Inteligentes com Segurança',
    'home.description': 'Gerencie seus ativos digitais, contratos inteligentes e NFTs em múltiplas blockchains com segurança e facilidade.',
    'home.getStarted': 'Começar Agora',
    'home.learnMore': 'Saiba Mais',
    'home.connectWallet': 'Conectar Carteira',
    'home.features': 'Funcionalidades Poderosas',
    'home.featuresSubtitle': 'Tudo que você precisa para desenvolver, testar e fazer deploy de contratos inteligentes seguros.',
    'home.poweredBy': 'Powered by Arc Network',
    'home.networksSupported': 'Redes Suportadas',
    'home.templates': 'Templates',
    'home.vulnerabilities': 'Vulnerabilidades Detectadas',
    'home.readyToBuild': 'Pronto para Construir?',
    'home.readyToBuildDesc': 'Junte-se a desenvolvedores que estão construindo o futuro da Web3 com segurança e eficiência na Arc Network.',
    'home.createFreeAccount': 'Criar Conta Gratuita',
    'home.principal': 'Principal',
    
    // Features da Home
    'home.feature.editor': 'Editor Solidity',
    'home.feature.editorDesc': 'Editor avançado com syntax highlighting, autocompletion e validação em tempo real',
    'home.feature.debugger': 'Debugger Integrado',
    'home.feature.debuggerDesc': 'Debug de contratos com breakpoints, inspeção de variáveis e call stack',
    'home.feature.security': 'Security Scanner',
    'home.feature.securityDesc': 'Análise de vulnerabilidades: reentrancy, overflow, access control e mais',
    'home.feature.deploy': 'Deploy Multi-Chain',
    'home.feature.deployDesc': 'Deploy para Arc Network, Ethereum, Polygon, BSC e outras redes EVM',
    'home.feature.gas': 'Gas Tracker',
    'home.feature.gasDesc': 'Monitoramento de gas fees em tempo real via APIs do Etherscan e Alchemy',
    'home.feature.docs': 'Documentação IA',
    'home.feature.docsDesc': 'Geração automática de documentação técnica com LLM para seus contratos',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Visão geral dos seus projetos e contratos Web3',
    'dashboard.welcome': 'Bem-vindo ao Arc SafeWallet',
    'dashboard.totalBalance': 'Saldo Total',
    'dashboard.projects': 'Projetos',
    'dashboard.contracts': 'Contratos',
    'dashboard.transactions': 'Transações',
    'dashboard.deployed': 'Deployados',
    'dashboard.recentTransactions': 'Transações Recentes',
    'dashboard.recentTransactionsDesc': 'Últimas transações blockchain',
    'dashboard.noTransactions': 'Nenhuma transação ainda',
    'dashboard.viewAll': 'Ver todas',
    'dashboard.quickActions': 'Ações Rápidas',
    'dashboard.quickActionsDesc': 'Comece a desenvolver seus contratos Web3',
    'dashboard.newProject': 'Novo Projeto',
    'dashboard.newContract': 'Novo Contrato',
    'dashboard.useTemplate': 'Usar Template',
    'dashboard.useTemplateDesc': 'ERC-20, ERC-721, ERC-1155',
    'dashboard.createFromScratch': 'Criar do zero',
    'dashboard.connectWallet': 'Conectar Wallet',
    'dashboard.connectWalletDesc': 'MetaMask, WalletConnect',
    'dashboard.documentation': 'Documentação',
    'dashboard.documentationDesc': 'Guias e exemplos',
    'dashboard.gasTracker': 'Gas Tracker',
    'dashboard.gasTrackerDesc': 'Preços em tempo real',
    'dashboard.gasUnavailable': 'Dados de gas indisponíveis',
    'dashboard.connectToMonitor': 'Conecte a uma rede para monitorar',
    
    // Projetos
    'projects.title': 'Projetos',
    'projects.subtitle': 'Gerencie seus projetos Web3',
    'projects.new': 'Novo Projeto',
    'projects.name': 'Nome do Projeto',
    'projects.description': 'Descrição',
    'projects.network': 'Rede',
    'projects.created': 'Criado em',
    'projects.contracts': 'Contratos',
    'projects.noProjects': 'Nenhum projeto ainda',
    'projects.createFirst': 'Crie seu primeiro projeto para começar',
    
    // Contratos
    'contracts.title': 'Contratos Inteligentes',
    'contracts.subtitle': 'Gerencie seus contratos Solidity',
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
    'contracts.noContracts': 'Nenhum contrato ainda',
    'contracts.createFirst': 'Crie seu primeiro contrato ou use um template',
    
    // Templates
    'templates.title': 'Templates de Contratos',
    'templates.subtitle': 'Comece rapidamente com templates prontos',
    'templates.erc20': 'Token ERC-20',
    'templates.erc20Desc': 'Token fungível padrão com mint, burn e transfer',
    'templates.erc721': 'NFT ERC-721',
    'templates.erc721Desc': 'Token não-fungível para colecionáveis digitais',
    'templates.erc1155': 'Multi-Token ERC-1155',
    'templates.erc1155Desc': 'Token híbrido para fungíveis e não-fungíveis',
    'templates.use': 'Usar Template',
    'templates.preview': 'Visualizar',
    
    // Deploy
    'deploy.title': 'Deploy de Contratos',
    'deploy.subtitle': 'Faça deploy dos seus contratos para a blockchain',
    'deploy.selectContract': 'Selecionar Contrato',
    'deploy.selectNetwork': 'Selecionar Rede',
    'deploy.estimatedGas': 'Gas Estimado',
    'deploy.deployNow': 'Deploy Agora',
    'deploy.deploying': 'Fazendo Deploy...',
    'deploy.success': 'Deploy realizado com sucesso!',
    'deploy.error': 'Erro no deploy',
    'deploy.contractAddress': 'Endereço do Contrato',
    'deploy.txHash': 'Hash da Transação',
    'deploy.viewOnExplorer': 'Ver no Explorer',
    
    // Staking
    'staking.title': 'Staking',
    'staking.subtitle': 'Ganhe recompensas fazendo stake dos seus tokens',
    'staking.stake': 'Fazer Stake',
    'staking.unstake': 'Retirar Stake',
    'staking.claim': 'Resgatar Recompensas',
    'staking.stakedAmount': 'Valor em Stake',
    'staking.rewards': 'Recompensas',
    'staking.pendingRewards': 'Recompensas Pendentes',
    'staking.apy': 'APY',
    'staking.totalStaked': 'Total em Stake',
    'staking.yourStake': 'Seu Stake',
    'staking.amount': 'Quantidade',
    'staking.balance': 'Saldo Disponível',
    'staking.connectWallet': 'Conecte sua carteira para fazer stake',
    
    // NFT Marketplace
    'nft.title': 'NFT Marketplace',
    'nft.subtitle': 'Compre, venda e crie NFTs',
    'nft.mint': 'Criar NFT',
    'nft.buy': 'Comprar',
    'nft.sell': 'Vender',
    'nft.myNfts': 'Meus NFTs',
    'nft.allNfts': 'Todos os NFTs',
    'nft.listed': 'À Venda',
    'nft.price': 'Preço',
    'nft.owner': 'Proprietário',
    'nft.creator': 'Criador',
    'nft.tokenId': 'Token ID',
    'nft.collection': 'Coleção',
    'nft.noNfts': 'Nenhum NFT encontrado',
    'nft.mintNew': 'Criar novo NFT',
    
    // Transações
    'transactions.title': 'Transações',
    'transactions.subtitle': 'Histórico de transações blockchain',
    'transactions.hash': 'Hash',
    'transactions.from': 'De',
    'transactions.to': 'Para',
    'transactions.value': 'Valor',
    'transactions.gas': 'Gas',
    'transactions.gasUsed': 'Gas Usado',
    'transactions.gasPrice': 'Preço do Gas',
    'transactions.status': 'Status',
    'transactions.confirmed': 'Confirmada',
    'transactions.pending': 'Pendente',
    'transactions.failed': 'Falhou',
    'transactions.block': 'Bloco',
    'transactions.timestamp': 'Data/Hora',
    'transactions.noTransactions': 'Nenhuma transação encontrada',
    
    // Gas Tracker
    'gas.title': 'Monitor de Gas',
    'gas.subtitle': 'Preços de gas em tempo real',
    'gas.slow': 'Lento',
    'gas.standard': 'Padrão',
    'gas.fast': 'Rápido',
    'gas.instant': 'Instantâneo',
    'gas.gwei': 'Gwei',
    'gas.estimatedTime': 'Tempo Estimado',
    'gas.baseFee': 'Taxa Base',
    'gas.priorityFee': 'Taxa de Prioridade',
    'gas.lastUpdate': 'Última Atualização',
    
    // Carteiras
    'wallets.title': 'Carteiras',
    'wallets.subtitle': 'Gerencie suas carteiras Web3',
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
    'wallets.metamask': 'MetaMask',
    'wallets.walletconnect': 'WalletConnect',
    'wallets.selectWallet': 'Selecione uma carteira',
    
    // Redes
    'networks.title': 'Redes Blockchain',
    'networks.subtitle': 'Redes suportadas pela plataforma',
    'networks.arcTestnet': 'Arc Testnet',
    'networks.sepolia': 'Ethereum Sepolia',
    'networks.ethereum': 'Ethereum Mainnet',
    'networks.polygon': 'Polygon',
    'networks.bsc': 'BSC',
    'networks.arbitrum': 'Arbitrum',
    'networks.chainId': 'Chain ID',
    'networks.rpc': 'RPC URL',
    'networks.explorer': 'Explorer',
    'networks.faucet': 'Faucet',
    'networks.gasToken': 'Token de Gas',
    'networks.status': 'Status',
    'networks.active': 'Ativo',
    'networks.testnet': 'Testnet',
    'networks.mainnet': 'Mainnet',
    
    // Documentação
    'docs.title': 'Documentação',
    'docs.subtitle': 'Guias e referências para desenvolvedores',
    'docs.gettingStarted': 'Começando',
    'docs.tutorials': 'Tutoriais',
    'docs.apiReference': 'Referência da API',
    'docs.examples': 'Exemplos',
    'docs.faq': 'Perguntas Frequentes',
    
    // Configurações
    'settings.title': 'Configurações',
    'settings.subtitle': 'Configure sua conta e preferências',
    'settings.profile': 'Perfil',
    'settings.security': 'Segurança',
    'settings.notifications': 'Notificações',
    'settings.appearance': 'Aparência',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.dark': 'Escuro',
    'settings.light': 'Claro',
    'settings.save': 'Salvar Alterações',
    
    // Security Scanner
    'security.title': 'Security Scanner',
    'security.subtitle': 'Análise de vulnerabilidades em contratos',
    'security.scan': 'Escanear',
    'security.scanning': 'Escaneando...',
    'security.noIssues': 'Nenhuma vulnerabilidade encontrada',
    'security.issuesFound': 'Vulnerabilidades encontradas',
    'security.critical': 'Crítico',
    'security.high': 'Alto',
    'security.medium': 'Médio',
    'security.low': 'Baixo',
    'security.info': 'Informativo',
    'security.reentrancy': 'Reentrancy',
    'security.overflow': 'Overflow/Underflow',
    'security.accessControl': 'Controle de Acesso',
    'security.gasOptimization': 'Otimização de Gas',
    
    // Debugger
    'debugger.title': 'Contract Debugger',
    'debugger.subtitle': 'Debug de contratos Solidity',
    'debugger.start': 'Iniciar Debug',
    'debugger.stop': 'Parar',
    'debugger.stepOver': 'Próximo Passo',
    'debugger.stepInto': 'Entrar na Função',
    'debugger.stepOut': 'Sair da Função',
    'debugger.continue': 'Continuar',
    'debugger.breakpoints': 'Breakpoints',
    'debugger.variables': 'Variáveis',
    'debugger.callStack': 'Call Stack',
    'debugger.console': 'Console',
    
    // Tutorial
    'tutorial.welcome': 'Bem-vindo ao Arc SafeWallet!',
    'tutorial.welcomeDesc': 'Esta é sua plataforma completa para desenvolvimento Web3. Vamos fazer um tour rápido pelas principais funcionalidades.',
    'tutorial.step1': 'Dashboard',
    'tutorial.step1Desc': 'Aqui você tem uma visão geral de todos os seus projetos, contratos e transações.',
    'tutorial.step2': 'Projetos',
    'tutorial.step2Desc': 'Organize seus contratos em projetos para melhor gerenciamento.',
    'tutorial.step3': 'Editor',
    'tutorial.step3Desc': 'Escreva e edite seus contratos Solidity com syntax highlighting.',
    'tutorial.step4': 'Deploy',
    'tutorial.step4Desc': 'Faça deploy dos seus contratos para múltiplas redes blockchain.',
    'tutorial.step5': 'Security',
    'tutorial.step5Desc': 'Analise seus contratos em busca de vulnerabilidades de segurança.',
    'tutorial.step6': 'Staking',
    'tutorial.step6Desc': 'Faça stake dos seus tokens e ganhe recompensas.',
    'tutorial.step7': 'NFT',
    'tutorial.step7Desc': 'Crie, compre e venda NFTs no marketplace integrado.',
    'tutorial.step8': 'Carteiras',
    'tutorial.step8Desc': 'Conecte sua carteira MetaMask ou WalletConnect.',
    'tutorial.next': 'Próximo',
    'tutorial.previous': 'Anterior',
    'tutorial.skip': 'Pular Tutorial',
    'tutorial.finish': 'Concluir',
    'tutorial.stepOf': 'Passo {current} de {total}',
    'tutorial.complete': 'completo',
    
    // Mensagens de Erro
    'error.generic': 'Ocorreu um erro. Tente novamente.',
    'error.network': 'Erro de conexão. Verifique sua internet.',
    'error.wallet': 'Erro ao conectar carteira.',
    'error.transaction': 'Erro na transação.',
    'error.compile': 'Erro ao compilar contrato.',
    'error.deploy': 'Erro ao fazer deploy.',
    'error.notFound': 'Não encontrado.',
    'error.unauthorized': 'Não autorizado.',
    'error.invalidAddress': 'Endereço inválido.',
    'error.insufficientFunds': 'Saldo insuficiente.',
    'error.gasEstimation': 'Erro ao estimar gas.',
    
    // Mensagens de Sucesso
    'success.saved': 'Salvo com sucesso!',
    'success.deployed': 'Deploy realizado com sucesso!',
    'success.compiled': 'Compilado com sucesso!',
    'success.connected': 'Carteira conectada!',
    'success.disconnected': 'Carteira desconectada.',
    'success.copied': 'Copiado para a área de transferência!',
    'success.staked': 'Stake realizado com sucesso!',
    'success.unstaked': 'Unstake realizado com sucesso!',
    'success.claimed': 'Recompensas resgatadas!',
    'success.minted': 'NFT criado com sucesso!',
    'success.purchased': 'NFT comprado com sucesso!',
    'success.listed': 'NFT listado para venda!',
    
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
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.close': 'Fechar',
    'common.open': 'Abrir',
    'common.refresh': 'Atualizar',
    'common.download': 'Baixar',
    'common.upload': 'Enviar',
    'common.create': 'Criar',
    'common.update': 'Atualizar',
    'common.remove': 'Remover',
    'common.add': 'Adicionar',
    'common.select': 'Selecionar',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.or': 'ou',
    'common.and': 'e',
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
    'nav.governance': 'Governance',
    'nav.docs': 'Documentation',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Home Page
    'home.title': 'Arc SafeWallet',
    'home.subtitle': 'Smart Contracts with Security',
    'home.description': 'Manage your digital assets, smart contracts and NFTs across multiple blockchains with security and ease.',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',
    'home.connectWallet': 'Connect Wallet',
    'home.features': 'Powerful Features',
    'home.featuresSubtitle': 'Everything you need to develop, test and deploy secure smart contracts.',
    'home.poweredBy': 'Powered by Arc Network',
    'home.networksSupported': 'Networks Supported',
    'home.templates': 'Templates',
    'home.vulnerabilities': 'Vulnerabilities Detected',
    'home.readyToBuild': 'Ready to Build?',
    'home.readyToBuildDesc': 'Join developers who are building the future of Web3 with security and efficiency on Arc Network.',
    'home.createFreeAccount': 'Create Free Account',
    'home.principal': 'Primary',
    
    // Home Features
    'home.feature.editor': 'Solidity Editor',
    'home.feature.editorDesc': 'Advanced editor with syntax highlighting, autocompletion and real-time validation',
    'home.feature.debugger': 'Integrated Debugger',
    'home.feature.debuggerDesc': 'Contract debugging with breakpoints, variable inspection and call stack',
    'home.feature.security': 'Security Scanner',
    'home.feature.securityDesc': 'Vulnerability analysis: reentrancy, overflow, access control and more',
    'home.feature.deploy': 'Multi-Chain Deploy',
    'home.feature.deployDesc': 'Deploy to Arc Network, Ethereum, Polygon, BSC and other EVM networks',
    'home.feature.gas': 'Gas Tracker',
    'home.feature.gasDesc': 'Real-time gas fee monitoring via Etherscan and Alchemy APIs',
    'home.feature.docs': 'AI Documentation',
    'home.feature.docsDesc': 'Automatic technical documentation generation with LLM for your contracts',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your Web3 projects and contracts',
    'dashboard.welcome': 'Welcome to Arc SafeWallet',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.projects': 'Projects',
    'dashboard.contracts': 'Contracts',
    'dashboard.transactions': 'Transactions',
    'dashboard.deployed': 'Deployed',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.recentTransactionsDesc': 'Latest blockchain transactions',
    'dashboard.noTransactions': 'No transactions yet',
    'dashboard.viewAll': 'View all',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.quickActionsDesc': 'Start developing your Web3 contracts',
    'dashboard.newProject': 'New Project',
    'dashboard.newContract': 'New Contract',
    'dashboard.useTemplate': 'Use Template',
    'dashboard.useTemplateDesc': 'ERC-20, ERC-721, ERC-1155',
    'dashboard.createFromScratch': 'Create from scratch',
    'dashboard.connectWallet': 'Connect Wallet',
    'dashboard.connectWalletDesc': 'MetaMask, WalletConnect',
    'dashboard.documentation': 'Documentation',
    'dashboard.documentationDesc': 'Guides and examples',
    'dashboard.gasTracker': 'Gas Tracker',
    'dashboard.gasTrackerDesc': 'Real-time prices',
    'dashboard.gasUnavailable': 'Gas data unavailable',
    'dashboard.connectToMonitor': 'Connect to a network to monitor',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Manage your Web3 projects',
    'projects.new': 'New Project',
    'projects.name': 'Project Name',
    'projects.description': 'Description',
    'projects.network': 'Network',
    'projects.created': 'Created at',
    'projects.contracts': 'Contracts',
    'projects.noProjects': 'No projects yet',
    'projects.createFirst': 'Create your first project to get started',
    
    // Contracts
    'contracts.title': 'Smart Contracts',
    'contracts.subtitle': 'Manage your Solidity contracts',
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
    'contracts.noContracts': 'No contracts yet',
    'contracts.createFirst': 'Create your first contract or use a template',
    
    // Templates
    'templates.title': 'Contract Templates',
    'templates.subtitle': 'Get started quickly with ready-made templates',
    'templates.erc20': 'ERC-20 Token',
    'templates.erc20Desc': 'Standard fungible token with mint, burn and transfer',
    'templates.erc721': 'ERC-721 NFT',
    'templates.erc721Desc': 'Non-fungible token for digital collectibles',
    'templates.erc1155': 'ERC-1155 Multi-Token',
    'templates.erc1155Desc': 'Hybrid token for fungibles and non-fungibles',
    'templates.use': 'Use Template',
    'templates.preview': 'Preview',
    
    // Deploy
    'deploy.title': 'Contract Deploy',
    'deploy.subtitle': 'Deploy your contracts to the blockchain',
    'deploy.selectContract': 'Select Contract',
    'deploy.selectNetwork': 'Select Network',
    'deploy.estimatedGas': 'Estimated Gas',
    'deploy.deployNow': 'Deploy Now',
    'deploy.deploying': 'Deploying...',
    'deploy.success': 'Deploy successful!',
    'deploy.error': 'Deploy error',
    'deploy.contractAddress': 'Contract Address',
    'deploy.txHash': 'Transaction Hash',
    'deploy.viewOnExplorer': 'View on Explorer',
    
    // Staking
    'staking.title': 'Staking',
    'staking.subtitle': 'Earn rewards by staking your tokens',
    'staking.stake': 'Stake',
    'staking.unstake': 'Unstake',
    'staking.claim': 'Claim Rewards',
    'staking.stakedAmount': 'Staked Amount',
    'staking.rewards': 'Rewards',
    'staking.pendingRewards': 'Pending Rewards',
    'staking.apy': 'APY',
    'staking.totalStaked': 'Total Staked',
    'staking.yourStake': 'Your Stake',
    'staking.amount': 'Amount',
    'staking.balance': 'Available Balance',
    'staking.connectWallet': 'Connect your wallet to stake',
    
    // NFT Marketplace
    'nft.title': 'NFT Marketplace',
    'nft.subtitle': 'Buy, sell and create NFTs',
    'nft.mint': 'Mint NFT',
    'nft.buy': 'Buy',
    'nft.sell': 'Sell',
    'nft.myNfts': 'My NFTs',
    'nft.allNfts': 'All NFTs',
    'nft.listed': 'For Sale',
    'nft.price': 'Price',
    'nft.owner': 'Owner',
    'nft.creator': 'Creator',
    'nft.tokenId': 'Token ID',
    'nft.collection': 'Collection',
    'nft.noNfts': 'No NFTs found',
    'nft.mintNew': 'Mint new NFT',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.subtitle': 'Blockchain transaction history',
    'transactions.hash': 'Hash',
    'transactions.from': 'From',
    'transactions.to': 'To',
    'transactions.value': 'Value',
    'transactions.gas': 'Gas',
    'transactions.gasUsed': 'Gas Used',
    'transactions.gasPrice': 'Gas Price',
    'transactions.status': 'Status',
    'transactions.confirmed': 'Confirmed',
    'transactions.pending': 'Pending',
    'transactions.failed': 'Failed',
    'transactions.block': 'Block',
    'transactions.timestamp': 'Timestamp',
    'transactions.noTransactions': 'No transactions found',
    
    // Gas Tracker
    'gas.title': 'Gas Tracker',
    'gas.subtitle': 'Real-time gas prices',
    'gas.slow': 'Slow',
    'gas.standard': 'Standard',
    'gas.fast': 'Fast',
    'gas.instant': 'Instant',
    'gas.gwei': 'Gwei',
    'gas.estimatedTime': 'Estimated Time',
    'gas.baseFee': 'Base Fee',
    'gas.priorityFee': 'Priority Fee',
    'gas.lastUpdate': 'Last Update',
    
    // Wallets
    'wallets.title': 'Wallets',
    'wallets.subtitle': 'Manage your Web3 wallets',
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
    'wallets.metamask': 'MetaMask',
    'wallets.walletconnect': 'WalletConnect',
    'wallets.selectWallet': 'Select a wallet',
    
    // Networks
    'networks.title': 'Blockchain Networks',
    'networks.subtitle': 'Networks supported by the platform',
    'networks.arcTestnet': 'Arc Testnet',
    'networks.sepolia': 'Ethereum Sepolia',
    'networks.ethereum': 'Ethereum Mainnet',
    'networks.polygon': 'Polygon',
    'networks.bsc': 'BSC',
    'networks.arbitrum': 'Arbitrum',
    'networks.chainId': 'Chain ID',
    'networks.rpc': 'RPC URL',
    'networks.explorer': 'Explorer',
    'networks.faucet': 'Faucet',
    'networks.gasToken': 'Gas Token',
    'networks.status': 'Status',
    'networks.active': 'Active',
    'networks.testnet': 'Testnet',
    'networks.mainnet': 'Mainnet',
    
    // Documentation
    'docs.title': 'Documentation',
    'docs.subtitle': 'Guides and references for developers',
    'docs.gettingStarted': 'Getting Started',
    'docs.tutorials': 'Tutorials',
    'docs.apiReference': 'API Reference',
    'docs.examples': 'Examples',
    'docs.faq': 'FAQ',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure your account and preferences',
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.save': 'Save Changes',
    
    // Security Scanner
    'security.title': 'Security Scanner',
    'security.subtitle': 'Contract vulnerability analysis',
    'security.scan': 'Scan',
    'security.scanning': 'Scanning...',
    'security.noIssues': 'No vulnerabilities found',
    'security.issuesFound': 'Vulnerabilities found',
    'security.critical': 'Critical',
    'security.high': 'High',
    'security.medium': 'Medium',
    'security.low': 'Low',
    'security.info': 'Info',
    'security.reentrancy': 'Reentrancy',
    'security.overflow': 'Overflow/Underflow',
    'security.accessControl': 'Access Control',
    'security.gasOptimization': 'Gas Optimization',
    
    // Debugger
    'debugger.title': 'Contract Debugger',
    'debugger.subtitle': 'Solidity contract debugging',
    'debugger.start': 'Start Debug',
    'debugger.stop': 'Stop',
    'debugger.stepOver': 'Step Over',
    'debugger.stepInto': 'Step Into',
    'debugger.stepOut': 'Step Out',
    'debugger.continue': 'Continue',
    'debugger.breakpoints': 'Breakpoints',
    'debugger.variables': 'Variables',
    'debugger.callStack': 'Call Stack',
    'debugger.console': 'Console',
    
    // Tutorial
    'tutorial.welcome': 'Welcome to Arc SafeWallet!',
    'tutorial.welcomeDesc': 'This is your complete Web3 development platform. Let\'s take a quick tour of the main features.',
    'tutorial.step1': 'Dashboard',
    'tutorial.step1Desc': 'Here you have an overview of all your projects, contracts and transactions.',
    'tutorial.step2': 'Projects',
    'tutorial.step2Desc': 'Organize your contracts into projects for better management.',
    'tutorial.step3': 'Editor',
    'tutorial.step3Desc': 'Write and edit your Solidity contracts with syntax highlighting.',
    'tutorial.step4': 'Deploy',
    'tutorial.step4Desc': 'Deploy your contracts to multiple blockchain networks.',
    'tutorial.step5': 'Security',
    'tutorial.step5Desc': 'Analyze your contracts for security vulnerabilities.',
    'tutorial.step6': 'Staking',
    'tutorial.step6Desc': 'Stake your tokens and earn rewards.',
    'tutorial.step7': 'NFT',
    'tutorial.step7Desc': 'Create, buy and sell NFTs in the integrated marketplace.',
    'tutorial.step8': 'Wallets',
    'tutorial.step8Desc': 'Connect your MetaMask or WalletConnect wallet.',
    'tutorial.next': 'Next',
    'tutorial.previous': 'Previous',
    'tutorial.skip': 'Skip Tutorial',
    'tutorial.finish': 'Finish',
    'tutorial.stepOf': 'Step {current} of {total}',
    'tutorial.complete': 'complete',
    
    // Error Messages
    'error.generic': 'An error occurred. Please try again.',
    'error.network': 'Connection error. Check your internet.',
    'error.wallet': 'Error connecting wallet.',
    'error.transaction': 'Transaction error.',
    'error.compile': 'Error compiling contract.',
    'error.deploy': 'Error deploying contract.',
    'error.notFound': 'Not found.',
    'error.unauthorized': 'Unauthorized.',
    'error.invalidAddress': 'Invalid address.',
    'error.insufficientFunds': 'Insufficient funds.',
    'error.gasEstimation': 'Error estimating gas.',
    
    // Success Messages
    'success.saved': 'Saved successfully!',
    'success.deployed': 'Deploy successful!',
    'success.compiled': 'Compiled successfully!',
    'success.connected': 'Wallet connected!',
    'success.disconnected': 'Wallet disconnected.',
    'success.copied': 'Copied to clipboard!',
    'success.staked': 'Stake successful!',
    'success.unstaked': 'Unstake successful!',
    'success.claimed': 'Rewards claimed!',
    'success.minted': 'NFT minted successfully!',
    'success.purchased': 'NFT purchased successfully!',
    'success.listed': 'NFT listed for sale!',
    
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
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.refresh': 'Refresh',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.remove': 'Remove',
    'common.add': 'Add',
    'common.select': 'Select',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.or': 'or',
    'common.and': 'and',
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
