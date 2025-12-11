// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title ArcGovernance
 * @author @smartcript
 * @notice Contrato de Governança DAO para o ecossistema Arc SafeWallet
 * @dev Implementa governança on-chain com votação baseada em tokens ARC
 * 
 * Funcionalidades:
 * - Criação de propostas por holders de ARC
 * - Votação com peso baseado em tokens
 * - Quorum configurável (4% por padrão)
 * - Timelock para execução de propostas
 * - Suporte a propostas de texto e execução de contratos
 */
contract ArcGovernance is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction,
    GovernorTimelockControl 
{
    // Eventos customizados
    event ProposalCreatedWithDescription(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description
    );

    // Mapeamento de metadados das propostas
    mapping(uint256 => ProposalMetadata) public proposalMetadata;

    struct ProposalMetadata {
        string title;
        string description;
        string category; // "treasury", "protocol", "community", "emergency"
        address proposer;
        uint256 createdAt;
    }

    /**
     * @notice Construtor do contrato de governança
     * @param _token Endereço do token de votação (ArcToken com ERC20Votes)
     * @param _timelock Endereço do contrato TimelockController
     * @param _votingDelay Delay antes de iniciar votação (em blocos)
     * @param _votingPeriod Duração da votação (em blocos)
     * @param _proposalThreshold Mínimo de tokens para criar proposta
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    )
        Governor("Arc SafeWallet Governance")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    /**
     * @notice Cria uma proposta com metadados adicionais
     * @param targets Endereços dos contratos a serem chamados
     * @param values Valores em ETH a serem enviados
     * @param calldatas Dados das chamadas
     * @param title Título da proposta
     * @param description Descrição detalhada
     * @param category Categoria da proposta
     */
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory category
    ) public returns (uint256) {
        string memory fullDescription = string(abi.encodePacked(title, "\n\n", description));
        uint256 proposalId = propose(targets, values, calldatas, fullDescription);
        
        proposalMetadata[proposalId] = ProposalMetadata({
            title: title,
            description: description,
            category: category,
            proposer: msg.sender,
            createdAt: block.timestamp
        });

        emit ProposalCreatedWithDescription(proposalId, msg.sender, title, description);
        
        return proposalId;
    }

    /**
     * @notice Retorna os metadados de uma proposta
     * @param proposalId ID da proposta
     */
    function getProposalMetadata(uint256 proposalId) 
        public 
        view 
        returns (
            string memory title,
            string memory description,
            string memory category,
            address proposer,
            uint256 createdAt
        ) 
    {
        ProposalMetadata memory meta = proposalMetadata[proposalId];
        return (meta.title, meta.description, meta.category, meta.proposer, meta.createdAt);
    }

    // ==================== OVERRIDES NECESSÁRIOS ====================

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
