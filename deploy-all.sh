#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY COMPLETO - Arc SafeWallet
# ===========================================

set -e  # Parar em caso de erro

echo "🚀 INICIANDO PROCESSO DE DEPLOY COMPLETO"
echo "========================================"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Execute: cp .env.example .env"
    echo "E configure sua PRIVATE_KEY"
    exit 1
fi

# Verificar se PRIVATE_KEY está configurada
if ! grep -q "PRIVATE_KEY=0x" .env && ! grep -q "PRIVATE_KEY=[a-fA-F0-9]" .env; then
    echo "❌ PRIVATE_KEY não configurada no arquivo .env!"
    echo "Edite o arquivo .env e adicione sua chave privada"
    exit 1
fi

echo "✅ Arquivo .env configurado"
echo ""

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
npx hardhat clean
rm -rf artifacts
rm -rf cache
echo "✅ Build limpo"
echo ""

# Compilar contratos
echo "🔨 Compilando contratos..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação dos contratos!"
    exit 1
fi

echo "✅ Contratos compilados com sucesso!"
echo ""

# Perguntar em qual rede fazer deploy
echo "Selecione a rede para deploy:"
echo "1) Arc Testnet"
echo "2) Sepolia"
echo "3) Ambas"
echo "4) Localhost (teste)"
read -p "Escolha (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📡 Fazendo deploy na Arc Testnet..."
        echo "===================================="
        npx hardhat run scripts/deploy.ts --network arcTestnet
        ;;
    2)
        echo ""
        echo "📡 Fazendo deploy na Sepolia..."
        echo "================================"
        npx hardhat run scripts/deploy.ts --network sepolia
        ;;
    3)
        echo ""
        echo "📡 Fazendo deploy na Arc Testnet..."
        echo "===================================="
        npx hardhat run scripts/deploy.ts --network arcTestnet
        
        echo ""
        echo "📡 Fazendo deploy na Sepolia..."
        echo "================================"
        npx hardhat run scripts/deploy.ts --network sepolia
        ;;
    4)
        echo ""
        echo "📡 Fazendo deploy no Localhost..."
        echo "=================================="
        echo "⚠️  Certifique-se de que o Hardhat node está rodando!"
        echo "Execute em outro terminal: npx hardhat node"
        read -p "Pressione ENTER para continuar..."
        npx hardhat run scripts/deploy.ts --network localhost
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "🎉 DEPLOY COMPLETO!"
echo "========================================"
echo ""
echo "📋 Os endereços dos contratos foram salvos em:"
echo "   deployments/deployment-*.json"
echo ""
echo "📋 As ABIs foram salvas em:"
echo "   client/src/abis/"
echo ""
echo "🔍 Próximos passos:"
echo ""
echo "1. Verifique os endereços em deployments/"
echo "2. Atualize client/src/hooks/useContract.ts com os endereços"
echo "3. Teste os contratos no explorer"
echo "4. (Opcional) Verifique os contratos:"
echo "   npx hardhat verify --network <rede> <endereço>"
echo ""
echo "========================================"
echo ""
