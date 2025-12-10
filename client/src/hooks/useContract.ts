// src/hooks/useContract.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers, formatUnits, parseUnits, isAddress } from 'ethers';

// ABIs dos contratos (serão gerados após o deploy)
// Por enquanto, usando ABIs mínimas para tipagem
const ArcTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function owner() view returns (address)",
  "function minters(address) view returns (bool)",
  "function addMinter(address minter)",
  "function removeMinter(address minter)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event MinterAdded(address indexed minter)",
  "event MinterRemoved(address indexed minter)",
];

const ArcNFTABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function mint(string memory uri) payable returns (uint256)",
  "function mintForAddress(address to, string memory uri) returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function maxMintPerWallet() view returns (uint256)",
  "function mintedPerWallet(address) view returns (uint256)",
  "function isMintingActive() view returns (bool)",
  "function toggleMinting()",
  "function setMintPrice(uint256 newPrice)",
  "function withdraw()",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const ArcMarketplaceABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
  "function buyNFT(uint256 listingId) payable",
  "function cancelListing(uint256 listingId)",
  "function updatePrice(uint256 listingId, uint256 newPrice)",
  "function listings(uint256) view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt)",
  "function listingCount() view returns (uint256)",
  "function marketplaceFee() view returns (uint256)",
  "function getActiveListings(uint256 offset, uint256 limit) view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt)[])",
  "function getSellerListings(address seller) view returns (uint256[])",
  "event Listed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price, uint256 fee)",
  "event ListingCancelled(uint256 indexed listingId)",
];

const ArcVaultABI = [
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
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount, uint256 fee)",
  "event RewardClaimed(address indexed user, uint256 amount)",
];

// Endereços dos contratos (atualizar após deploy)
export const CONTRACTS = {
  arcTestnet: {
    ArcToken: '0x0000000000000000000000000000000000000000', // Atualizar após deploy
    ArcNFT: '0x0000000000000000000000000000000000000000',
    ArcMarketplace: '0x0000000000000000000000000000000000000000',
    ArcVault: '0x0000000000000000000000000000000000000000',
  },
  sepolia: {
    ArcToken: '0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC',
    ArcNFT: '0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7',
    ArcMarketplace: '0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2',
    ArcVault: '0xBE21597B385F299CbBF71725823A5E1aD810973f',
  },
};

export type NetworkKey = 'arcTestnet' | 'sepolia';
export type ContractName = 'ArcToken' | 'ArcNFT' | 'ArcMarketplace' | 'ArcVault';

const ABIS: Record<ContractName, string[]> = {
  ArcToken: ArcTokenABI,
  ArcNFT: ArcNFTABI,
  ArcMarketplace: ArcMarketplaceABI,
  ArcVault: ArcVaultABI,
};

/**
 * Hook genérico para carregar um contrato
 */
export const useContract = (
  contractName: ContractName,
  network: NetworkKey,
  provider?: ethers.BrowserProvider
) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;

    const loadContract = async () => {
      try {
        setLoading(true);
      const address = CONTRACTS[network][contractName];
      
      if (address === '0x0000000000000000000000000000000000000000') {
        setError('Contrato ainda não foi deployado nesta rede');
        setLoading(false);
        return;
      }
      
      const abi = ABIS[contractName];
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(address, abi, signer);
      
      setContract(contractInstance);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadContract();
  }, [contractName, network, provider]);

  return { contract, loading, error };
};

/**
 * Hook específico para ArcToken
 */
export const useArcToken = (
  network: NetworkKey,
  provider?: ethers.BrowserProvider
) => {
  const { contract, loading: contractLoading, error: contractError } = useContract('ArcToken', network, provider);
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async (address: string) => {
    if (!contract) return '0';
    
    try {
      setLoading(true);
      const bal = await contract.balanceOf(address);
      const formatted = formatUnits(bal);
      setBalance(formatted);
      return formatted;
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getTotalSupply = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const supply = await contract.totalSupply();
      const formatted = formatUnits(supply);
      setTotalSupply(formatted);
      return formatted;
    } catch (error) {
      console.error('Error getting total supply:', error);
      return '0';
    }
  }, [contract]);

  const transfer = useCallback(async (to: string, amount: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const value = parseUnits(amount);
      const tx = await contract.transfer(to, value);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const mint = useCallback(async (to: string, amount: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const value = parseUnits(amount);
      const tx = await contract.mint(to, value);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const burn = useCallback(async (amount: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const value = parseUnits(amount);
      const tx = await contract.burn(value);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    contract,
    balance,
    totalSupply,
    loading: contractLoading || loading,
    error: contractError,
    getBalance,
    getTotalSupply,
    transfer,
    mint,
    burn,
  };
};

/**
 * Hook específico para ArcNFT
 */
export const useArcNFT = (
  network: NetworkKey,
  provider?: ethers.BrowserProvider
) => {
  const { contract, loading: contractLoading, error: contractError } = useContract('ArcNFT', network, provider);
  const [nfts, setNfts] = useState<any[]>([]);
  const [totalSupply, setTotalSupply] = useState('0');
  const [mintPrice, setMintPrice] = useState('0');
  const [loading, setLoading] = useState(false);

  const getTotalSupply = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const supply = await contract.totalMinted();
      setTotalSupply(supply.toString());
      return supply.toString();
    } catch (error) {
      console.error('Error getting total supply:', error);
      return '0';
    }
  }, [contract]);

  const getMintPrice = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const price = await contract.mintPrice();
      const formatted = formatUnits(price);
      setMintPrice(formatted);
      return formatted;
    } catch (error) {
      console.error('Error getting mint price:', error);
      return '0';
    }
  }, [contract]);

  const getUserNFTs = useCallback(async (address: string) => {
    if (!contract) return [];
    
    try {
      setLoading(true);
      const balance = await contract.balanceOf(address);
      const nftList = [];
      
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        nftList.push({
          tokenId: tokenId.toString(),
          tokenURI,
        });
      }
      
      setNfts(nftList);
      return nftList;
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const mint = useCallback(async (tokenURI: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const price = await contract.mintPrice();
      const tx = await contract.mint(tokenURI, { value: price });
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    contract,
    nfts,
    totalSupply,
    mintPrice,
    loading: contractLoading || loading,
    error: contractError,
    getTotalSupply,
    getMintPrice,
    getUserNFTs,
    mint,
  };
};

/**
 * Hook específico para ArcVault
 */
export const useArcVault = (
  network: NetworkKey,
  provider?: ethers.BrowserProvider
) => {
  const { contract, loading: contractLoading, error: contractError } = useContract('ArcVault', network, provider);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [pendingRewards, setPendingRewards] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [apy, setApy] = useState('0');
  const [loading, setLoading] = useState(false);

  const getStakeInfo = useCallback(async (address: string) => {
    if (!contract) return null;
    
    try {
      const info = await contract.stakes(address);
      const stakeData = {
        amount: formatUnits(info.amount),
        rewardDebt: formatUnits(info.rewardDebt),
        stakedAt: info.stakedAt.toNumber(),
        lastClaimAt: info.lastClaimAt.toNumber(),
      };
      setStakeInfo(stakeData);
      return stakeData;
    } catch (error) {
      console.error('Error getting stake info:', error);
      return null;
    }
  }, [contract]);

  const getPendingRewards = useCallback(async (address: string) => {
    if (!contract) return '0';
    
    try {
      const rewards = await contract.pendingRewards(address);
      const formatted = formatUnits(rewards);
      setPendingRewards(formatted);
      return formatted;
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      return '0';
    }
  }, [contract]);

  const getTotalStaked = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const total = await contract.totalStaked();
      const formatted = formatUnits(total);
      setTotalStaked(formatted);
      return formatted;
    } catch (error) {
      console.error('Error getting total staked:', error);
      return '0';
    }
  }, [contract]);

  const getCurrentAPY = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const apyBps = await contract.currentAPY();
      const apyPercent = (apyBps.toNumber() / 100).toFixed(2);
      setApy(apyPercent);
      return apyPercent;
    } catch (error) {
      console.error('Error getting APY:', error);
      return '0';
    }
  }, [contract]);

  const stake = useCallback(async (amount: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const value = parseUnits(amount);
      const tx = await contract.stake(value);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const unstake = useCallback(async (amount: string) => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const value = parseUnits(amount);
      const tx = await contract.unstake(value);
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const claimRewards = useCallback(async () => {
    if (!contract) throw new Error('Contract not loaded');
    
    try {
      setLoading(true);
      const tx = await contract.claimRewards();
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    contract,
    stakeInfo,
    pendingRewards,
    totalStaked,
    apy,
    loading: contractLoading || loading,
    error: contractError,
    getStakeInfo,
    getPendingRewards,
    getTotalStaked,
    getCurrentAPY,
    stake,
    unstake,
    claimRewards,
  };
};

export default useContract;
