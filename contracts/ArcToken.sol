// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcToken
 * @dev Token ERC20 customizado para Arc Network
 */
contract ArcToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 milhão de tokens
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("Arc Token", "ARC") Ownable(msg.sender) {
        // Mint inicial para o owner
        _mint(msg.sender, 100000 * 10**18); // 100k tokens
    }
    
    /**
     * @dev Adiciona um endereço como minter autorizado
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove um minter autorizado
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint de novos tokens (apenas minters autorizados ou owner)
     */
    function mint(address to, uint256 amount) external {
        require(
            minters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Max supply exceeded"
        );
        _mint(to, amount);
    }
    
    /**
     * @dev Burn de tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
