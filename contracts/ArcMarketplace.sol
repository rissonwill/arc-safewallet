// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcMarketplace
 * @dev Marketplace simples para NFTs na Arc Network
 */
contract ArcMarketplace is Ownable, ReentrancyGuard {
    
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 createdAt;
    }
    
    // Mapping de listingId para Listing
    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;
    
    // Taxa do marketplace (em basis points, 250 = 2.5%)
    uint256 public marketplaceFee = 250;
    uint256 public constant MAX_FEE = 1000; // 10% máximo
    
    // Token de pagamento (USDC na Arc Network)
    IERC20 public paymentToken;
    bool public useNativeToken = true; // Se true, usa ETH/USDC nativo
    
    // Eventos
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    event Sale(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 fee
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event PriceUpdated(uint256 indexed listingId, uint256 newPrice);
    event FeeUpdated(uint256 newFee);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Listar um NFT para venda
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listingCount++;
        
        listings[listingCount] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit Listed(listingCount, msg.sender, nftContract, tokenId, price);
        
        return listingCount;
    }
    
    /**
     * @dev Comprar um NFT listado
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        
        uint256 price = listing.price;
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        if (useNativeToken) {
            require(msg.value >= price, "Insufficient payment");
            
            // Transferir para o vendedor
            payable(listing.seller).transfer(sellerAmount);
            
            // Taxa fica no contrato
            
            // Devolver excesso
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
        } else {
            require(
                paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount),
                "Payment to seller failed"
            );
            require(
                paymentToken.transferFrom(msg.sender, address(this), fee),
                "Fee payment failed"
            );
        }
        
        // Transferir NFT
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );
        
        listing.isActive = false;
        
        emit Sale(listingId, msg.sender, listing.seller, price, fee);
    }
    
    /**
     * @dev Cancelar uma listagem
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Atualizar preço de uma listagem
     */
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than 0");
        
        listing.price = newPrice;
        
        emit PriceUpdated(listingId, newPrice);
    }
    
    /**
     * @dev Atualizar taxa do marketplace (apenas owner)
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        marketplaceFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Configurar token de pagamento
     */
    function setPaymentToken(address token) external onlyOwner {
        paymentToken = IERC20(token);
        useNativeToken = false;
    }
    
    /**
     * @dev Usar token nativo para pagamentos
     */
    function setUseNativeToken(bool _useNative) external onlyOwner {
        useNativeToken = _useNative;
    }
    
    /**
     * @dev Retirar taxas acumuladas
     */
    function withdrawFees() external onlyOwner {
        if (useNativeToken) {
            uint256 balance = address(this).balance;
            require(balance > 0, "No fees to withdraw");
            payable(owner()).transfer(balance);
        } else {
            uint256 balance = paymentToken.balanceOf(address(this));
            require(balance > 0, "No fees to withdraw");
            paymentToken.transfer(owner(), balance);
        }
    }
    
    /**
     * @dev Obter listagens ativas
     */
    function getActiveListings(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        uint256 count = 0;
        
        // Contar listagens ativas
        for (uint256 i = 1; i <= listingCount; i++) {
            if (listings[i].isActive) count++;
        }
        
        // Aplicar paginação
        uint256 resultCount = count > offset ? count - offset : 0;
        if (resultCount > limit) resultCount = limit;
        
        Listing[] memory result = new Listing[](resultCount);
        uint256 resultIndex = 0;
        uint256 skipped = 0;
        
        for (uint256 i = 1; i <= listingCount && resultIndex < resultCount; i++) {
            if (listings[i].isActive) {
                if (skipped < offset) {
                    skipped++;
                } else {
                    result[resultIndex] = listings[i];
                    resultIndex++;
                }
            }
        }
        
        return result;
    }
    
    /**
     * @dev Obter listagens de um vendedor
     */
    function getSellerListings(address seller) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        
        for (uint256 i = 1; i <= listingCount; i++) {
            if (listings[i].seller == seller && listings[i].isActive) count++;
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i <= listingCount && resultIndex < count; i++) {
            if (listings[i].seller == seller && listings[i].isActive) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        return result;
    }
}
