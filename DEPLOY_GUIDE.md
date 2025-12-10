# 🚀 GUIA COMPLETO DE DEPLOY - Arc SafeWallet

## 📋 PRÉ-REQUISITOS

### 1. Software Necessário
- ✅ Node.js v18+ instalado
- ✅ NPM ou Yarn
- ✅ Git
- ✅ MetaMask instalado

### 2. Tokens de Teste
Você precisa de tokens para pagar as taxas de gas:

**Arc Testnet (USDC):**
- 🌐 Faucet: https://faucet.circle.com/
- 💧 Quantidade: 1 USDC a cada 2 horas
- ⏰ Espera: Instantâneo

**Sepolia (ETH):**
- 🌐 Faucet 1: https://sepoliafaucet.com/
- 🌐 Faucet 2: https://www.alchemy.com/faucets/ethereum-sepolia
- 💧 Quantidade: 0.5 ETH por dia
- ⏰ Espera: 1-5 minutos

---

## 🔧 PASSO 1: INSTALAÇÃO

### Clonar ou baixar o projeto
```bash
cd seu-projeto
```

### Instalar dependências
```bash
pnpm install
```

### Ou use o script de instalação
```bash
chmod +x install.sh
./install.sh
```

---

## 🔐 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Criar arquivo .env
```bash
cp .env.example .env
```

### Editar .env
```bash
nano .env
# ou
code .env
```

### Adicionar sua Private Key
```env
PRIVATE_KEY=sua_chave_privada_aqui_sem_0x
```

### ⚠️ COMO OBTER SUA PRIVATE KEY (Wallet de teste):

1. Abra MetaMask
2. Clique nos 3 pontinhos (⋮)
3. Account Details
4. Export Private Key
5. Digite sua senha
6. Copie a chave (sem o 0x do início)

**🚨 IMPORTANTE:**
- Use uma wallet SEPARADA apenas para deploys
- NUNCA use sua wallet principal
- NUNCA faça commit da .env
- Mantenha apenas tokens de TESTE nesta wallet

---

## 🔨 PASSO 3: COMPILAR CONTRATOS

### Compilar todos os contratos
```bash
npx hardhat compile
```

### ✅ Verificar se compilou corretamente
Você deve ver:
```
Compiled 5 Solidity files successfully
```

---

## 📡 PASSO 4: FAZER DEPLOY

### Opção A: Deploy Automatizado (Recomendado)
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

O script vai perguntar onde fazer deploy:
```
1) Arc Testnet
2) Sepolia  
3) Ambas
4) Localhost (teste)
```

### Opção B: Deploy Manual

#### Deploy na Arc Testnet
```bash
npx hardhat run scripts/deploy.ts --network arcTestnet
```

#### Deploy na Sepolia
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 📝 PASSO 5: VERIFICAR DEPLOYMENT

### Após o deploy, você verá algo assim:
```
🚀 Iniciando deploy dos contratos...

📝 Deploying com a conta: 0xAbC...DeF
💰 Saldo da conta: 10.5 USDC

📦 Deploying ArcToken...
✅ ArcToken deployed to: 0x1234...5678

📦 Deploying ArcNFT...
✅ ArcNFT deployed to: 0x9876...4321

💾 Deployment info saved to: deployments/deployment-5042002.json
✅ ABIs saved to client/src/abis/

🎉 DEPLOY COMPLETO!
```

### Verificar arquivos gerados:

**1. Deployment JSONs:**
```bash
ls deployments/
# deployment-5042002.json  (Arc Testnet)
# deployment-11155111.json (Sepolia)
```

**2. ABIs:**
```bash
ls client/src/abis/
# ArcToken.json
# ArcNFT.json
```

---

## 🔄 PASSO 6: ATUALIZAR ENDEREÇOS NO FRONTEND

### Opção A: Automática (Recomendado)
```bash
node scripts/update-contracts.js
```

Isso vai:
- ✅ Ler os deployments
- ✅ Criar contracts.json
- ✅ Criar contracts.ts

### Opção B: Manual

Abra `client/src/hooks/useContract.ts` e atualize:

```typescript
const CONTRACTS = {
  arcTestnet: {
    ArcToken: '0xSEU_ENDERECO_AQUI',
    ArcNFT: '0xSEU_ENDERECO_AQUI',
  },
  sepolia: {
    ArcToken: '0xSEU_ENDERECO_AQUI',
    ArcNFT: '0xSEU_ENDERECO_AQUI',
  },
};
```

---

## 🧪 PASSO 7: TESTAR OS CONTRATOS

### Ver contratos no Block Explorer

**Arc Testnet:**
```
https://testnet.arcscan.app/address/0xSEU_ENDERECO
```

**Sepolia:**
```
https://sepolia.etherscan.io/address/0xSEU_ENDERECO
```

---

## ✅ PASSO 8: VERIFICAR CONTRATOS (Opcional)

### Apenas para Sepolia (Etherscan)
```bash
npx hardhat verify --network sepolia 0xSEU_ENDERECO_TOKEN

npx hardhat verify --network sepolia 0xSEU_ENDERECO_NFT
```

**Nota:** Arc Testnet ainda não tem verificação de contratos disponível.

---

## 🚀 PASSO 9: INICIAR APLICAÇÃO

### Iniciar servidor de desenvolvimento
```bash
pnpm dev
```

### Acessar aplicação
```
http://localhost:3000
```

### Testar funcionalidades:
1. ✅ Conectar MetaMask
2. ✅ Trocar para Arc Testnet
3. ✅ Ver saldo de tokens
4. ✅ Fazer mint de NFT
5. ✅ Transferir tokens

---

## 🐛 TROUBLESHOOTING

### Erro: "Insufficient funds for gas"
**Solução:** Obtenha mais tokens de teste nos faucets

### Erro: "Nonce too high"
**Solução:** Reset do MetaMask
```
MetaMask > Settings > Advanced > Reset Account
```

### Erro: "Contract not found"
**Solução:** 
1. Verifique se o endereço está correto
2. Verifique se está na rede correta
3. Aguarde alguns blocos após o deploy

### Erro: "Private key missing"
**Solução:** Configure o arquivo .env com sua PRIVATE_KEY

### Erro: "Network not supported"
**Solução:** Adicione a rede manualmente ao MetaMask

---

## 📊 RESUMO DOS COMANDOS

```bash
# 1. Instalar
pnpm install

# 2. Compilar
npx hardhat compile

# 3. Deploy Arc
npx hardhat run scripts/deploy.ts --network arcTestnet

# 4. Deploy Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# 5. Atualizar endereços
node scripts/update-contracts.js

# 6. Iniciar app
pnpm dev

# 7. Verificar (opcional)
npx hardhat verify --network sepolia 0xENDERECO
```

---

## 📚 RECURSOS ADICIONAIS

### Documentação
- Arc Network: https://docs.circle.com/arc
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/

### Ferramentas
- Remix IDE: https://remix.ethereum.org/
- Tenderly: https://tenderly.co/
- OpenZeppelin Wizard: https://wizard.openzeppelin.com/

### Faucets
- Arc: https://faucet.circle.com/
- Sepolia: https://sepoliafaucet.com/
- Alchemy Sepolia: https://www.alchemy.com/faucets/ethereum-sepolia

---

## ✨ PRÓXIMOS PASSOS

Após o deploy bem-sucedido:

1. ✅ Teste todas as funções dos contratos
2. ✅ Crie interface para interagir com contratos
3. ✅ Adicione mais funcionalidades (staking, marketplace, etc.)
4. ✅ Implemente testes automatizados
5. ✅ Prepare para mainnet (quando Arc lançar)

---

## 🎉 PARABÉNS!

Você completou o deploy dos seus smart contracts!
Agora seu Arc SafeWallet está funcionando com contratos próprios nas testnets.

---

**Criado com ❤️ para Arc Network e Ethereum**
