# Arc SafeWallet 🛡️

<div align="center">

![Arc SafeWallet](https://img.shields.io/badge/Arc-SafeWallet-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-magenta?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)

**Plataforma Web3 completa para gerenciamento de smart contracts, governança DAO e ativos digitais**

[Demo](https://arc-safewallet.manus.space) · [Documentação](./DOCS.md) · [Contratos](#-contratos-deployados) · [Twitter](https://x.com/smartcript)

---

### 🚀 Criado por [@smartcript](https://x.com/smartcript)

</div>

---

## 📋 Sobre o Projeto

Arc SafeWallet é uma plataforma Web3 completa para desenvolvedores e usuários que desejam criar, gerenciar e interagir com smart contracts de forma segura e intuitiva. Inclui sistema de governança DAO para decisões descentralizadas da comunidade.

### ✨ Funcionalidades Principais

| Categoria | Funcionalidades |
|-----------|-----------------|
| **Carteiras** | Conexão MetaMask, Multi-chain, Gerenciamento de ativos |
| **Contratos** | Editor Solidity, Compilação real (solc-js), Deploy simplificado |
| **Governança** | DAO completa, Propostas, Votação on-chain, Timelock |
| **NFTs** | Marketplace, Criação de coleções, Compra/Venda |
| **DeFi** | Staking com recompensas, Vault seguro, APY automático |
| **Segurança** | Scanner de vulnerabilidades, Debugger, Análise de código |
| **UX** | Dashboard completo, Gas Tracker, Multi-idioma (PT/EN) |

---

## 🏛️ Governança DAO

O Arc SafeWallet inclui um sistema de governança descentralizada completo:

### Como Funciona

1. **Holders de ARC** podem criar propostas
2. **Votação** baseada em tokens (1 token = 1 voto)
3. **Quorum** de 4% para aprovação
4. **Timelock** de 24h antes da execução
5. **Execução automática** após aprovação

### Categorias de Propostas

- **Treasury** - Gestão de fundos da DAO
- **Protocol** - Mudanças no protocolo
- **Community** - Iniciativas da comunidade
- **Emergency** - Ações urgentes

---

## 🛠️ Tecnologias

### Frontend
- **React 19** + **TypeScript** - Interface moderna e tipada
- **Tailwind CSS 4** + **shadcn/ui** - Design system consistente
- **tRPC** - API type-safe end-to-end
- **ethers.js v6** - Interação com blockchain

### Backend
- **Node.js** + **Express** - Servidor robusto
- **Drizzle ORM** - ORM type-safe
- **MySQL/TiDB** - Banco de dados escalável

### Blockchain
- **Solidity 0.8.20** - Smart contracts seguros
- **OpenZeppelin 5.0** - Contratos auditados
- **Hardhat** - Framework de desenvolvimento
- **solc-js** - Compilação no navegador

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- MetaMask ou carteira compatível

### Instalação

```bash
# Clone o repositório
git clone https://github.com/rissonwill/arc-safewallet.git
cd arc-safewallet

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o servidor de desenvolvimento
pnpm dev
```

### Compilar Contratos

```bash
# Compilar todos os contratos
npx hardhat compile

# Deploy na Sepolia
npx hardhat run scripts/deploy.mjs --network sepolia

# Deploy na Arc Testnet
npx hardhat run scripts/deploy.mjs --network arcTestnet
```

---

## 📦 Contratos Deployados

### Sepolia Testnet (Chain ID: 11155111)

| Contrato | Endereço | Descrição |
|----------|----------|-----------|
| ArcToken | `0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC` | Token ERC-20 com votação |
| ArcNFT | `0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7` | Coleção NFT ERC-721 |
| ArcMarketplace | `0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2` | Marketplace de NFTs |
| ArcVault | `0xBE21597B385F299CbBF71725823A5E1aD810973f` | Vault de Staking |

### Contratos de Governança

| Contrato | Descrição |
|----------|-----------|
| ArcGovernance | Governor com votação baseada em tokens |
| ArcTimelock | Timelock para execução segura |

---

## 📁 Estrutura do Projeto

```
arc-safewallet/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks (Web3, contratos)
│   │   ├── lib/            # Utilitários e configurações
│   │   └── i18n/           # Internacionalização (PT/EN)
├── server/                 # Backend Express/tRPC
│   ├── routers.ts          # Procedures tRPC
│   ├── db.ts               # Helpers de banco de dados
│   ├── solcCompiler.ts     # Compilador Solidity
│   └── _core/              # Infraestrutura
├── contracts/              # Smart contracts Solidity
│   ├── ArcToken.sol        # Token ERC-20
│   ├── ArcNFT.sol          # NFT ERC-721
│   ├── ArcMarketplace.sol  # Marketplace
│   ├── ArcVault.sol        # Staking Vault
│   ├── ArcGovernance.sol   # Governança DAO
│   └── ArcTimelock.sol     # Timelock
├── drizzle/                # Schema do banco de dados
├── scripts/                # Scripts de deploy e seed
└── deployments/            # Artefatos de deploy
```

---

## 🌐 Redes Suportadas

| Rede | Chain ID | Tipo | Status |
|------|----------|------|--------|
| Arc Testnet | 5042002 | Testnet | 🟡 Em desenvolvimento |
| Sepolia | 11155111 | Testnet | 🟢 Ativo |
| Ethereum | 1 | Mainnet | 🟢 Suportado |
| Polygon | 137 | Mainnet | 🟢 Suportado |
| Arbitrum | 42161 | Mainnet | 🟢 Suportado |
| Optimism | 10 | Mainnet | 🟢 Suportado |
| Base | 8453 | Mainnet | 🟢 Suportado |
| BSC | 56 | Mainnet | 🟢 Suportado |

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Testes com watch mode
pnpm test:watch

# Testes de contratos
npx hardhat test
```

**Status atual:** 46 testes passando ✅

---

## 📖 Documentação

Para documentação completa, consulte:

- [DOCS.md](./DOCS.md) - Documentação técnica completa
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Guia de deploy
- [QUICK_START.md](./QUICK_START.md) - Início rápido
- [ARC_NETWORK_CONFIG.md](./ARC_NETWORK_CONFIG.md) - Configuração Arc Network

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

<div align="center">

### Criado com 💜 por [@smartcript](https://x.com/smartcript)

[![Twitter Follow](https://img.shields.io/twitter/follow/smartcript?style=social)](https://x.com/smartcript)

**Siga no Twitter para atualizações e novos projetos!**

</div>

---

## 🙏 Agradecimentos

- [OpenZeppelin](https://openzeppelin.com/) - Contratos seguros e auditados
- [Arc Network](https://arc.network/) - Infraestrutura blockchain
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- Comunidade Web3 brasileira 🇧🇷

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

</div>
