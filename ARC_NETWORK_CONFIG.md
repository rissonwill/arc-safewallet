# Arc Network - Configuração Oficial

## Arc Testnet

| Campo | Valor |
|-------|-------|
| **Network** | Arc Testnet |
| **Chain ID** | 5042002 |
| **Currency** | USDC |
| **Explorer** | https://testnet.arcscan.app |
| **Faucet** | https://faucet.circle.com |

### RPC Endpoints

**Principal:**
- https://rpc.testnet.arc.network

**Alternativos:**
- https://rpc.blockdaemon.testnet.arc.network
- https://rpc.drpc.testnet.arc.network
- https://rpc.quicknode.testnet.arc.network

### WebSocket

**Principal:**
- wss://rpc.testnet.arc.network

**Alternativos:**
- wss://rpc.drpc.testnet.arc.network
- wss://rpc.quicknode.testnet.arc.network

## Notas Importantes

1. **USDC é o token nativo de gas** - Diferente de outras redes EVM que usam ETH
2. **Chain ID em hexadecimal:** 0x4CEF52 (5042002 em decimal)
3. **Decimais do USDC:** 6 (não 18 como ETH)
4. **Faucet:** Obtenha USDC de teste em https://faucet.circle.com

## Configuração para MetaMask

```javascript
const arcTestnet = {
  chainId: '0x4CEF52', // 5042002
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app']
};
```


## Endereços de Contratos Oficiais - Arc Testnet

### Stablecoins

| Contrato | Endereço | Descrição |
|----------|----------|-----------|
| **USDC** | `0x3600000000000000000000000000000000000000` | Interface ERC-20 opcional para USDC nativo. Usa 6 decimais. |
| **EURC** | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | Token EURC (euro). Usa 6 decimais. |
| **USYC** | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | Token USYC (yield-bearing). Usa 6 decimais. |

### USYC Contratos Auxiliares

| Contrato | Endereço | Descrição |
|----------|----------|-----------|
| Entitlements | `0xcc205224862c7641930c87679e98999d23c26113` | Gerencia acesso e controles de permissão |
| Teller | `0x9fdF14c5B14173D74C08Af27AebFf39240dC105A` | Contrato para mint/redeem de USYC |

### CCTP (Cross-Chain Transfer Protocol)

| Contrato | Domain | Endereço |
|----------|--------|----------|
| TokenMessengerV2 | 26 | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| MessageTransmitterV2 | 26 | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |
| TokenMinterV2 | 26 | `0xb43db544E2c27092c107639Ad201b3dEfAbcF192` |
| MessageV2 | 26 | `0xbaC0179bB358A8936169a63408C8481D582390C4` |

## Notas sobre Decimais

**IMPORTANTE:** A Arc Network tem uma peculiaridade com USDC:
- **USDC nativo (gas token):** 18 decimais de precisão
- **USDC ERC-20 interface:** 6 decimais

Sempre use a função `decimals()` para interpretar saldos corretamente. Para aplicações integrando USDC, é recomendado usar exclusivamente a interface ERC-20 padrão.


## Gas e Fees - Arc Testnet

### Gas Mechanics

| Campo | Valor |
|-------|-------|
| **Unit** | USDC (18 decimais) |
| **Pricing** | EIP-1559-like base fee com exponentially weighted moving-average smoothing |
| **Base fee (testnet)** | ~160 Gwei mínimo |
| **Custo por transação** | ~$0.01 USD |

### Policy Overview

- A base fee é ajustada dinamicamente usando um mecanismo bounded, moving-average projetado para estabilizar em torno de 160 Gwei sob carga normal
- Transações com max fee abaixo de 160 Gwei podem ficar pendentes ou falhar
- Para garantir inclusão, configure `maxFeePerGas ≥ 160 Gwei`

### Best Practice

Busque a base fee dinamicamente ao submeter transações:

```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const feeData = await provider.getFeeData();
const maxFeePerGas = feeData.maxFeePerGas || parseUnits('160', 'gwei');
```

### Monitoring

Use o [Arc Gas Tracker](https://testnet.arcscan.app/gastracker) para ver métricas de gas em tempo real.


## Deterministic Finality

> Arc's deterministic finality provides instant, irreversible transaction settlement in under one second.

### Por que Deterministic Finality importa

Em chains proof-of-work ou muitas proof-of-stake, transações são consideradas *finais* apenas após múltiplas confirmações. Mesmo assim, há risco de reorganizações de chain que podem desfazer blocos recentes.

**Com Arc:**
- Uma transação está ou não confirmada, ou é final
- Não existe estado "provavelmente final"
- Uma vez final, a transação não pode ser revertida

### Sub-second Confirmation

O engine de consenso da Arc, **Malachite**, é uma implementação BFT de alta performance. Finaliza blocos em menos de um segundo.

**Benefícios:**
- Processar pagamentos point-of-sale sem esperar minutos por confirmação
- Suportar transferências cross-border que liquidam instantaneamente
- Habilitar trades institucionais e clearing com certeza imediata

### Benefícios para Desenvolvedores

- Não precisa construir lógica de retry ou rollback para reorgs
- Pode disparar efeitos offchain imediatamente após um bloco ser commitado
- Pode atender requisitos enterprise-grade para garantia de liquidação
