// scripts/deploy.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Iniciando deploy dos contratos...\n");

  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying com a conta:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Saldo da conta:", ethers.formatEther(balance), "ETH/USDC\n");

  // Deploy do ArcToken
  console.log("📦 Deploying ArcToken...");
  const ArcToken = await ethers.getContractFactory("ArcToken");
  const arcToken = await ArcToken.deploy();
  await arcToken.waitForDeployment();
  const arcTokenAddress = await arcToken.getAddress();
  console.log("✅ ArcToken deployed to:", arcTokenAddress);

  // Deploy do ArcNFT
  console.log("\n📦 Deploying ArcNFT...");
  const ArcNFT = await ethers.getContractFactory("ArcNFT");
  const arcNFT = await ArcNFT.deploy();
  await arcNFT.waitForDeployment();
  const arcNFTAddress = await arcNFT.getAddress();
  console.log("✅ ArcNFT deployed to:", arcNFTAddress);

  // Deploy do ArcMarketplace
  console.log("\n📦 Deploying ArcMarketplace...");
  const ArcMarketplace = await ethers.getContractFactory("ArcMarketplace");
  const arcMarketplace = await ArcMarketplace.deploy();
  await arcMarketplace.waitForDeployment();
  const arcMarketplaceAddress = await arcMarketplace.getAddress();
  console.log("✅ ArcMarketplace deployed to:", arcMarketplaceAddress);

  // Deploy do ArcVault
  console.log("\n📦 Deploying ArcVault...");
  const ArcVault = await ethers.getContractFactory("ArcVault");
  const arcVault = await ArcVault.deploy(arcTokenAddress, arcTokenAddress);
  await arcVault.waitForDeployment();
  const arcVaultAddress = await arcVault.getAddress();
  console.log("✅ ArcVault deployed to:", arcVaultAddress);

  // Obter informações da rede
  const network = await ethers.provider.getNetwork();

  // Salvar endereços dos contratos
  const deployments = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ArcToken: {
        address: arcTokenAddress,
        name: "Arc Token",
        symbol: "ARC",
      },
      ArcNFT: {
        address: arcNFTAddress,
        name: "Arc NFT Collection",
        symbol: "ARCNFT",
      },
      ArcMarketplace: {
        address: arcMarketplaceAddress,
        name: "Arc Marketplace",
      },
      ArcVault: {
        address: arcVaultAddress,
        name: "Arc Vault",
        stakingToken: arcTokenAddress,
        rewardToken: arcTokenAddress,
      },
    },
  };

  // Criar diretório de deployments se não existir
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Salvar em arquivo JSON
  const chainId = Number(network.chainId);
  const filename = `deployment-${chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deployments, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filepath}`);

  // Instruções finais
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOY COMPLETO!");
  console.log("=".repeat(60));
  console.log("\n📋 CONTRATOS DEPLOYADOS:\n");
  console.log(`   ArcToken:       ${arcTokenAddress}`);
  console.log(`   ArcNFT:         ${arcNFTAddress}`);
  console.log(`   ArcMarketplace: ${arcMarketplaceAddress}`);
  console.log(`   ArcVault:       ${arcVaultAddress}`);
  console.log("\n📋 PRÓXIMOS PASSOS:\n");
  console.log("1. Verifique os contratos no explorer");
  console.log("2. Configure os endereços no seu frontend");
  console.log("3. Teste as funções dos contratos");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
