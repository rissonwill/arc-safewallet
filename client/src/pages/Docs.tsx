import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { 
  BookOpen, 
  Code,
  Copy,
  Wallet,
  FileCode2,
  Rocket,
  Coins,
  Image,
  Package,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

const DOCS_SECTIONS = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    icon: Rocket,
    description: "Configure seu ambiente de desenvolvimento Web3",
  },
  {
    id: "wallet-connection",
    title: "Conexão de Carteira",
    icon: Wallet,
    description: "Integre MetaMask e WalletConnect",
  },
  {
    id: "smart-contracts",
    title: "Contratos Inteligentes",
    icon: FileCode2,
    description: "Desenvolva e faça deploy de contratos Solidity",
  },
  {
    id: "erc20",
    title: "ERC-20 Tokens",
    icon: Coins,
    description: "Crie tokens fungíveis",
  },
  {
    id: "erc721",
    title: "ERC-721 NFTs",
    icon: Image,
    description: "Desenvolva NFTs únicos",
  },
  {
    id: "erc1155",
    title: "ERC-1155 Multi-Token",
    icon: Package,
    description: "Tokens semi-fungíveis para jogos",
  },
];

const CODE_EXAMPLES: Record<string, { title: string; language: string; code: string }[]> = {
  "getting-started": [
    {
      title: "Instalação de Dependências",
      language: "bash",
      code: `# Instalar ethers.js
npm install ethers

# Instalar web3.js (alternativa)
npm install web3

# Instalar Hardhat para desenvolvimento
npm install --save-dev hardhat

# Instalar OpenZeppelin Contracts
npm install @openzeppelin/contracts`,
    },
    {
      title: "Configuração do Provider",
      language: "typescript",
      code: `import { ethers } from 'ethers';

// Conectar ao provider do navegador (MetaMask)
const provider = new ethers.BrowserProvider(window.ethereum);

// Ou conectar a um RPC específico
const rpcProvider = new ethers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/YOUR_API_KEY'
);

// Obter o signer para transações
const signer = await provider.getSigner();

// Verificar a rede conectada
const network = await provider.getNetwork();
console.log('Chain ID:', network.chainId);`,
    },
  ],
  "wallet-connection": [
    {
      title: "Conectar MetaMask",
      language: "typescript",
      code: `async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não instalado');
  }

  // Solicitar conexão
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  // Obter o endereço conectado
  const address = accounts[0];
  console.log('Conectado:', address);

  // Escutar mudanças de conta
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    console.log('Nova conta:', accounts[0]);
  });

  // Escutar mudanças de rede
  window.ethereum.on('chainChanged', (chainId: string) => {
    console.log('Nova rede:', parseInt(chainId, 16));
    window.location.reload();
  });

  return address;
}`,
    },
    {
      title: "Trocar de Rede",
      language: "typescript",
      code: `async function switchNetwork(chainId: number) {
  const hexChainId = '0x' + chainId.toString(16);
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (error: any) {
    // Rede não adicionada, tentar adicionar
    if (error.code === 4902) {
      await addNetwork(chainId);
    }
  }
}

async function addNetwork(chainId: number) {
  const networks: Record<number, any> = {
    137: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
    // Adicione outras redes conforme necessário
  };

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [networks[chainId]],
  });
}`,
    },
  ],
  "smart-contracts": [
    {
      title: "Interagir com Contrato",
      language: "typescript",
      code: `import { ethers } from 'ethers';

// ABI do contrato (exemplo simplificado)
const abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Endereço do contrato
const contractAddress = '0x...';

// Criar instância do contrato
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

// Ler dados (view function)
const balance = await contract.balanceOf(signer.address);
console.log('Saldo:', ethers.formatEther(balance));

// Enviar transação
const tx = await contract.transfer(
  '0xRecipientAddress',
  ethers.parseEther('1.0')
);
await tx.wait();
console.log('Transação confirmada:', tx.hash);`,
    },
    {
      title: "Deploy de Contrato",
      language: "typescript",
      code: `import { ethers } from 'ethers';

async function deployContract(
  abi: any[],
  bytecode: string,
  constructorArgs: any[]
) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Criar factory do contrato
  const factory = new ethers.ContractFactory(abi, bytecode, signer);

  // Estimar gas
  const deployTx = await factory.getDeployTransaction(...constructorArgs);
  const estimatedGas = await provider.estimateGas(deployTx);
  console.log('Gas estimado:', estimatedGas.toString());

  // Deploy
  const contract = await factory.deploy(...constructorArgs);
  console.log('Deploy iniciado:', contract.target);

  // Aguardar confirmação
  await contract.waitForDeployment();
  console.log('Contrato deployado em:', await contract.getAddress());

  return contract;
}`,
    },
  ],
  "erc20": [
    {
      title: "Contrato ERC-20 Básico",
      language: "solidity",
      code: `// SPDX-License-Identifier: MIT
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
    },
    {
      title: "Interagir com ERC-20",
      language: "typescript",
      code: `import { ethers } from 'ethers';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
];

async function getTokenInfo(tokenAddress: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply: ethers.formatUnits(totalSupply, decimals),
  };
}`,
    },
  ],
  "erc721": [
    {
      title: "Contrato ERC-721 NFT",
      language: "solidity",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Overrides necessários
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
    },
    {
      title: "Mintar NFT",
      language: "typescript",
      code: `import { ethers } from 'ethers';

const NFT_ABI = [
  'function safeMint(address to, string uri) public',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

async function mintNFT(
  contractAddress: string,
  recipientAddress: string,
  metadataURI: string
) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nft = new ethers.Contract(contractAddress, NFT_ABI, signer);

  // Mintar NFT
  const tx = await nft.safeMint(recipientAddress, metadataURI);
  const receipt = await tx.wait();

  // Obter o tokenId do evento Transfer
  const transferEvent = receipt.logs.find(
    (log: any) => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
  );
  const tokenId = parseInt(transferEvent.topics[3], 16);

  console.log('NFT mintado! Token ID:', tokenId);
  return tokenId;
}`,
    },
  ],
  "erc1155": [
    {
      title: "Contrato ERC-1155 Multi-Token",
      language: "solidity",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract GameItems is ERC1155, Ownable, ERC1155Supply {
    // IDs dos itens
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant SWORD = 2;
    uint256 public constant SHIELD = 3;

    constructor() ERC1155("https://game.example/api/item/{id}.json") Ownable(msg.sender) {
        // Mint inicial
        _mint(msg.sender, GOLD, 10**18, "");
        _mint(msg.sender, SILVER, 10**27, "");
        _mint(msg.sender, SWORD, 100, "");
        _mint(msg.sender, SHIELD, 100, "");
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}`,
    },
    {
      title: "Interagir com ERC-1155",
      language: "typescript",
      code: `import { ethers } from 'ethers';

const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
];

async function getBalances(
  contractAddress: string,
  ownerAddress: string,
  tokenIds: number[]
) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

  const addresses = tokenIds.map(() => ownerAddress);
  const balances = await contract.balanceOfBatch(addresses, tokenIds);

  return tokenIds.map((id, index) => ({
    tokenId: id,
    balance: balances[index].toString(),
  }));
}

async function transferBatch(
  contractAddress: string,
  to: string,
  ids: number[],
  amounts: number[]
) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, ERC1155_ABI, signer);

  const tx = await contract.safeBatchTransferFrom(
    signer.address,
    to,
    ids,
    amounts,
    '0x'
  );
  await tx.wait();
  console.log('Transferência em lote concluída:', tx.hash);
}`,
    },
  ],
};

export default function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const currentExamples = CODE_EXAMPLES[activeSection] || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-massive text-2xl md:text-3xl flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Documentação
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Guias e exemplos de código para desenvolvimento Web3
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="border-border lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Seções</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-2">
                {DOCS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section Header */}
            <Card className="border-border">
              <CardContent className="p-6">
                {(() => {
                  const section = DOCS_SECTIONS.find(s => s.id === activeSection);
                  if (!section) return null;
                  const Icon = section.icon;
                  
                  return (
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{section.title}</h2>
                        <p className="text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Code Examples */}
            {currentExamples.map((example, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{example.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {example.language}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(example.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto max-h-[400px] rounded-lg bg-muted/50 border">
                    <pre className="p-4 font-mono text-sm whitespace-pre-wrap">
                      {example.code}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}

            {/* External Resources */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Recursos Externos</CardTitle>
                <CardDescription>
                  Documentação oficial e tutoriais recomendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { name: "Solidity Docs", url: "https://docs.soliditylang.org" },
                    { name: "OpenZeppelin", url: "https://docs.openzeppelin.com" },
                    { name: "Ethers.js", url: "https://docs.ethers.org" },
                    { name: "Hardhat", url: "https://hardhat.org/docs" },
                    { name: "Ethereum.org", url: "https://ethereum.org/developers" },
                    { name: "Alchemy Docs", url: "https://docs.alchemy.com" },
                  ].map((resource) => (
                    <Button
                      key={resource.name}
                      variant="outline"
                      className="justify-between"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      {resource.name}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
