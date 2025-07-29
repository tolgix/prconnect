#!/bin/bash

echo "🚀 PRConnect - PR Bülten Yönetim Sistemi Başlatılıyor..."
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# MongoDB kontrolü
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}❌ MongoDB yüklü değil. Lütfen önce MongoDB'yi yükleyin.${NC}"
    echo "MongoDB kurulum: https://docs.mongodb.com/manual/installation/"
    exit 1
fi

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js yüklü değil. Lütfen önce Node.js'yi yükleyin.${NC}"
    echo "Node.js kurulum: https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}📦 Bağımlılıklar kuruluyor...${NC}"

# Frontend bağımlılıkları
echo -e "${YELLOW}Frontend bağımlılıkları kuruluyor...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend bağımlılıkları kurulamadı.${NC}"
    exit 1
fi

# Backend bağımlılıkları
echo -e "${YELLOW}Backend bağımlılıkları kuruluyor...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend bağımlılıkları kurulamadı.${NC}"
    exit 1
fi

cd ..

echo -e "${GREEN}✅ Bağımlılıklar başarıyla kuruldu!${NC}"
echo ""

# MongoDB başlatma kontrol
echo -e "${BLUE}🗄️  MongoDB kontrol ediliyor...${NC}"
if ! pgrep mongod > /dev/null; then
    echo -e "${YELLOW}MongoDB başlatılıyor...${NC}"
    # MongoDB'yi arka planda başlat
    mongod --fork --logpath /var/log/mongodb.log --dbpath ./data/db 2>/dev/null || {
        echo -e "${YELLOW}Varsayılan MongoDB başlatma denemesi...${NC}"
        mkdir -p ./data/db
        mongod --dbpath ./data/db &
    }
    sleep 3
else
    echo -e "${GREEN}✅ MongoDB zaten çalışıyor.${NC}"
fi

# Seed verilerini yükle
echo -e "${BLUE}🌱 Seed veriler yükleniyor...${NC}"
cd backend
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Seed veriler yüklenemedi, devam ediliyor...${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}🎉 PRConnect başarıyla kuruldu!${NC}"
echo ""
echo -e "${BLUE}📱 Demo Hesaplar:${NC}"
echo -e "${GREEN}👑 Admin:      admin@prconnect.com / admin123${NC}"
echo -e "${GREEN}👨‍💼 Manager:    mehmet@prconnect.com / mehmet123${NC}"
echo -e "${GREEN}📝 Data Entry: ayse@prconnect.com / ayse123${NC}"
echo -e "${GREEN}👁️  Viewer:     can@prconnect.com / can123${NC}"
echo ""

# Servisleri başlat
echo -e "${BLUE}🚀 Servisler başlatılıyor...${NC}"
echo ""

# Terminal açılabilir kontrolü
if command -v gnome-terminal &> /dev/null; then
    TERMINAL_CMD="gnome-terminal"
elif command -v xfce4-terminal &> /dev/null; then
    TERMINAL_CMD="xfce4-terminal"
elif command -v konsole &> /dev/null; then
    TERMINAL_CMD="konsole"
elif command -v xterm &> /dev/null; then
    TERMINAL_CMD="xterm"
else
    echo -e "${YELLOW}⚠️  Terminal emülatörü bulunamadı. Manuel başlatma gerekli.${NC}"
    echo ""
    echo -e "${BLUE}Manuel başlatma için:${NC}"
    echo -e "${YELLOW}Terminal 1: cd backend && npm run dev${NC}"
    echo -e "${YELLOW}Terminal 2: npm start${NC}"
    echo ""
    echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}🔧 Backend:  http://localhost:5000${NC}"
    exit 0
fi

# Backend'i yeni terminalde başlat
echo -e "${BLUE}🔧 Backend başlatılıyor (http://localhost:5000)...${NC}"
$TERMINAL_CMD --title="PRConnect Backend" -- bash -c "cd backend && npm run dev; exec bash" &

# Kısa bekleme
sleep 2

# Frontend'i ana terminalde başlat
echo -e "${BLUE}🌐 Frontend başlatılıyor (http://localhost:3000)...${NC}"
echo ""
echo -e "${GREEN}✨ PRConnect hazır! Tarayıcınızda http://localhost:3000 adresini açın.${NC}"
echo ""

npm start