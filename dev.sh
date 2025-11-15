#!/bin/bash

echo "🚀 Starting LMS Frontend Development"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    pnpm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies ready${NC}"
fi

echo ""
echo -e "${GREEN}✅ Frontend ready!${NC}"
echo -e "${BLUE}🚀 Starting development server...${NC}"
echo -e "${YELLOW}📝 Backend should be running at http://localhost:3000${NC}"
echo ""

# Start dev server
pnpm dev

