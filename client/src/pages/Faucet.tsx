import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Clock, CheckCircle2, XCircle, Loader2, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";

const TESTNET_NETWORKS = [
  { chainId: 5042002, name: "Arc Testnet", symbol: "ARC", color: "bg-purple-500" },
  { chainId: 11155111, name: "Sepolia", symbol: "ETH", color: "bg-gray-500" },
];

export default function Faucet() {
  const { user } = useAuth();
  const [selectedChain, setSelectedChain] = useState(5042002);
  const [walletAddress, setWalletAddress] = useState("");

  const { data: canRequest, refetch: refetchCanRequest } = trpc.faucet.canRequest.useQuery(
    { chainId: selectedChain },
    { enabled: !!user }
  );

  const { data: history, refetch: refetchHistory } = trpc.faucet.history.useQuery(
    undefined,
    { enabled: !!user }
  );

  const requestMutation = trpc.faucet.request.useMutation({
    onSuccess: (data) => {
      toast.success("Tokens sent!", { description: data.message });
      refetchCanRequest();
      refetchHistory();
    },
    onError: (error) => {
      toast.error("Request failed", { description: error.message });
    },
  });

  const handleRequest = () => {
    if (!walletAddress || walletAddress.length !== 42) {
      toast.error("Invalid address", { description: "Please enter a valid wallet address" });
      return;
    }
    requestMutation.mutate({ walletAddress, chainId: selectedChain });
  };

  const selectedNetwork = TESTNET_NETWORKS.find(n => n.chainId === selectedChain);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-6 h-6 text-cyan-500" />
              Testnet Faucet
            </CardTitle>
            <CardDescription>Please login to request testnet tokens.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-neon-text flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            Testnet Faucet
          </h1>
          <p className="text-muted-foreground mt-2">
            Get free testnet tokens to test your smart contracts
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Request Form */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Request Tokens</CardTitle>
              <CardDescription>
                You can request tokens once per hour per network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Network</Label>
                <Select
                  value={selectedChain.toString()}
                  onValueChange={(value) => setSelectedChain(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {TESTNET_NETWORKS.map((network) => (
                      <SelectItem key={network.chainId} value={network.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${network.color}`} />
                          {network.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">0.1 {selectedNetwork?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">{selectedNetwork?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  {canRequest?.canRequest ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                      Wait {canRequest?.waitTime} min
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={handleRequest}
                disabled={!canRequest?.canRequest || requestMutation.isPending || !walletAddress}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : !canRequest?.canRequest ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Wait {canRequest?.waitTime} minutes
                  </>
                ) : (
                  <>
                    <Droplets className="w-4 h-4 mr-2" />
                    Request Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <span className="text-cyan-500 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Select Network</p>
                  <p className="text-sm text-muted-foreground">
                    Choose which testnet you want to receive tokens on
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <span className="text-purple-500 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Enter Address</p>
                  <p className="text-sm text-muted-foreground">
                    Paste your wallet address to receive the tokens
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  <span className="text-pink-500 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Receive Tokens</p>
                  <p className="text-sm text-muted-foreground">
                    Tokens will be sent to your wallet within seconds
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <p className="text-sm text-yellow-500">
                  <strong>Note:</strong> Testnet tokens have no real value. They are only for testing purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request History */}
        <Card className="mt-6 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Your recent faucet requests</CardDescription>
          </CardHeader>
          <CardContent>
            {!history || history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((request) => {
                  const network = TESTNET_NETWORKS.find(n => n.chainId === request.chainId);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {request.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : request.status === "failed" ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                        )}
                        <div>
                          <p className="font-medium">
                            {request.amount} {network?.symbol || "tokens"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {network?.name} • {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {request.txHash && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://explorer.example.com/tx/${request.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
