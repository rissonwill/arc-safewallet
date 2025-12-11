import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACTS, GOVERNANCE_CONFIG } from '@/lib/contractAddresses';

// ABI simplificado do ArcGovernance
const GOVERNANCE_ABI = [
  // Leitura
  'function name() view returns (string)',
  'function proposalThreshold() view returns (uint256)',
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function quorum(uint256 blockNumber) view returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)',
  'function hasVoted(uint256 proposalId, address account) view returns (bool)',
  'function getVotes(address account, uint256 blockNumber) view returns (uint256)',
  
  // Escrita
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)',
  'function queue(uint256 proposalId) returns (uint256)',
  'function execute(uint256 proposalId) returns (uint256)',
  
  // Eventos
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
  'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
];

// ABI simplificado do ArcToken (para votação)
const TOKEN_ABI = [
  'function delegate(address delegatee)',
  'function delegates(address account) view returns (address)',
  'function getVotes(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

// Estados da proposta
export const ProposalState = {
  Pending: 0,
  Active: 1,
  Canceled: 2,
  Defeated: 3,
  Succeeded: 4,
  Queued: 5,
  Expired: 6,
  Executed: 7,
} as const;

export const ProposalStateLabels: Record<number, string> = {
  0: 'Pendente',
  1: 'Votação Ativa',
  2: 'Cancelada',
  3: 'Rejeitada',
  4: 'Aprovada',
  5: 'Na Fila',
  6: 'Expirada',
  7: 'Executada',
};

export interface ProposalVotes {
  againstVotes: bigint;
  forVotes: bigint;
  abstainVotes: bigint;
}

export function useGovernance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obter provider e signer
  const getProviderAndSigner = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask não encontrada');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    
    if (Number(network.chainId) !== 11155111) {
      throw new Error('Por favor, conecte-se à rede Sepolia');
    }
    
    return { provider, signer };
  }, []);

  // Obter contrato de governança
  const getGovernanceContract = useCallback(async (withSigner = false) => {
    const { provider, signer } = await getProviderAndSigner();
    return new ethers.Contract(
      SEPOLIA_CONTRACTS.ArcGovernance,
      GOVERNANCE_ABI,
      withSigner ? signer : provider
    );
  }, [getProviderAndSigner]);

  // Obter contrato do token
  const getTokenContract = useCallback(async (withSigner = false) => {
    const { provider, signer } = await getProviderAndSigner();
    return new ethers.Contract(
      SEPOLIA_CONTRACTS.ArcToken,
      TOKEN_ABI,
      withSigner ? signer : provider
    );
  }, [getProviderAndSigner]);

  // Delegar votos
  const delegateVotes = useCallback(async (delegatee: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getTokenContract(true);
      const tx = await token.delegate(delegatee);
      await tx.wait();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getTokenContract]);

  // Auto-delegar (delegar para si mesmo)
  const selfDelegate = useCallback(async () => {
    const { signer } = await getProviderAndSigner();
    const address = await signer.getAddress();
    return delegateVotes(address);
  }, [delegateVotes, getProviderAndSigner]);

  // Obter poder de voto
  const getVotingPower = useCallback(async (address: string) => {
    const token = await getTokenContract();
    const votes = await token.getVotes(address);
    return ethers.formatEther(votes);
  }, [getTokenContract]);

  // Obter estado da proposta
  const getProposalState = useCallback(async (proposalId: string) => {
    const governance = await getGovernanceContract();
    const state = await governance.state(proposalId);
    return Number(state);
  }, [getGovernanceContract]);

  // Obter votos da proposta
  const getProposalVotes = useCallback(async (proposalId: string): Promise<ProposalVotes> => {
    const governance = await getGovernanceContract();
    const [againstVotes, forVotes, abstainVotes] = await governance.proposalVotes(proposalId);
    return { againstVotes, forVotes, abstainVotes };
  }, [getGovernanceContract]);

  // Verificar se já votou
  const hasVoted = useCallback(async (proposalId: string, address: string) => {
    const governance = await getGovernanceContract();
    return governance.hasVoted(proposalId, address);
  }, [getGovernanceContract]);

  // Votar em proposta
  const castVote = useCallback(async (proposalId: string, support: 0 | 1 | 2, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const governance = await getGovernanceContract(true);
      let tx;
      if (reason) {
        tx = await governance.castVoteWithReason(proposalId, support, reason);
      } else {
        tx = await governance.castVote(proposalId, support);
      }
      await tx.wait();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getGovernanceContract]);

  // Criar proposta
  const createProposal = useCallback(async (
    targets: string[],
    values: bigint[],
    calldatas: string[],
    description: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const governance = await getGovernanceContract(true);
      const tx = await governance.propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      
      // Extrair proposalId do evento
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = governance.interface.parseLog(log);
          return parsed?.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = governance.interface.parseLog(event);
        return parsed?.args?.proposalId?.toString();
      }
      
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getGovernanceContract]);

  // Colocar proposta na fila do Timelock
  const queueProposal = useCallback(async (proposalId: string) => {
    setLoading(true);
    setError(null);
    try {
      const governance = await getGovernanceContract(true);
      const tx = await governance.queue(proposalId);
      await tx.wait();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getGovernanceContract]);

  // Executar proposta
  const executeProposal = useCallback(async (proposalId: string) => {
    setLoading(true);
    setError(null);
    try {
      const governance = await getGovernanceContract(true);
      const tx = await governance.execute(proposalId);
      await tx.wait();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getGovernanceContract]);

  return {
    loading,
    error,
    config: GOVERNANCE_CONFIG,
    contracts: SEPOLIA_CONTRACTS,
    // Delegação
    delegateVotes,
    selfDelegate,
    getVotingPower,
    // Propostas
    getProposalState,
    getProposalVotes,
    hasVoted,
    castVote,
    createProposal,
    queueProposal,
    executeProposal,
    // Helpers
    ProposalState,
    ProposalStateLabels,
  };
}
