# ⚡ QUICK START - Arc SafeWallet

## 🎯 COMANDOS RÁPIDOS (Copie e Cole)

### 1️⃣ INSTALAÇÃO COMPLETA
```bash
# Instalar dependências
pnpm install

# Criar arquivo .env
cp .env.example .env

# Editar .env e adicionar PRIVATE_KEY
nano .env
```

### 2️⃣ OBTER TOKENS DE TESTE

**Arc Testnet (USDC):**
```bash
# Acesse: https://faucet.circle.com/
# Cole seu endereço de wallet
# Solicite 1 USDC
```

**Sepolia (ETH):**
```bash
# Acesse: https://sepoliafaucet.com/
# Cole seu endereço de wallet  
# Solicite 0.5 ETH
```

### 3️⃣ COMPILAR + DEPLOY COMPLETO

**Um comando para fazer tudo:**
```bash
npx hardhat compile && npx hardhat run scripts/deploy.ts --network arcTestnet && npx hardhat run scripts/deploy.ts --network sepolia && node scripts/update-contracts.js
```

**Ou passo a passo:**
```bash
# Compilar contratos
npx hardhat compile

# Deploy na Arc Testnet
npx hardhat run scripts/deploy.ts --network arcTestnet

# Deploy na Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Atualizar endereços no frontend
node scripts/update-contracts.js
```

### 4️⃣ INICIAR APLICAÇÃO
```bash
pnpm dev
```

---

## 📋 CHECKLIST VISUAL

```
┌─────────────────────────────────────────────┐
│  STATUS DO DEPLOY                            │
├─────────────────────────────────────────────┤
│  ☐ Node.js instalado                        │
│  ☐ Dependências instaladas (pnpm install)   │
│  ☐ Arquivo .env criado e configurado        │
│  ☐ Tokens de teste obtidos                  │
│  ☐ Contratos compilados                     │
│  ☐ Deploy na Arc Testnet concluído          │
│  ☐ Deploy na Sepolia concluído              │
│  ☐ Endereços atualizados no frontend        │
│  ☐ Aplicação rodando (pnpm dev)             │
│  ☐ Testes funcionais realizados             │
└─────────────────────────────────────────────┘
```

---

## 🔥 MODO SUPER RÁPIDO (Tudo de uma vez)

**Script automático:**
```bash
chmod +x install.sh deploy-all.sh
./install.sh && ./deploy-all.sh
```

---

## 📝 ARQUIVO .env (Copie e edite)

```env
# Cole sua private key aqui (sem 0x)
PRIVATE_KEY=sua_chave_privada_aqui

# RPC URLs (já configuradas, opcional)
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Etherscan API (opcional, para verificação)
ETHERSCAN_API_KEY=
```

---

## 🎯 COMANDOS ÚTEIS

```bash
# Limpar e recompilar
npx hardhat clean && npx hardhat compile

# Ver logs do deploy
cat deployments/deployment-5042002.json

# Testar contratos localmente
npx hardhat node
# Em outro terminal:
npx hardhat run scripts/deploy.ts --network localhost

# Verificar contrato no Etherscan (Sepolia)
npx hardhat verify --network sepolia 0xENDERECO_DO_CONTRATO

# Console interativo
npx hardhat console --network arcTestnet
```

---

## ⚡ SOLUÇÃO DE PROBLEMAS RÁPIDA

| Erro | Solução Rápida |
|------|----------------|
| "Insufficient funds" | Vá ao faucet e obtenha mais tokens |
| "Nonce too high" | MetaMask > Settings > Advanced > Reset Account |
| "Private key missing" | Configure PRIVATE_KEY no .env |
| "Network not supported" | Adicione a rede ao MetaMask manualmente |
| "Contract not found" | Verifique o endereço e a rede |

---

## 🚀 APÓS O DEPLOY

### Verificar no Explorer:

**Arc Testnet:**
```
https://testnet.arcscan.app/address/SEU_ENDERECO
```

**Sepolia:**
```
https://sepolia.etherscan.io/address/SEU_ENDERECO
```

### Testar no Console:
```bash
npx hardhat console --network arcTestnet
```

```javascript
// Carregar contrato
const Token = await ethers.getContractFactory("ArcToken");
const token = await Token.attach("0xSEU_ENDERECO");

// Ver saldo
const balance = await token.balanceOf("0xSUA_WALLET");
console.log(ethers.utils.formatEther(balance));
```

---

## 📊 ESTRUTURA FINAL DO PROJETO

```
arc-safewallet/
├── contracts/
│   ├── ArcToken.sol ✅
│   ├── ArcNFT.sol ✅
│   ├── ArcMarketplace.sol ✅
│   └── ArcVault.sol ✅
├── scripts/
│   ├── deploy.ts ✅
│   └── update-contracts.js ✅
├── deployments/
│   ├── deployment-5042002.json ✅ (Arc)
│   └── deployment-11155111.json ✅ (Sepolia)
├── client/src/
│   ├── abis/
│   │   ├── ArcToken.json ✅
│   │   └── ArcNFT.json ✅
│   ├── hooks/
│   │   └── useContract.ts ✅
│   ├── contracts.json ✅
│   └── contracts.ts ✅
├── .env ✅
├── hardhat.config.ts ✅
└── package.json ✅
```

---

## 🎉 PRONTO!

Seu projeto está configurado e deployado!

**Próximo passo:** Acesse http://localhost:3000 e teste!

---

**Need help?** Consulte o DEPLOY_GUIDE.md completo
