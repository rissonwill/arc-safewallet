import { useState, useEffect, useCallback } from 'react';
import { ethers, formatEther, parseEther, isAddress } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Image, 
  ShoppingCart, 
  Tag,
  Wallet,
  RefreshCw,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  Grid3X3,
  List
} from 'lucide-react';
import { WalletAPI, NETWORKS } from '@/lib/walletApi';
import DashboardLayout from '@/components/DashboardLayout';

// ABIs
const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function mint(string memory uri) payable returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function mintingActive() view returns (bool)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
];

const MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
  "function buyNFT(uint256 listingId) payable",
  "function cancelListing(uint256 listingId)",
  "function listings(uint256) view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive, uint256 createdAt)",
  "function listingCount() view returns (uint256)",
  "function marketplaceFee() view returns (uint256)",
  "event Listed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price, uint256 fee)",
];

interface NFTItem {
  tokenId: number;
  tokenURI: string;
  owner: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
}

interface Listing {
  id: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  price: string;
  isActive: boolean;
  createdAt: number;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
}

export default function NFTMarketplace() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [nftAddress, setNftAddress] = useState('');
  const [marketplaceAddress, setMarketplaceAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // NFT State
  const [nftInfo, setNftInfo] = useState<{ name: string; symbol: string; totalSupply: number } | null>(null);
  const [myNFTs, setMyNFTs] = useState<NFTItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  
  // Mint State
  const [mintPrice, setMintPrice] = useState('0');
  const [mintURI, setMintURI] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  
  // List State
  const [listPrice, setListPrice] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isListing, setIsListing] = useState(false);
  
  // Buy State
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const state = WalletAPI.getWalletState();
      setIsConnected(state.isConnected);
      setAccount(state.account);
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const account = await WalletAPI.connectWallet();
      setIsConnected(true);
      setAccount(account);
      toast.success('Carteira conectada!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadNFTData = useCallback(async () => {
    if (!nftAddress || !account || !isAddress(nftAddress)) {
      return;
    }

    setIsLoading(true);
    try {
      const provider = await WalletAPI.getProvider();
      const nft = new ethers.Contract(nftAddress, NFT_ABI, provider);

      // Carregar info do NFT
      const [name, symbol, totalSupply, price, balance] = await Promise.all([
        nft.name(),
        nft.symbol(),
        nft.totalSupply(),
        nft.mintPrice().catch(() => BigInt(0)),
        nft.balanceOf(account),
      ]);

      setNftInfo({
        name,
        symbol,
        totalSupply: totalSupply.toNumber(),
      });

      setMintPrice(formatEther(price));

      // Carregar NFTs do usuário
      const userNFTs: NFTItem[] = [];
      const supply = totalSupply.toNumber();
      
      for (let i = 1; i <= supply && userNFTs.length < 50; i++) {
        try {
          const owner = await nft.ownerOf(i);
          if (owner.toLowerCase() === account.toLowerCase()) {
            const uri = await nft.tokenURI(i);
            userNFTs.push({
              tokenId: i,
              tokenURI: uri,
              owner,
              metadata: await fetchMetadata(uri),
            });
          }
        } catch (e) {
          // Token pode não existir
        }
      }

      setMyNFTs(userNFTs);

    } catch (error: any) {
      console.error('Error loading NFT:', error);
      toast.error('Erro ao carregar dados do NFT');
    } finally {
      setIsLoading(false);
    }
  }, [nftAddress, account]);

  const loadMarketplaceData = useCallback(async () => {
    if (!marketplaceAddress || !isAddress(marketplaceAddress)) {
      return;
    }

    try {
      const provider = await WalletAPI.getProvider();
      const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);

      const count = await marketplace.listingCount();
      const activeListings: Listing[] = [];

      for (let i = 1; i <= count.toNumber() && activeListings.length < 50; i++) {
        try {
          const listing = await marketplace.listings(i);
          if (listing.isActive) {
            let metadata;
            if (isAddress(listing.nftContract)) {
              const nft = new ethers.Contract(listing.nftContract, NFT_ABI, provider);
              const uri = await nft.tokenURI(listing.tokenId);
              metadata = await fetchMetadata(uri);
            }

            activeListings.push({
              id: i,
              seller: listing.seller,
              nftContract: listing.nftContract,
              tokenId: listing.tokenId.toNumber(),
              price: formatEther(listing.price),
              isActive: listing.isActive,
              createdAt: listing.createdAt.toNumber(),
              metadata,
            });
          }
        } catch (e) {
          // Listing pode não existir
        }
      }

      setListings(activeListings);
    } catch (error: any) {
      console.error('Error loading marketplace:', error);
    }
  }, [marketplaceAddress]);

  const fetchMetadata = async (uri: string): Promise<any> => {
    try {
      // Handle IPFS URIs
      let url = uri;
      if (uri.startsWith('ipfs://')) {
        url = `https://ipfs.io/ipfs/${uri.slice(7)}`;
      }
      
      const response = await fetch(url);
      return await response.json();
    } catch (e) {
      return { name: 'Unknown', description: '', image: '' };
    }
  };

  useEffect(() => {
    if (nftAddress && account) {
      loadNFTData();
    }
  }, [nftAddress, account, loadNFTData]);

  useEffect(() => {
    if (marketplaceAddress) {
      loadMarketplaceData();
    }
  }, [marketplaceAddress, loadMarketplaceData]);

  const handleMint = async () => {
    if (!mintURI) {
      toast.error('Digite a URI do metadata');
      return;
    }

    setIsMinting(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = await provider.getSigner();
      const nft = new ethers.Contract(nftAddress, NFT_ABI, signer);

      const price = await nft.mintPrice();
      
      toast.info('Fazendo mint do NFT...');
      const tx = await nft.mint(mintURI, { value: price });
      await tx.wait();

      toast.success('NFT mintado com sucesso!');
      setMintURI('');
      loadNFTData();
    } catch (error: any) {
      console.error('Mint error:', error);
      toast.error(error.reason || error.message || 'Erro ao mintar NFT');
    } finally {
      setIsMinting(false);
    }
  };

  const handleListNFT = async () => {
    if (!selectedNFT || !listPrice || parseFloat(listPrice) <= 0) {
      toast.error('Selecione um NFT e defina um preço');
      return;
    }

    setIsListing(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = await provider.getSigner();
      const nft = new ethers.Contract(nftAddress, NFT_ABI, signer);
      const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, signer);

      // Aprovar marketplace
      const approved = await nft.getApproved(selectedNFT.tokenId);
      if (approved.toLowerCase() !== marketplaceAddress.toLowerCase()) {
        toast.info('Aprovando NFT para o marketplace...');
        const approveTx = await nft.approve(marketplaceAddress, selectedNFT.tokenId);
        await approveTx.wait();
      }

      // Listar NFT
      toast.info('Listando NFT no marketplace...');
      const price = parseEther(listPrice);
      const tx = await marketplace.listNFT(nftAddress, selectedNFT.tokenId, price);
      await tx.wait();

      toast.success('NFT listado com sucesso!');
      setSelectedNFT(null);
      setListPrice('');
      loadNFTData();
      loadMarketplaceData();
    } catch (error: any) {
      console.error('List error:', error);
      toast.error(error.reason || error.message || 'Erro ao listar NFT');
    } finally {
      setIsListing(false);
    }
  };

  const handleBuyNFT = async (listing: Listing) => {
    setIsBuying(true);
    try {
      const provider = await WalletAPI.getProvider();
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, signer);

      toast.info('Comprando NFT...');
      const tx = await marketplace.buyNFT(listing.id, {
        value: parseEther(listing.price),
      });
      await tx.wait();

      toast.success('NFT comprado com sucesso!');
      loadNFTData();
      loadMarketplaceData();
    } catch (error: any) {
      console.error('Buy error:', error);
      toast.error(error.reason || error.message || 'Erro ao comprar NFT');
    } finally {
      setIsBuying(false);
    }
  };

  const NFTCard = ({ nft, showBuy = false, listing }: { nft: NFTItem; showBuy?: boolean; listing?: Listing }) => (
    <Card className="bg-card/50 border-border/50 overflow-hidden group hover:border-cyan-500/50 transition-all">
      <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 relative">
        {nft.metadata?.image ? (
          <img 
            src={nft.metadata.image.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${nft.metadata.image.slice(7)}`
              : nft.metadata.image
            }
            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-16 h-16 text-muted-foreground opacity-50" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-background/80">
          #{nft.tokenId}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">
          {nft.metadata?.name || `NFT #${nft.tokenId}`}
        </h3>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {nft.metadata?.description || 'Sem descrição'}
        </p>
        
        {showBuy && listing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Preço</span>
              <span className="font-bold text-cyan-400">{listing.price} ETH</span>
            </div>
            <Button
              onClick={() => handleBuyNFT(listing)}
              disabled={isBuying || listing.seller.toLowerCase() === account?.toLowerCase()}
              className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
            >
              {isBuying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {listing.seller.toLowerCase() === account?.toLowerCase() ? 'Seu NFT' : 'Comprar'}
            </Button>
          </div>
        )}

        {!showBuy && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setSelectedNFT(nft)}
              >
                <Tag className="w-4 h-4 mr-2" />
                Listar para Venda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Listar NFT para Venda</DialogTitle>
                <DialogDescription>
                  Defina o preço para vender seu NFT #{nft.tokenId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Preço (ETH)</Label>
                  <Input
                    type="number"
                    placeholder="0.1"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleListNFT}
                  disabled={isListing || !marketplaceAddress}
                  className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  {isListing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Tag className="w-4 h-4 mr-2" />
                  )}
                  {isListing ? 'Listando...' : 'Listar NFT'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
              NFT Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Mint, compre e venda NFTs na SmartVault Network
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
            
            {!isConnected ? (
              <Button onClick={connectWallet} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
                <Wallet className="w-4 h-4 mr-2" />
                Conectar Carteira
              </Button>
            ) : (
              <Badge variant="outline" className="px-4 py-2 border-cyan-500/50">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {WalletAPI.shortenAddress(account || '')}
              </Badge>
            )}
          </div>
        </div>

        {/* Contract Addresses */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-cyan-400" />
              Endereços dos Contratos
            </CardTitle>
            <CardDescription>
              Insira os endereços do NFT e Marketplace para interagir
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contrato NFT (ArcNFT)</Label>
              <Input
                placeholder="0x..."
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Contrato Marketplace</Label>
              <Input
                placeholder="0x..."
                value={marketplaceAddress}
                onChange={(e) => setMarketplaceAddress(e.target.value)}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {nftInfo && (
          <>
            {/* NFT Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Image className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coleção</p>
                      <p className="text-xl font-bold">{nftInfo.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/20">
                      <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="text-xl font-bold">{nftInfo.totalSupply}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Tag className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço de Mint</p>
                      <p className="text-xl font-bold">{mintPrice} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="marketplace" className="space-y-6">
              <TabsList className="bg-background/50 border border-border/50">
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="my-nfts">Meus NFTs ({myNFTs.length})</TabsTrigger>
                <TabsTrigger value="mint">Mint</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace">
                {listings.length === 0 ? (
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-12 text-center">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum NFT à Venda</h3>
                      <p className="text-muted-foreground">
                        Seja o primeiro a listar um NFT no marketplace
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {listings.map((listing) => (
                      <NFTCard
                        key={listing.id}
                        nft={{
                          tokenId: listing.tokenId,
                          tokenURI: '',
                          owner: listing.seller,
                          metadata: listing.metadata,
                        }}
                        showBuy
                        listing={listing}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-nfts">
                {myNFTs.length === 0 ? (
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-12 text-center">
                      <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Você não tem NFTs</h3>
                      <p className="text-muted-foreground">
                        Faça mint ou compre NFTs no marketplace
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {myNFTs.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mint">
                <Card className="bg-card/50 border-border/50 max-w-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-cyan-400" />
                      Mint Novo NFT
                    </CardTitle>
                    <CardDescription>
                      Crie um novo NFT na coleção {nftInfo.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Metadata URI (IPFS ou HTTP)</Label>
                      <Input
                        placeholder="ipfs://... ou https://..."
                        value={mintURI}
                        onChange={(e) => setMintURI(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        URI do JSON com name, description e image
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preço de Mint</span>
                        <span className="font-bold">{mintPrice} ETH</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleMint}
                      disabled={isMinting || !mintURI}
                      className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    >
                      {isMinting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isMinting ? 'Mintando...' : 'Mint NFT'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!nftInfo && !isLoading && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Contrato Carregado</h3>
              <p className="text-muted-foreground">
                Insira o endereço de um contrato ArcNFT para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
