# Arc SafeWallet 🛡️

<div align="center">

![Arc SafeWallet](https://img.shields.io/badge/Arc-SafeWallet-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-magenta?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Plataforma completa para gerenciamento de smart contracts e ativos digitais**

[Demo](https://arc-safewallet.manus.space) · [Documentação](#documentação) · [Contratos](#contratos-deployados)

</div>

---

## 📋 Sobre o Projeto

Arc SafeWallet é uma plataforma Web3 completa para desenvolvedores e usuários que desejam criar, gerenciar e interagir com smart contracts de forma segura e intuitiva. Construída com tecnologias modernas e focada na experiência do usuário.

### ✨ Funcionalidades Principais

- **🔐 Conexão de Carteiras** - Suporte a MetaMask com integração nativa
- **📝 Editor de Contratos** - Crie e edite contratos Solidity com syntax highlighting
- **⚙️ Compilação Real** - Compilação de contratos usando solc-js
- **🚀 Deploy Simplificado** - Deploy de contratos em múltiplas redes
- **📊 Dashboard Completo** - Visualize seus projetos, contratos e transações
- **💰 Staking** - Sistema de staking com recompensas automáticas
- **🖼️ NFT Marketplace** - Compre, venda e crie NFTs
- **⛽ Gas Tracker** - Monitore preços de gas em tempo real
- **🔒 Security Scanner** - Análise de vulnerabilidades em contratos
- **🌐 Multi-idioma** - Suporte a Português e Inglês

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes de UI
- **tRPC** - API type-safe
- **ethers.js** - Interação com blockchain

### Backend
- **Node.js** - Runtime
- **Express** - Servidor HTTP
- **tRPC** - Procedures type-safe
- **Drizzle ORM** - ORM para banco de dados
- **MySQL/TiDB** - Banco de dados

### Blockchain
- **Solidity** - Smart contracts
- **Hardhat** - Framework de desenvolvimento
- **OpenZeppelin** - Contratos seguros
- **solc-js** - Compilador Solidity

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- MetaMask ou carteira compatível

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/arc-safewallet.git
cd arc-safewallet

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=seu-jwt-secret
PRIVATE_KEY=sua-private-key-para-deploy
```

---

## 📦 Contratos Deployados

### Sepolia Testnet (Chain ID: 11155111)

| Contrato | Endereço | Verificado |
|----------|----------|------------|
| ArcToken | `0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC` | ✅ |
| ArcNFT | `0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7` | ✅ |
| ArcMarketplace | `0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2` | ✅ |
| ArcVault | `0xBE21597B385F299CbBF71725823A5E1aD810973f` | ✅ |

---

## 📁 Estrutura do Projeto

```
arc-safewallet/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários e configurações
│   │   └── i18n/           # Internacionalização
├── server/                 # Backend Express/tRPC
│   ├── routers.ts          # Procedures tRPC
│   ├── db.ts               # Helpers de banco de dados
│   └── _core/              # Infraestrutura
├── contracts/              # Smart contracts Solidity
├── drizzle/                # Schema do banco de dados
├── scripts/                # Scripts de deploy e seed
└── deployments/            # Artefatos de deploy
```

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com watch
pnpm test:watch

# Compilar contratos
npx hardhat compile

# Deploy de contratos
npx hardhat run scripts/deploy.mjs --network sepolia
```

---

## 🌐 Redes Suportadas

| Rede | Chain ID | Tipo |
|------|----------|------|
| Arc Testnet | 5042002 | Testnet |
| Sepolia | 11155111 | Testnet |
| Ethereum | 1 | Mainnet |
| Polygon | 137 | Mainnet |
| Arbitrum | 42161 | Mainnet |
| Optimism | 10 | Mainnet |
| Base | 8453 | Mainnet |
| BSC | 56 | Mainnet |
| Avalanche | 43114 | Mainnet |

---

## 📖 Documentação

### Templates de Contratos

A plataforma inclui 5 templates prontos para uso:

1. **ERC-20 Token** - Token fungível com mint/burn
2. **ERC-721 NFT** - Coleção de NFTs com mint público
3. **ERC-1155 Multi-Token** - Tokens fungíveis e não-fungíveis
4. **Staking Vault** - Sistema de staking com recompensas
5. **NFT Marketplace** - Marketplace descentralizado

### API

A API é construída com tRPC, oferecendo tipagem end-to-end:

```typescript
// Exemplo de uso no frontend
const { data } = trpc.contract.list.useQuery();
const mutation = trpc.contract.compile.useMutation();
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de enviar PRs.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Arc Network Team** - Desenvolvimento inicial

---

<div align="center">

**Feito com ❤️ para a comunidade Web3**

</div>
