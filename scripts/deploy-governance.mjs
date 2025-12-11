import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🏛️ Iniciando deploy dos contratos de Governança...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Carregar endereço do ArcToken já deployado
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const deploymentPath = path.join(process.cwd(), `deployments/deployment-${chainId}.json`);
  
  let existingDeployment = {};
  if (fs.existsSync(deploymentPath)) {
    existingDeployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("📄 Deployment existente carregado");
  }

  const arcTokenAddress = existingDeployment.contracts?.ArcToken?.address;
  if (!arcTokenAddress) {
    console.error("❌ ArcToken não encontrado! Deploy o ArcToken primeiro.");
    process.exit(1);
  }
  console.log("🪙 ArcToken encontrado:", arcTokenAddress, "\n");

  // 1. Deploy ArcTimelock
  console.log("⏳ Deployando ArcTimelock...");
  const minDelay = 24 * 60 * 60; // 24 horas em segundos
  const proposers = []; // Será preenchido com o Governor após deploy
  const executors = [hre.ethers.ZeroAddress]; // Qualquer um pode executar
  const admin = deployer.address; // Admin temporário

  const ArcTimelock = await hre.ethers.getContractFactory("ArcTimelock");
  const timelock = await ArcTimelock.deploy(minDelay, proposers, executors, admin);
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("✅ ArcTimelock deployed:", timelockAddress);

  // 2. Deploy ArcGovernance
  console.log("\n⏳ Deployando ArcGovernance...");
  const ArcGovernance = await hre.ethers.getContractFactory("ArcGovernance");
  
  // Parâmetros do construtor:
  // _token: Endereço do token de votação
  // _timelock: Endereço do TimelockController
  // _votingDelay: 7200 blocos (~1 dia)
  // _votingPeriod: 50400 blocos (~1 semana)
  // _proposalThreshold: 1000 tokens (com 18 decimais)
  const votingDelay = 7200;
  const votingPeriod = 50400;
  const proposalThreshold = hre.ethers.parseEther("1000"); // 1000 ARC
  
  const governance = await ArcGovernance.deploy(
    arcTokenAddress,
    timelockAddress,
    votingDelay,
    votingPeriod,
    proposalThreshold
  );
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ ArcGovernance deployed:", governanceAddress);

  // 3. Configurar Timelock para aceitar propostas do Governor
  console.log("\n⚙️ Configurando permissões do Timelock...");
  
  // Obter roles do Timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  
  // Conceder role de proposer ao Governor
  const grantProposerTx = await timelock.grantRole(PROPOSER_ROLE, governanceAddress);
  await grantProposerTx.wait();
  console.log("✅ Governor adicionado como Proposer");

  // Conceder role de canceller ao Governor
  const grantCancellerTx = await timelock.grantRole(CANCELLER_ROLE, governanceAddress);
  await grantCancellerTx.wait();
  console.log("✅ Governor adicionado como Canceller");

  // 4. Salvar deployment
  const governanceDeployment = {
    ...existingDeployment,
    ArcTimelock: {
      address: timelockAddress,
      minDelay: minDelay,
      deployedAt: new Date().toISOString(),
    },
    ArcGovernance: {
      address: governanceAddress,
      tokenAddress: arcTokenAddress,
      timelockAddress: timelockAddress,
      votingDelay: "1 day (7200 blocks)",
      votingPeriod: "1 week (50400 blocks)",
      proposalThreshold: "1000 ARC",
      quorum: "4%",
      deployedAt: new Date().toISOString(),
    },
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(governanceDeployment, null, 2));
  console.log("\n📁 Deployment salvo em:", deploymentPath);

  // Resumo
  console.log("\n" + "=".repeat(60));
  console.log("🏛️ GOVERNANÇA DEPLOYADA COM SUCESSO!");
  console.log("=".repeat(60));
  console.log("\n📋 Contratos:");
  console.log("   ArcTimelock:", timelockAddress);
  console.log("   ArcGovernance:", governanceAddress);
  console.log("\n⚙️ Configurações:");
  console.log("   Token de Votação:", arcTokenAddress);
  console.log("   Timelock Delay: 24 horas");
  console.log("   Voting Delay: 1 dia (7200 blocos)");
  console.log("   Voting Period: 1 semana (50400 blocos)");
  console.log("   Proposal Threshold: 1000 ARC");
  console.log("   Quorum: 4%");
  console.log("\n🔗 Verificar no Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${timelockAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${governanceAddress}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
