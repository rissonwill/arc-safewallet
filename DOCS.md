# Arc SafeWallet - Documentação Técnica

> **Autor:** [@smartcript](https://x.com/smartcript)  
> **Versão:** 1.0.0  
> **Última atualização:** Dezembro 2024

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Smart Contracts](#3-smart-contracts)
4. [API Backend](#4-api-backend)
5. [Frontend](#5-frontend)
6. [Governança DAO](#6-governança-dao)
7. [Segurança](#7-segurança)
8. [Deploy e Configuração](#8-deploy-e-configuração)

---

## 1. Visão Geral

Arc SafeWallet é uma plataforma Web3 completa que oferece:

- **Gerenciamento de Carteiras** - Conexão com MetaMask e suporte multi-chain
- **Editor de Contratos** - Criação e compilação de smart contracts Solidity
- **Deploy Simplificado** - Deploy em múltiplas redes com um clique
- **Governança DAO** - Sistema de votação descentralizada
- **NFT Marketplace** - Compra, venda e criação de NFTs
- **Staking** - Sistema de staking com recompensas automáticas
- **Security Scanner** - Análise de vulnerabilidades em contratos

---

## 2. Arquitetura

### 2.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui     │
│  ethers.js v6 + tRPC Client                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       BACKEND                            │
│  Node.js + Express + tRPC Server + Drizzle ORM          │
│  solc-js (Compilador Solidity)                          │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│     DATABASE        │    │        BLOCKCHAIN           │
│  MySQL / TiDB       │    │  Ethereum, Polygon, Arc...  │
└─────────────────────┘    └─────────────────────────────┘
```

### 2.2 Fluxo de Dados

1. **Usuário** interage com o frontend React
2. **tRPC** faz chamadas type-safe para o backend
3. **Backend** processa lógica de negócio e acessa banco de dados
4. **ethers.js** interage diretamente com a blockchain
5. **Smart Contracts** executam operações on-chain

---

## 3. Smart Contracts

### 3.1 ArcToken (ERC-20)

Token fungível com funcionalidades avançadas:

```solidity
// Funcionalidades principais
- mint(address to, uint256 amount)      // Criar tokens
- burn(uint256 amount)                   // Queimar tokens
- addMinter(address minter)              // Adicionar minter
- removeMinter(address minter)           // Remover minter
- delegate(address delegatee)            // Delegar votos (governança)
```

**Características:**
- Supply inicial: 1.000.000 ARC
- Decimais: 18
- Sistema de minters para controle de emissão
- Suporte a votação (ERC20Votes)

### 3.2 ArcNFT (ERC-721)

Coleção NFT com mint público:

```solidity
// Funcionalidades principais
- mint(string uri) payable              // Mint público
- mintForAddress(address to, string uri) // Mint para endereço
- setMintPrice(uint256 price)           // Definir preço
- toggleMinting()                        // Ativar/desativar mint
- withdraw()                             // Retirar fundos
```

**Características:**
- Preço de mint: 0.01 ETH (configurável)
- Limite por carteira: 10 NFTs
- Royalties: 2.5%
- Metadata URI customizável

### 3.3 ArcMarketplace

Marketplace descentralizado para NFTs:

```solidity
// Funcionalidades principais
- listNFT(address nft, uint256 tokenId, uint256 price)
- buyNFT(uint256 listingId) payable
- cancelListing(uint256 listingId)
- updatePrice(uint256 listingId, uint256 newPrice)
```

**Características:**
- Taxa do marketplace: 2.5%
- Suporte a múltiplas coleções
- Listagem e cancelamento gratuitos
- Pagamento automático ao vendedor

### 3.4 ArcVault (Staking)

Sistema de staking com recompensas:

```solidity
// Funcionalidades principais
- stake(uint256 amount)                  // Fazer stake
- unstake(uint256 amount)                // Retirar stake
- claimRewards()                         // Reivindicar recompensas
- emergencyWithdraw()                    // Retirada de emergência
```

**Características:**
- APY: ~12% (configurável)
- Período mínimo: 7 dias
- Taxa de retirada antecipada: 5%
- Recompensas calculadas por segundo

### 3.5 ArcGovernance (DAO)

Sistema de governança descentralizada:

```solidity
// Funcionalidades principais
- propose(targets, values, calldatas, description)
- castVote(uint256 proposalId, uint8 support)
- queue(uint256 proposalId)
- execute(uint256 proposalId)
```

**Parâmetros:**
- Voting Delay: 1 dia (7200 blocos)
- Voting Period: 1 semana (50400 blocos)
- Proposal Threshold: 1000 ARC
- Quorum: 4% do supply

### 3.6 ArcTimelock

Timelock para execução segura:

```solidity
// Parâmetros
- Delay mínimo: 24 horas
- Proposers: Contrato Governor
- Executors: Qualquer endereço
```

---

## 4. API Backend

### 4.1 Procedures tRPC

#### Autenticação

```typescript
// Authentication
auth.me.useQuery()           // Obter usuário atual
auth.logout.useMutation()    // Fazer logout
```

#### Contratos

```typescript
// CRUD de contratos
contract.list.useQuery()                    // Listar contratos
contract.get.useQuery({ id })               // Obter contrato
contract.create.useMutation()               // Criar contrato
contract.update.useMutation()               // Atualizar contrato
contract.delete.useMutation()               // Deletar contrato
contract.compile.useMutation()              // Compilar contrato
contract.generateTypescript.useMutation()   // Gerar tipos TS
```

#### Projetos

```typescript
project.list.useQuery()      // Listar projetos
project.get.useQuery({ id }) // Obter projeto
project.create.useMutation() // Criar projeto
project.update.useMutation() // Atualizar projeto
project.delete.useMutation() // Deletar projeto
```

#### Templates

```typescript
template.list.useQuery()     // Listar templates disponíveis
```

#### Gas Tracker

```typescript
gasPrice.latest.useQuery()   // Preços de gas atuais
```

#### Segurança

```typescript
security.analyze.useMutation() // Analisar contrato
```

### 4.2 Schema do Banco de Dados

```sql
-- Usuários
users (id, openId, name, avatar, role, createdAt, updatedAt)

-- Projetos
projects (id, userId, name, description, network, status, createdAt, updatedAt)

-- Contratos
contracts (id, userId, projectId, name, sourceCode, abi, bytecode, address, network, status, createdAt, updatedAt)

-- Templates
contractTemplates (id, name, description, category, sourceCode, abi, isActive, createdAt)

-- Redes
networks (id, name, chainId, rpcUrl, explorerUrl, nativeCurrency, isTestnet, isActive)

-- Transações
transactions (id, userId, contractId, txHash, type, status, gasUsed, createdAt)

-- Carteiras
wallets (id, userId, address, name, isDefault, createdAt)

-- NFTs
nfts (id, userId, contractAddress, tokenId, name, description, imageUrl, network, createdAt)

-- Stakes
stakes (id, userId, amount, rewardDebt, stakedAt, lastClaimAt)
```

---

## 5. Frontend

### 5.1 Páginas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Home | Landing page |
| `/dashboard` | Dashboard | Painel principal |
| `/projects` | Projects | Gerenciamento de projetos |
| `/contracts` | Contracts | Editor de contratos |
| `/deploy` | Deploy | Deploy de contratos |
| `/templates` | Templates | Templates disponíveis |
| `/staking` | Staking | Sistema de staking |
| `/nft-marketplace` | NFTMarketplace | Marketplace de NFTs |
| `/governance` | Governance | Governança DAO |
| `/transactions` | Transactions | Histórico de transações |
| `/gas-tracker` | GasTracker | Monitor de gas |
| `/wallets` | Wallets | Gerenciamento de carteiras |
| `/networks` | Networks | Configuração de redes |
| `/security-scanner` | SecurityScanner | Scanner de segurança |
| `/contract-debugger` | ContractDebugger | Debugger de contratos |
| `/docs` | Documentation | Documentação |
| `/settings` | Settings | Configurações |

### 5.2 Hooks Customizados

```typescript
// Conexão de carteira
useWallet()        // Estado da carteira conectada
useContract()      // Interação com contratos
useNetwork()       // Rede atual

// Dados
useAuth()          // Estado de autenticação
useI18n()          // Internacionalização
```

### 5.3 Internacionalização

O sistema suporta Português (PT) e Inglês (EN):

```typescript
import { useI18n } from '@/i18n';

function Component() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => setLanguage('en')}>EN</button>
      <button onClick={() => setLanguage('pt')}>PT</button>
    </div>
  );
}
```

---

## 6. Governança DAO

### 6.1 Fluxo de Proposta

```
1. CRIAÇÃO
   └── Holder com 1000+ ARC cria proposta

2. VOTING DELAY (1 dia)
   └── Período para discussão antes da votação

3. VOTAÇÃO (1 semana)
   └── Holders votam: For, Against, Abstain

4. QUORUM CHECK
   └── Mínimo 4% do supply deve votar

5. QUEUE (se aprovada)
   └── Proposta entra na fila do Timelock

6. TIMELOCK (24 horas)
   └── Período de espera antes da execução

7. EXECUÇÃO
   └── Qualquer pessoa pode executar
```

### 6.2 Categorias de Propostas

- **Treasury** - Transferência de fundos, investimentos
- **Protocol** - Mudanças em parâmetros do protocolo
- **Community** - Grants, parcerias, marketing
- **Emergency** - Ações urgentes de segurança

### 6.3 Poder de Voto

O poder de voto é baseado em tokens ARC delegados:

```solidity
// Delegar votos para si mesmo
arcToken.delegate(myAddress);

// Delegar votos para outro endereço
arcToken.delegate(delegateeAddress);

// Verificar poder de voto
arcToken.getVotes(address);
```

---

## 7. Segurança

### 7.1 Práticas Implementadas

- **Contratos OpenZeppelin** - Biblioteca auditada e testada
- **Reentrancy Guards** - Proteção contra reentrância
- **Access Control** - Controle de acesso baseado em roles
- **Timelock** - Delay obrigatório para ações críticas
- **Input Validation** - Validação de todos os inputs

### 7.2 Security Scanner

O scanner analisa contratos para:

- Reentrância
- Overflow/Underflow
- Acesso não autorizado
- Funções não protegidas
- Uso de tx.origin
- Dependência de timestamp

### 7.3 Recomendações

1. **Nunca** compartilhe sua private key
2. **Sempre** verifique o endereço do contrato antes de interagir
3. **Use** hardware wallets para grandes quantias
4. **Revogue** aprovações de contratos não utilizados
5. **Teste** em testnet antes de mainnet

---

## 8. Deploy e Configuração

### 8.1 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
JWT_SECRET=seu-jwt-secret

# Blockchain
PRIVATE_KEY=sua-private-key-para-deploy

# APIs externas (opcional)
ETHERSCAN_API_KEY=sua-api-key
```

### 8.2 Deploy de Contratos

```bash
# Compilar
npx hardhat compile

# Deploy Sepolia
npx hardhat run scripts/deploy.mjs --network sepolia

# Deploy Arc Testnet
npx hardhat run scripts/deploy.mjs --network arcTestnet

# Verificar no Etherscan
npx hardhat verify --network sepolia ENDERECO_CONTRATO
```

### 8.3 Seeds do Banco

```bash
# Popular templates e redes
node scripts/seed-data.mjs
```

---

## Suporte

Para dúvidas ou sugestões:

- **Twitter:** [@smartcript](https://x.com/smartcript)
- **GitHub Issues:** [Abrir issue](https://github.com/rissonwill/arc-safewallet/issues)

---

<div align="center">

**Documentação criada por [@smartcript](https://x.com/smartcript)**

</div>
