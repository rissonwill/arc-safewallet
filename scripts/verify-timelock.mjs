// Script para verificar ArcTimelock no Etherscan
// Executar com: npx hardhat run scripts/verify-timelock.mjs --network sepolia

import hre from "hardhat";

async function main() {
  console.log("Verificando ArcTimelock no Etherscan...");
  
  const timelockAddress = "0x3A0671E9E966213D3d73ed1841E33879B37146fe";
  const minDelay = 86400; // 24 horas
  const proposers = []; // Array vazio
  const executors = ["0x0000000000000000000000000000000000000000"]; // Zero address = qualquer um
  const admin = "0xA1f06fC5A1bF3C90f1b653f953bB3F0efcA19B1F";
  
  try {
    await hre.run("verify:verify", {
      address: timelockAddress,
      contract: "contracts/ArcTimelock.sol:ArcTimelock",
      constructorArguments: [minDelay, proposers, executors, admin],
    });
    console.log("✅ ArcTimelock verificado com sucesso!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ ArcTimelock já estava verificado!");
    } else {
      console.error("❌ Erro:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
