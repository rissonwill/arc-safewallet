#!/bin/bash

# ===========================================
# SCRIPT DE INSTALAÇÃO - Arc SafeWallet
# ===========================================

echo "🚀 Iniciando instalação do Arc SafeWallet..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ NPM encontrado: $(npm --version)"
echo ""

# Instalar dependências do projeto
echo "📦 Instalando dependências do projeto..."
npm install

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    echo "# Arc SafeWallet Environment" > .env
    echo "PRIVATE_KEY=sua_chave_privada_aqui" >> .env
    echo "ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network" >> .env
    echo "SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com" >> .env
    echo "ETHERSCAN_API_KEY=" >> .env
    echo "✅ Arquivo .env criado!"
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e adicione sua PRIVATE_KEY"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p contracts
mkdir -p scripts
mkdir -p test
mkdir -p deployments
mkdir -p client/src/abis
mkdir -p client/src/hooks
mkdir -p client/src/components
mkdir -p client/src/utils

echo "✅ Diretórios criados!"
echo ""

# Compilar contratos (se existirem)
if [ -d "contracts" ] && [ "$(ls -A contracts)" ]; then
    echo "🔨 Compilando contratos..."
    npx hardhat compile
    
    if [ $? -eq 0 ]; then
        echo "✅ Contratos compilados com sucesso!"
    else
        echo "⚠️  Aviso: Erro ao compilar contratos"
    fi
else
    echo "ℹ️  Nenhum contrato encontrado para compilar"
fi

echo ""
echo "=========================================="
echo "🎉 INSTALAÇÃO COMPLETA!"
echo "=========================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure o arquivo .env com sua PRIVATE_KEY:"
echo "   nano .env"
echo ""
echo "2. Obtenha tokens de teste:"
echo "   Arc Testnet: https://faucet.circle.com/"
echo "   Sepolia: https://sepoliafaucet.com/"
echo ""
echo "3. Compile os contratos:"
echo "   npx hardhat compile"
echo ""
echo "4. Deploy na Arc Testnet:"
echo "   npx hardhat run scripts/deploy.ts --network arcTestnet"
echo ""
echo "5. Deploy na Sepolia:"
echo "   npx hardhat run scripts/deploy.ts --network sepolia"
echo ""
echo "6. Inicie o servidor de desenvolvimento:"
echo "   pnpm dev"
echo ""
echo "=========================================="
echo ""
