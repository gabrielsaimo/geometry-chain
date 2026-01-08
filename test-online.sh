#!/bin/bash

echo "🧪 Testando Modo Online do Geometry Chain"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Verificando dependências...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js instalado${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm instalado${NC}"

echo ""
echo -e "${YELLOW}2. Instalando dependências...${NC}"
npm install

echo ""
echo -e "${YELLOW}3. Verificando build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build bem-sucedido!${NC}"
else
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}4. Iniciando servidor local...${NC}"
echo -e "${GREEN}Acesse: http://localhost:5173${NC}"
echo ""
echo "Para testar o modo online:"
echo "1. Abra em duas janelas/abas diferentes"
echo "2. Em uma, clique 'Criar Sala' e copie o código"
echo "3. Na outra, clique 'Entrar em Sala' e cole o código"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor${NC}"
echo ""

npm run dev
