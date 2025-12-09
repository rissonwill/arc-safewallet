import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Blocks, 
  Coins, 
  Image, 
  Package,
  Copy,
  Code,
  FileCode2,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Default templates when database is empty
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: "ERC-20 Token",
    description: "Token fungível padrão para criptomoedas, pontos de fidelidade, e ativos digitais transferíveis.",
    templateType: "erc20",
    category: "Token",
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
  },
  {
    id: 2,
    name: "ERC-721 NFT",
    description: "Token não-fungível para arte digital, colecionáveis, certificados e ativos únicos.",
    templateType: "erc721",
    category: "NFT",
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
  },
  {
    id: 3,
    name: "ERC-1155 Multi-Token",
    description: "Padrão multi-token para jogos, marketplace e coleções com múltiplos tipos de ativos.",
    templateType: "erc1155",
    category: "Multi-Token",
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract MyMultiToken is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}`,
  },
  {
    id: 4,
    name: "Staking Contract",
    description: "Contrato de staking para recompensas por bloqueio de tokens.",
    templateType: "staking",
    category: "DeFi",
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100; // Reward per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    
    uint256 public totalSupply;

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + 
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((balances[account] * 
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        totalSupply -= amount;
        balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
        }
    }
}`,
  },
  {
    id: 5,
    name: "Multisig Wallet",
    description: "Carteira multi-assinatura para gestão segura de fundos com múltiplos aprovadores.",
    templateType: "multisig",
    category: "Wallet",
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultisigWallet {
    event Deposit(address indexed sender, uint256 amount);
    event Submit(uint256 indexed txId);
    event Approve(address indexed owner, uint256 indexed txId);
    event Revoke(address indexed owner, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Tx does not exist");
        _;
    }

    modifier notApproved(uint256 _txId) {
        require(!approved[_txId][msg.sender], "Tx already approved");
        _;
    }

    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Tx already executed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint256 _value, bytes calldata _data) external onlyOwner {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false
        }));
        emit Submit(transactions.length - 1);
    }

    function approve(uint256 _txId) external onlyOwner txExists(_txId) notApproved(_txId) notExecuted(_txId) {
        approved[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint256 _txId) private view returns (uint256 count) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (approved[_txId][owners[i]]) {
                count++;
            }
        }
    }

    function execute(uint256 _txId) external txExists(_txId) notExecuted(_txId) {
        require(_getApprovalCount(_txId) >= required, "Not enough approvals");
        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Tx failed");
        emit Execute(_txId);
    }

    function revoke(uint256 _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
        require(approved[_txId][msg.sender], "Tx not approved");
        approved[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}`,
  },
];

const getTemplateIcon = (type: string) => {
  switch (type) {
    case "erc20":
      return Coins;
    case "erc721":
      return Image;
    case "erc1155":
      return Package;
    default:
      return Blocks;
  }
};

const getTemplateColor = (type: string) => {
  switch (type) {
    case "erc20":
      return "text-[var(--color-cyan)]";
    case "erc721":
      return "text-[var(--color-pink)]";
    case "erc1155":
      return "text-[var(--color-warning)]";
    default:
      return "text-primary";
  }
};

const getTemplateBg = (type: string) => {
  switch (type) {
    case "erc20":
      return "bg-[var(--color-cyan)]/10";
    case "erc721":
      return "bg-[var(--color-pink)]/10";
    case "erc1155":
      return "bg-[var(--color-warning)]/10";
    default:
      return "bg-primary/10";
  }
};

export default function Templates() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { data: dbTemplates } = trpc.template.list.useQuery();
  
  // Use database templates if available, otherwise use defaults
  const templates = dbTemplates && dbTemplates.length > 0 ? dbTemplates : DEFAULT_TEMPLATES;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado para a área de transferência!");
  };

  const handleUseTemplate = (template: any) => {
    setLocation(`/contracts?template=${template.templateType}`);
  };

  const openPreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="headline-massive text-2xl md:text-3xl">Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comece rapidamente com templates de contratos inteligentes prontos para uso
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Templates Auditados</p>
              <p className="text-sm text-muted-foreground">
                Todos os templates são baseados em contratos OpenZeppelin, amplamente testados e auditados pela comunidade.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const Icon = getTemplateIcon(template.templateType);
            const color = getTemplateColor(template.templateType);
            const bg = getTemplateBg(template.templateType);
            
            return (
              <Card key={template.id} className="border-border card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.templateType.toUpperCase()}
                        </Badge>
                        {template.category && (
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openPreview(template)}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Ver Código
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Usar Template
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedTemplate && (
                    <>
                      <div className={`h-10 w-10 rounded-lg ${getTemplateBg(selectedTemplate.templateType)} flex items-center justify-center`}>
                        {(() => {
                          const Icon = getTemplateIcon(selectedTemplate.templateType);
                          return <Icon className={`h-5 w-5 ${getTemplateColor(selectedTemplate.templateType)}`} />;
                        })()}
                      </div>
                      <div>
                        <DialogTitle>{selectedTemplate.name}</DialogTitle>
                        <DialogDescription>{selectedTemplate.description}</DialogDescription>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyCode(selectedTemplate?.sourceCode || "")}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleUseTemplate(selectedTemplate);
                    }}
                  >
                    <FileCode2 className="h-4 w-4 mr-1" />
                    Usar Template
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 rounded-lg border bg-muted/30 mt-4">
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap">
                {selectedTemplate?.sourceCode}
              </pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
