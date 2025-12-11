# Changelog

All notable changes to Arc SafeWallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-11

### Added
- **Smart Contract Development**
  - Solidity compiler integration (solc-js 0.8.26)
  - Real-time compilation with error highlighting
  - Contract templates (ERC-20, ERC-721, ERC-1155, Staking, Marketplace)
  - Security scanner for vulnerability detection

- **Multi-Chain Deployment**
  - One-click deployment to multiple networks
  - Support for Arc Network, Ethereum, Sepolia, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche
  - Automatic contract verification on Etherscan

- **Governance (DAO)**
  - On-chain voting system
  - Proposal creation and management
  - Vote delegation
  - Timelock controller for secure execution

- **Wallet Integration**
  - MetaMask support
  - WalletConnect integration
  - Coinbase Wallet support
  - Trust Wallet support
  - Rainbow and Phantom wallet support

- **NFT Marketplace**
  - Mint, list, and trade NFTs
  - Collection management
  - Royalty configuration

- **Staking**
  - Token staking vault
  - APY tracking
  - Reward distribution

- **User Interface**
  - Cyber punk themed design
  - Responsive layout (mobile/tablet/desktop)
  - Bilingual support (English/Portuguese)
  - Interactive tutorial for new users
  - Real-time gas tracker

### Security
- JWT-based authentication
- Protected API routes
- Input validation and sanitization
- Rate limiting on sensitive endpoints

### Deployed Contracts

**Sepolia Testnet (Chain ID: 11155111)**
- ArcToken: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- ArcNFT: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- ArcMarketplace: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`
- ArcVault: `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0`
- ArcGovernance: `0x693405999755d7Fea40D635ddE861AAc462EC1f8`
- ArcTimelock: `0x3A0671E9E966213D3d73ed1841E33879B37146fe`

**Arc Network Testnet (Chain ID: 5042002)**
- ArcToken: `0x7D54337E4AA62fbccf6061315F68e4Bc29EBea5D`
- ArcNFT: `0x0656B33CFfB2c6c46c06664E86DCD268e2d42DcC`
- ArcMarketplace: `0x5c4feae8C6CA8A31a5feB4Fc9b3e3aeD5882CaA7`
- ArcVault: `0x7b0d9163b451C4565d488Df49aaD76fa0bac50A2`

---

## [Unreleased]

### Planned
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-signature wallet support
- Cross-chain bridge integration
- Token swap functionality
