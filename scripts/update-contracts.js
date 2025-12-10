// scripts/update-contracts.js
// Script para atualizar automaticamente os endereços dos contratos no useContract.ts

const fs = require('fs');
const path = require('path');

console.log('🔄 Atualizando endereços de contratos no frontend...\n');

// Função para ler deployment
function readDeployment(chainId) {
  const deploymentPath = path.join(__dirname, `../deployments/deployment-${chainId}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.log(`⚠️  Deployment não encontrado: deployment-${chainId}.json`);
    return null;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  return deployment;
}

// Ler deployments
const arcDeployment = readDeployment('5042002');  // Arc Testnet
const sepoliaDeployment = readDeployment('11155111');  // Sepolia

// Criar objeto de contratos
const contracts = {
  arcTestnet: {
    ArcToken: arcDeployment?.contracts?.ArcToken?.address || '0x0000000000000000000000000000000000000000',
    ArcNFT: arcDeployment?.contracts?.ArcNFT?.address || '0x0000000000000000000000000000000000000000',
    ArcMarketplace: arcDeployment?.contracts?.ArcMarketplace?.address || '0x0000000000000000000000000000000000000000',
    ArcVault: arcDeployment?.contracts?.ArcVault?.address || '0x0000000000000000000000000000000000000000',
  },
  sepolia: {
    ArcToken: sepoliaDeployment?.contracts?.ArcToken?.address || '0x0000000000000000000000000000000000000000',
    ArcNFT: sepoliaDeployment?.contracts?.ArcNFT?.address || '0x0000000000000000000000000000000000000000',
    ArcMarketplace: sepoliaDeployment?.contracts?.ArcMarketplace?.address || '0x0000000000000000000000000000000000000000',
    ArcVault: sepoliaDeployment?.contracts?.ArcVault?.address || '0x0000000000000000000000000000000000000000',
  },
};

console.log('📋 Endereços encontrados:\n');
console.log('Arc Testnet:');
console.log(`  - ArcToken:      ${contracts.arcTestnet.ArcToken}`);
console.log(`  - ArcNFT:        ${contracts.arcTestnet.ArcNFT}`);
console.log(`  - ArcMarketplace: ${contracts.arcTestnet.ArcMarketplace}`);
console.log(`  - ArcVault:      ${contracts.arcTestnet.ArcVault}`);
console.log('\nSepolia:');
console.log(`  - ArcToken:      ${contracts.sepolia.ArcToken}`);
console.log(`  - ArcNFT:        ${contracts.sepolia.ArcNFT}`);
console.log(`  - ArcMarketplace: ${contracts.sepolia.ArcMarketplace}`);
console.log(`  - ArcVault:      ${contracts.sepolia.ArcVault}`);
console.log('');

// Criar diretório se não existir
const clientSrcPath = path.join(__dirname, '../client/src');
if (!fs.existsSync(clientSrcPath)) {
  fs.mkdirSync(clientSrcPath, { recursive: true });
}

// Criar arquivo de configuração JSON adicional
const configPath = path.join(clientSrcPath, 'contracts.json');
fs.writeFileSync(configPath, JSON.stringify(contracts, null, 2), 'utf8');
console.log('✅ Arquivo contracts.json criado em: client/src/contracts.json');
console.log('');

// Criar arquivo TypeScript com os endereços
const contractsTsPath = path.join(clientSrcPath, 'contracts.ts');
const contractsTsContent = `// Endereços dos contratos - Gerado automaticamente
// Não edite manualmente - Execute: node scripts/update-contracts.js

export const CONTRACTS = ${JSON.stringify(contracts, null, 2)} as const;

export type NetworkName = 'arcTestnet' | 'sepolia';
export type ContractName = 'ArcToken' | 'ArcNFT' | 'ArcMarketplace' | 'ArcVault';

export function getContractAddress(
  network: NetworkName,
  contract: ContractName
): string {
  return CONTRACTS[network][contract];
}
`;

fs.writeFileSync(contractsTsPath, contractsTsContent, 'utf8');
console.log('✅ Arquivo contracts.ts criado em: client/src/contracts.ts');
console.log('');

console.log('🎉 Atualização completa!');
console.log('');
console.log('📋 Você pode importar os endereços assim:');
console.log('');
console.log('   // Opção 1: JSON');
console.log('   import contracts from "./contracts.json";');
console.log('');
console.log('   // Opção 2: TypeScript');
console.log('   import { CONTRACTS, getContractAddress } from "./contracts";');
console.log('   const address = getContractAddress("arcTestnet", "ArcToken");');
console.log('');
