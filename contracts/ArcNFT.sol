// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcNFT
 * @dev NFT Collection para Arc Network
 */
contract ArcNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _tokenIds;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.01 ether; // Ajustar para USDC na Arc
    bool public isMintingActive = true;
    
    mapping(address => uint256) public mintedPerWallet;
    uint256 public maxMintPerWallet = 10;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintingToggled(bool isActive);
    event MintPriceUpdated(uint256 newPrice);
    
    constructor() ERC721("Arc NFT Collection", "ARCNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint de um NFT
     */
    function mint(string memory uri) external payable returns (uint256) {
        require(isMintingActive, "Minting is not active");
        require(_tokenIds < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(
            mintedPerWallet[msg.sender] < maxMintPerWallet,
            "Max mint per wallet reached"
        );
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        mintedPerWallet[msg.sender]++;
        
        emit NFTMinted(msg.sender, newTokenId, uri);
        
        return newTokenId;
    }
    
    /**
     * @dev Mint gratuito pelo owner (airdrops)
     */
    function mintForAddress(address to, string memory uri) external onlyOwner returns (uint256) {
        require(_tokenIds < MAX_SUPPLY, "Max supply reached");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        emit NFTMinted(to, newTokenId, uri);
        
        return newTokenId;
    }
    
    /**
     * @dev Ativar/Desativar minting
     */
    function toggleMinting() external onlyOwner {
        isMintingActive = !isMintingActive;
        emit MintingToggled(isMintingActive);
    }
    
    /**
     * @dev Atualizar preço de mint
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @dev Atualizar limite de mint por wallet
     */
    function setMaxMintPerWallet(uint256 newMax) external onlyOwner {
        maxMintPerWallet = newMax;
    }
    
    /**
     * @dev Retirar fundos
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Total de tokens mintados
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIds;
    }
    
    // Overrides necessários para ERC721Enumerable e ERC721URIStorage
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
