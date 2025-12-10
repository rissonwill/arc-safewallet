import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Vault, 
  TrendingUp, 
  Clock, 
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { WalletAPI, NETWORKS } from '@/lib/walletApi';
import DashboardLayout from '@/components/DashboardLayout';

// ABI do ArcVault
const VAULT_ABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claimRewards()",
  "function emergencyWithdraw()",
  "function stakes(address) view returns (uint256 amount, uint256 rewardDebt, uint256 stakedAt, uint256 lastClaimAt)",
  "function totalStaked() view returns (uint256)",
  "function rewardPerSecond() view returns (uint256)",
  "function pendingRewards(address user) view returns (uint256)",
  "function currentAPY() view returns (uint256)",
  "function minStakePeriod() view returns (uint256)",
  "function earlyWithdrawFee() view returns (uint256)",
  "function stakingToken() view returns (address)",
  "function rewardToken() view returns (address)",
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

interface StakeInfo {
  amount: string;
  stakedAt: number;
  pendingRewards: string;
  canWithdrawWithoutFee: boolean;
}

interface VaultStats {
  totalStaked: string;
  apy: string;
  minStakePeriod: number;
  earlyWithdrawFee: number;
  tokenSymbol: string;
}

export default function Staking() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [vaultAddress, setVaultAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Verificar conexão
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

  const loadVaultData = useCallback(async () => {
    if (!vaultAddress || !account || !ethers.utils.isAddress(vaultAddress)) {
      return;
    }

    setIsLoading(true);
    try {
      const provider = await WalletAPI.getProvider();
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

      // Carregar estatísticas do vault
      const [totalStaked, apy, minPeriod, withdrawFee, stakingTokenAddr] = await Promise.all([
        vault.totalStaked(),
        vault.currentAPY(),
        vault.minStakePeriod(),
        vault.earlyWithdrawFee(),
        vault.stakingToken(),
      ]);

      // Carregar info do token
      const token = new ethers.Contract(stakingTokenAddr, TOKEN_ABI, provider);
      const [symbol, decimals, balance] = await Promise.all([
        token.symbol(),
        token.decimals(),
        token.balanceOf(account),
      ]);

      setTokenBalance(ethers.utils.formatUnits(balance, decimals));
      
      setVaultStats({
        totalStaked: ethers.utils.formatUnits(totalStaked, decimals),
        apy: (apy.toNumber() / 100).toFixed(2),
        minStakePeriod: minPeriod.toNumber(),
        earlyWithdrawFee: withdrawFee.toNumber() / 100,
        tokenSymbol: symbol,
      });

      // Carregar stake do usuário
      const [userStake, pending] = await Promise.all([
        vault.stakes(account),
        vault.pendingRewards(account),
      ]);

      const stakedAt = userStake.stakedAt.toNumber();
      const canWithdraw = stakedAt === 0 || (Date.now() / 1000) > (stakedAt + minPeriod.toNumber());

      setStakeInfo({
        amount: ethers.utils.formatUnits(userStake.amount, decimals),
        stakedAt: stakedAt,
        pendingRewards: ethers.utils.formatUnits(pending, decimals),
        canWithdrawWithoutFee: canWithdraw,
      });

    } catch (error: any) {
      console.error('Error loading vault:', error);
      toast.error('Erro ao carregar dados do vault');
    } finally {
      setIsLoading(false);
    }
  }, [vaultAddress, account]);

  useEffect(() => {
    if (vaultAddress && account) {
      loadVaultData();
    }
  }, [vaultAddress, account, loadVaultData]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    setIsStaking(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
      
      // Obter token de staking
      const stakingTokenAddr = await vault.stakingToken();
      const token = new ethers.Contract(stakingTokenAddr, TOKEN_ABI, signer);
      const decimals = await token.decimals();
      
      const amount = ethers.utils.parseUnits(stakeAmount, decimals);

      // Verificar allowance
      const allowance = await token.allowance(account, vaultAddress);
      if (allowance.lt(amount)) {
        toast.info('Aprovando tokens...');
        const approveTx = await token.approve(vaultAddress, ethers.constants.MaxUint256);
        await approveTx.wait();
        toast.success('Tokens aprovados!');
      }

      // Fazer stake
      toast.info('Fazendo stake...');
      const tx = await vault.stake(amount);
      await tx.wait();

      toast.success('Stake realizado com sucesso!');
      setStakeAmount('');
      loadVaultData();
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error.reason || error.message || 'Erro ao fazer stake');
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    setIsUnstaking(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
      
      const stakingTokenAddr = await vault.stakingToken();
      const token = new ethers.Contract(stakingTokenAddr, TOKEN_ABI, provider);
      const decimals = await token.decimals();
      
      const amount = ethers.utils.parseUnits(unstakeAmount, decimals);

      toast.info('Retirando stake...');
      const tx = await vault.unstake(amount);
      await tx.wait();

      toast.success('Unstake realizado com sucesso!');
      setUnstakeAmount('');
      loadVaultData();
    } catch (error: any) {
      console.error('Unstake error:', error);
      toast.error(error.reason || error.message || 'Erro ao fazer unstake');
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsClaiming(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);

      toast.info('Reivindicando recompensas...');
      const tx = await vault.claimRewards();
      await tx.wait();

      toast.success('Recompensas reivindicadas!');
      loadVaultData();
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error.reason || error.message || 'Erro ao reivindicar recompensas');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days} dias`;
    if (hours > 0) return `${hours} horas`;
    return `${Math.floor(seconds / 60)} minutos`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
              Staking Vault
            </h1>
            <p className="text-muted-foreground mt-1">
              Faça stake dos seus tokens e ganhe recompensas
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

        {/* Vault Address Input */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vault className="w-5 h-5 text-cyan-400" />
              Endereço do Vault
            </CardTitle>
            <CardDescription>
              Insira o endereço do contrato ArcVault para interagir
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="0x..."
              value={vaultAddress}
              onChange={(e) => setVaultAddress(e.target.value)}
              className="font-mono flex-1"
            />
            <Button 
              onClick={loadVaultData} 
              disabled={!vaultAddress || isLoading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Carregar
            </Button>
          </CardContent>
        </Card>

        {vaultStats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="text-2xl font-bold text-cyan-400">{vaultStats.apy}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/20">
                      <Coins className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Staked</p>
                      <p className="text-2xl font-bold">{parseFloat(vaultStats.totalStaked).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Gift className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Suas Recompensas</p>
                      <p className="text-2xl font-bold text-green-400">
                        {stakeInfo ? parseFloat(stakeInfo.pendingRewards).toFixed(4) : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Período Mínimo</p>
                      <p className="text-2xl font-bold">{formatDuration(vaultStats.minStakePeriod)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staking Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stake */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                    Stake
                  </CardTitle>
                  <CardDescription>
                    Deposite seus tokens para ganhar recompensas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Quantidade</Label>
                      <span className="text-muted-foreground">
                        Saldo: {parseFloat(tokenBalance).toFixed(4)} {vaultStats.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setStakeAmount(tokenBalance)}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleStake}
                    disabled={!isConnected || isStaking || !stakeAmount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {isStaking ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                    )}
                    {isStaking ? 'Fazendo Stake...' : 'Stake'}
                  </Button>
                </CardContent>
              </Card>

              {/* Unstake */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                    Unstake
                  </CardTitle>
                  <CardDescription>
                    Retire seus tokens do stake
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Quantidade</Label>
                      <span className="text-muted-foreground">
                        Em stake: {stakeInfo ? parseFloat(stakeInfo.amount).toFixed(4) : '0'} {vaultStats.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setUnstakeAmount(stakeInfo?.amount || '0')}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  {stakeInfo && !stakeInfo.canWithdrawWithoutFee && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-500">
                        Taxa de saída antecipada: {vaultStats.earlyWithdrawFee}%
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleUnstake}
                    disabled={!isConnected || isUnstaking || !unstakeAmount}
                    className="w-full"
                    variant="destructive"
                  >
                    {isUnstaking ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                    )}
                    {isUnstaking ? 'Retirando...' : 'Unstake'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Claim Rewards */}
            {stakeInfo && parseFloat(stakeInfo.pendingRewards) > 0 && (
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-500/20">
                        <Gift className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recompensas Disponíveis</p>
                        <p className="text-3xl font-bold text-green-400">
                          {parseFloat(stakeInfo.pendingRewards).toFixed(6)} {vaultStats.tokenSymbol}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleClaimRewards}
                      disabled={isClaiming}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      {isClaiming ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      {isClaiming ? 'Reivindicando...' : 'Reivindicar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!vaultStats && !isLoading && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <Vault className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Vault Carregado</h3>
              <p className="text-muted-foreground">
                Insira o endereço de um contrato ArcVault para começar a fazer stake
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
