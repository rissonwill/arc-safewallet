import { useState, useEffect } from 'react';
import { ethers, isAddress, parseUnits, getCreateAddress } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Copy, 
  ExternalLink,
  Coins,
  Image,
  Store,
  Vault,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { WalletAPI, NETWORKS } from '@/lib/walletApi';
import DashboardLayout from '@/components/DashboardLayout';
import { CONTRACT_ARTIFACTS, getContractArtifact } from '@/lib/contractBytecodes';

// ABIs simplificados para deploy
const CONTRACT_BYTECODES = {
  ArcToken: {
    name: 'ArcToken',
    description: 'Token ERC20 customizado com mint/burn e sistema de minters',
    icon: Coins,
    features: ['ERC20 Standard', 'Mintable', 'Burnable', 'Minter Roles'],
    // Bytecode será carregado do servidor ou compilado
    abi: [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)",
      "function burn(uint256 amount)",
      "function addMinter(address minter)",
      "function removeMinter(address minter)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ],
  },
  ArcNFT: {
    name: 'ArcNFT',
    description: 'Coleção NFT ERC721 com mint público e royalties',
    icon: Image,
    features: ['ERC721 Standard', 'Public Mint', 'Royalties', 'Metadata URI'],
    abi: [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function mint(string memory uri) payable returns (uint256)",
      "function mintPrice() view returns (uint256)",
      "function toggleMinting()",
      "event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
    ],
  },
  ArcMarketplace: {
    name: 'ArcMarketplace',
    description: 'Marketplace para compra e venda de NFTs',
    icon: Store,
    features: ['List NFTs', 'Buy/Sell', 'Marketplace Fee', 'Multi-Collection'],
    abi: [
      "constructor()",
      "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
      "function buyNFT(uint256 listingId) payable",
      "function cancelListing(uint256 listingId)",
      "function listings(uint256) view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt)",
      "function marketplaceFee() view returns (uint256)",
      "event Listed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)",
      "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price, uint256 fee)",
    ],
  },
  ArcVault: {
    name: 'ArcVault',
    description: 'Vault de Staking com recompensas automáticas',
    icon: Vault,
    features: ['Staking', 'Auto-Rewards', 'APY Display', 'Early Withdraw Fee'],
    requiresParams: true,
    params: [
      { name: 'stakingToken', type: 'address', label: 'Token de Staking', placeholder: '0x...' },
      { name: 'rewardToken', type: 'address', label: 'Token de Recompensa', placeholder: '0x...' },
    ],
    abi: [
      "constructor(address _stakingToken, address _rewardToken)",
      "function stake(uint256 amount)",
      "function unstake(uint256 amount)",
      "function claimRewards()",
      "function stakes(address) view returns (uint256 amount, uint256 rewardDebt, uint256 stakedAt, uint256 lastClaimAt)",
      "function totalStaked() view returns (uint256)",
      "function pendingRewards(address user) view returns (uint256)",
      "function currentAPY() view returns (uint256)",
      "event Staked(address indexed user, uint256 amount)",
      "event RewardClaimed(address indexed user, uint256 amount)",
    ],
  },
};

type ContractKey = keyof typeof CONTRACT_BYTECODES;
type NetworkKey = 'arcTestnet' | 'sepolia';

interface DeployedContract {
  name: string;
  address: string;
  network: NetworkKey;
  txHash: string;
  timestamp: number;
}

export default function Deploy() {
  const [selectedContract, setSelectedContract] = useState<ContractKey>('ArcToken');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>('arcTestnet');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [vaultParams, setVaultParams] = useState({
    stakingToken: '',
    rewardToken: '',
  });

  // Carregar contratos deployados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deployedContracts');
    if (saved) {
      setDeployedContracts(JSON.parse(saved));
    }
  }, []);

  // Verificar conexão da carteira
  useEffect(() => {
    const checkConnection = async () => {
      const state = WalletAPI.getWalletState();
      setIsConnected(state.isConnected);
      setAccount(state.account);
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const account = await WalletAPI.connectWallet();
      setIsConnected(true);
      setAccount(account);
      toast.success('Carteira conectada!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const switchNetwork = async (network: NetworkKey) => {
    try {
      await WalletAPI.switchNetwork(network);
      setSelectedNetwork(network);
      toast.success(`Rede alterada para ${NETWORKS[network].chainName}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deployContract = async () => {
    if (!isConnected || !account) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    const contract = CONTRACT_BYTECODES[selectedContract];
    
    // Validar parâmetros do Vault
    if (selectedContract === 'ArcVault') {
      if (!vaultParams.stakingToken || !vaultParams.rewardToken) {
        toast.error('Preencha os endereços dos tokens para o Vault');
        return;
      }
      if (!isAddress(vaultParams.stakingToken) || !isAddress(vaultParams.rewardToken)) {
        toast.error('Endereços de token inválidos');
        return;
      }
    }

    setIsDeploying(true);
    setDeployProgress(10);

    try {
      // Obter provider e signer
      const provider = await WalletAPI.getProvider();
      const signer = await provider.getSigner();
      
      setDeployProgress(20);
      toast.info('Preparando deploy...');

      // Obter bytecode real do artefato compilado
      const artifact = getContractArtifact(selectedContract as keyof typeof CONTRACT_ARTIFACTS);
      if (!artifact || !artifact.bytecode) {
        throw new Error('Bytecode não encontrado. Compile o contrato primeiro.');
      }
      
      setDeployProgress(30);
      const network = NETWORKS[selectedNetwork];
      
      // Verificar saldo
      const balance = await provider.getBalance(account);
      const minBalance = parseUnits('0.01', network.nativeCurrency.decimals);
      
      if (balance < minBalance) {
        throw new Error(`Saldo insuficiente. Você precisa de pelo menos 0.01 ${network.nativeCurrency.symbol} para deploy. Use o faucet: ${network.faucetUrl}`);
      }

      setDeployProgress(40);
      toast.info('Aguardando confirmação na carteira...');

      // Deploy real usando ContractFactory
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
      
      let deployedContract;
      if (selectedContract === 'ArcVault') {
        // Vault precisa de parâmetros
        deployedContract = await factory.deploy(vaultParams.stakingToken, vaultParams.rewardToken);
      } else {
        // Outros contratos não precisam de parâmetros
        deployedContract = await factory.deploy();
      }

      setDeployProgress(60);
      toast.info('Aguardando confirmação na blockchain...');

      // Aguardar confirmação
      await deployedContract.waitForDeployment();
      const contractAddress = await deployedContract.getAddress();
      const deployTx = deployedContract.deploymentTransaction();

      setDeployProgress(100);

      // Salvar contrato deployado
      const newContract: DeployedContract = {
        name: contract.name,
        address: contractAddress,
        network: selectedNetwork,
        txHash: deployTx?.hash || '',
        timestamp: Date.now(),
      };

      const updatedContracts = [newContract, ...deployedContracts];
      setDeployedContracts(updatedContracts);
      localStorage.setItem('deployedContracts', JSON.stringify(updatedContracts));

      toast.success(`${contract.name} deployado com sucesso em ${contractAddress.slice(0, 10)}...`);
      
    } catch (error: any) {
      console.error('Deploy error:', error);
      toast.error(error.message || 'Erro ao fazer deploy');
    } finally {
      setIsDeploying(false);
      setDeployProgress(0);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Endereço copiado!');
  };

  const openExplorer = (address: string, network: NetworkKey) => {
    const explorerUrl = NETWORKS[network].blockExplorerUrls[0];
    window.open(`${explorerUrl}/address/${address}`, '_blank');
  };

  const ContractIcon = CONTRACT_BYTECODES[selectedContract].icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
              Deploy de Contratos
            </h1>
            <p className="text-muted-foreground mt-1">
              Faça deploy dos seus Smart Contracts na SmartVault Network ou Sepolia
            </p>
          </div>
          
          {!isConnected ? (
            <Button onClick={connectWallet} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
              <Wallet className="w-4 h-4 mr-2" />
              Conectar Carteira
            </Button>
          ) : (
            <Badge variant="outline" className="px-4 py-2 border-cyan-500/50">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {WalletAPI.shortenAddress(account || '')}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="deploy" className="space-y-6">
          <TabsList className="bg-background/50 border border-border/50">
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Seleção de Contrato */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-cyan-400" />
                      Selecionar Contrato
                    </CardTitle>
                    <CardDescription>
                      Escolha o contrato que deseja fazer deploy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(Object.keys(CONTRACT_BYTECODES) as ContractKey[]).map((key) => {
                        const contract = CONTRACT_BYTECODES[key];
                        const Icon = contract.icon;
                        const isSelected = selectedContract === key;
                        
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedContract(key)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-cyan-500 bg-cyan-500/10' 
                                : 'border-border/50 hover:border-cyan-500/50 bg-background/50'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                p-2 rounded-lg
                                ${isSelected ? 'bg-cyan-500/20' : 'bg-muted'}
                              `}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{contract.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {contract.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {contract.features.slice(0, 2).map((feature) => (
                                    <Badge key={feature} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Parâmetros do Vault */}
                {selectedContract === 'ArcVault' && (
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle>Parâmetros do Vault</CardTitle>
                      <CardDescription>
                        Configure os tokens de staking e recompensa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Token de Staking</Label>
                        <Input
                          placeholder="0x..."
                          value={vaultParams.stakingToken}
                          onChange={(e) => setVaultParams(prev => ({ ...prev, stakingToken: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Token de Recompensa</Label>
                        <Input
                          placeholder="0x..."
                          value={vaultParams.rewardToken}
                          onChange={(e) => setVaultParams(prev => ({ ...prev, rewardToken: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Painel de Deploy */}
              <div className="space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Configuração de Deploy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rede</Label>
                      <Select value={selectedNetwork} onValueChange={(v) => switchNetwork(v as NetworkKey)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arcTestnet">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                              Arc Testnet
                            </div>
                          </SelectItem>
                          <SelectItem value="sepolia">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full" />
                              Sepolia
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chain ID</span>
                        <span className="font-mono">{NETWORKS[selectedNetwork].chainIdDecimal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gas Token</span>
                        <span>{NETWORKS[selectedNetwork].nativeCurrency.symbol}</span>
                      </div>
                    </div>

                    {isDeploying && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{deployProgress}%</span>
                        </div>
                        <Progress value={deployProgress} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={deployContract}
                      disabled={!isConnected || isDeploying}
                      className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Fazendo Deploy...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Deploy {CONTRACT_BYTECODES[selectedContract].name}
                        </>
                      )}
                    </Button>

                    {!isConnected && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-500">
                          Conecte sua carteira para fazer deploy
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Faucet Info */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Precisa de tokens de teste?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(NETWORKS[selectedNetwork].faucetUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Faucet
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Contratos Deployados</CardTitle>
                <CardDescription>
                  Histórico de contratos que você fez deploy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deployedContracts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum contrato deployado ainda</p>
                    <p className="text-sm">Faça seu primeiro deploy na aba "Deploy"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deployedContracts.map((contract, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border/50 bg-background/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{contract.name}</h4>
                              <p className="text-sm text-muted-foreground font-mono">
                                {WalletAPI.shortenAddress(contract.address)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {NETWORKS[contract.network].chainName}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyAddress(contract.address)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openExplorer(contract.address, contract.network)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(contract.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
