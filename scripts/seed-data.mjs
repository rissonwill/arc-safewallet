// scripts/seed-data.mjs
// Seed script para popular templates de contratos e redes suportadas

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

// Templates de Contratos Solidity
const CONTRACT_TEMPLATES = [
  {
    name: 'ERC-20 Token',
    description: 'Token fungível padrão ERC-20 com funcionalidades de mint, burn e transfer. Ideal para criar criptomoedas, tokens de utilidade ou tokens de governança.',
    templateType: 'erc20',
    category: 'Token',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`,
    defaultParams: JSON.stringify({
      name: 'My Token',
      symbol: 'MTK',
      initialSupply: 1000000
    }),
    isActive: true
  },
  {
    name: 'ERC-721 NFT Collection',
    description: 'Coleção de NFTs padrão ERC-721 com metadata URI, mint público e funcionalidades de royalties. Perfeito para arte digital, colecionáveis e memberships.',
    templateType: 'erc721',
    category: 'NFT',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxSupply = 10000;
    string private _baseTokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        require(_nextTokenId < maxSupply, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function publicMint() public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId < maxSupply, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`,
    defaultParams: JSON.stringify({
      name: 'My NFT Collection',
      symbol: 'MNFT',
      baseURI: 'https://api.example.com/metadata/'
    }),
    isActive: true
  },
  {
    name: 'ERC-1155 Multi-Token',
    description: 'Contrato multi-token ERC-1155 que suporta tokens fungíveis e não-fungíveis no mesmo contrato. Ideal para jogos, marketplaces e sistemas de recompensas.',
    templateType: 'erc1155',
    category: 'Multi-Token',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract MyMultiToken is ERC1155, Ownable, ERC1155Supply {
    string public name;
    string public symbol;
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public tokenPrices;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory uri
    ) ERC1155(uri) Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        return super.uri(tokenId);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public onlyOwner {
        tokenPrices[tokenId] = price;
    }

    function publicMint(uint256 tokenId, uint256 amount) public payable {
        require(tokenPrices[tokenId] > 0, "Token not for sale");
        require(msg.value >= tokenPrices[tokenId] * amount, "Insufficient payment");
        _mint(msg.sender, tokenId, amount, "");
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Required override
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}`,
    defaultParams: JSON.stringify({
      name: 'My Multi Token',
      symbol: 'MMT',
      uri: 'https://api.example.com/token/{id}.json'
    }),
    isActive: true
  },
  {
    name: 'Staking Vault',
    description: 'Contrato de staking com recompensas automáticas. Usuários podem depositar tokens e receber recompensas proporcionais ao tempo de stake.',
    templateType: 'defi',
    category: 'DeFi',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100; // 1% per day (100 basis points)
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimReward();
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        _claimReward();
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        _claimReward();
    }

    function _claimReward() internal {
        uint256 reward = pendingReward(msg.sender);
        if (reward > 0) {
            stakes[msg.sender].startTime = block.timestamp;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    function pendingReward(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 duration = block.timestamp - stakeInfo.startTime;
        uint256 reward = (stakeInfo.amount * rewardRate * duration) / (REWARD_PRECISION * SECONDS_PER_DAY);
        return reward;
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }

    function depositRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }
}`,
    defaultParams: JSON.stringify({
      stakingToken: '0x...',
      rewardToken: '0x...'
    }),
    isActive: true
  },
  {
    name: 'NFT Marketplace',
    description: 'Marketplace descentralizado para compra e venda de NFTs. Suporta listagens, ofertas e taxas de plataforma configuráveis.',
    templateType: 'marketplace',
    category: 'Marketplace',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, ReentrancyGuard {
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_PRECISION = 10000;
    
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => uint256)) public nftToListing;

    event Listed(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Sale(uint256 indexed listingId, address indexed buyer, uint256 price);
    event Cancelled(uint256 indexed listingId);

    constructor() Ownable(msg.sender) {}

    function list(address nftContract, uint256 tokenId, uint256 price) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be > 0");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Not approved");
        
        listingCount++;
        listings[listingCount] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        nftToListing[nftContract][tokenId] = listingCount;
        
        emit Listed(listingCount, msg.sender, nftContract, tokenId, price);
        return listingCount;
    }

    function buy(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.active = false;
        
        uint256 fee = (listing.price * platformFee) / FEE_PRECISION;
        uint256 sellerAmount = listing.price - fee;
        
        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        payable(listing.seller).transfer(sellerAmount);
        
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit Sale(listingId, msg.sender, listing.price);
    }

    function cancel(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");
        
        listing.active = false;
        emit Cancelled(listingId);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`,
    defaultParams: JSON.stringify({}),
    isActive: true
  }
];

// Redes Suportadas
const NETWORKS = [
  {
    chainId: 5042002,
    name: 'Arc Testnet',
    symbol: 'USDC',
    rpcUrl: 'https://rpc.testnet.arc.network',
    explorerUrl: 'https://testnet.arcscan.app',
    isTestnet: true,
    isActive: true,
    iconUrl: 'https://arc.network/favicon.ico'
  },
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
    isActive: true,
    iconUrl: 'https://ethereum.org/favicon.ico'
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://ethereum.org/favicon.ico'
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://polygon.technology/favicon.ico'
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://www.bnbchain.org/favicon.ico'
  },
  {
    chainId: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://arbitrum.io/favicon.ico'
  },
  {
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://optimism.io/favicon.ico'
  },
  {
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://base.org/favicon.ico'
  },
  {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    isTestnet: false,
    isActive: true,
    iconUrl: 'https://avax.network/favicon.ico'
  },
  {
    chainId: 80001,
    name: 'Mumbai Testnet',
    symbol: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    isTestnet: true,
    isActive: true,
    iconUrl: 'https://polygon.technology/favicon.ico'
  }
];

async function main() {
  console.log('🌱 Iniciando seed de dados...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // Seed Contract Templates
    console.log('📝 Inserindo templates de contratos...');
    for (const template of CONTRACT_TEMPLATES) {
      try {
        await connection.execute(
          `INSERT INTO contractTemplates (name, description, templateType, category, sourceCode, defaultParams, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE 
             description = VALUES(description),
             sourceCode = VALUES(sourceCode),
             defaultParams = VALUES(defaultParams),
             updatedAt = NOW()`,
          [template.name, template.description, template.templateType, template.category, template.sourceCode, template.defaultParams, template.isActive]
        );
        console.log(`   ✅ ${template.name}`);
      } catch (err) {
        console.log(`   ⚠️ ${template.name}: ${err.message}`);
      }
    }
    
    // Seed Networks
    console.log('\n🌐 Inserindo redes suportadas...');
    for (const network of NETWORKS) {
      try {
        await connection.execute(
          `INSERT INTO networks (chainId, name, symbol, rpcUrl, explorerUrl, isTestnet, isActive, iconUrl, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
             name = VALUES(name),
             rpcUrl = VALUES(rpcUrl),
             explorerUrl = VALUES(explorerUrl),
             isActive = VALUES(isActive)`,
          [network.chainId, network.name, network.symbol, network.rpcUrl, network.explorerUrl, network.isTestnet, network.isActive, network.iconUrl]
        );
        console.log(`   ✅ ${network.name} (Chain ID: ${network.chainId})`);
      } catch (err) {
        console.log(`   ⚠️ ${network.name}: ${err.message}`);
      }
    }
    
    // Verificar contagens
    const [templateCount] = await connection.execute('SELECT COUNT(*) as count FROM contractTemplates');
    const [networkCount] = await connection.execute('SELECT COUNT(*) as count FROM networks');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED COMPLETO!');
    console.log('='.repeat(50));
    console.log(`📝 Templates de contratos: ${templateCount[0].count}`);
    console.log(`🌐 Redes suportadas: ${networkCount[0].count}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
