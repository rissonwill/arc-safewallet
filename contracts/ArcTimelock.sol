// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title ArcTimelock
 * @author @smartcript
 * @notice Contrato Timelock para execução segura de propostas de governança
 * @dev Implementa delay obrigatório entre aprovação e execução de propostas
 */
contract ArcTimelock is TimelockController {
    /**
     * @notice Construtor do Timelock
     * @param minDelay Delay mínimo em segundos (ex: 1 dia = 86400)
     * @param proposers Lista de endereços que podem propor (geralmente o Governor)
     * @param executors Lista de endereços que podem executar (address(0) = qualquer um)
     * @param admin Endereço do administrador (pode ser address(0) para renunciar)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
