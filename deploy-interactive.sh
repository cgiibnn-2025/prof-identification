#!/bin/bash

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER="root@213.136.86.229"
SERVER_PATH="/opt/idprof.bnn"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ DÉPLOIEMENT - PROF IDENTIFICATION      ║${NC}"
echo -e "${BLUE}║ SQLite Version                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# Étape 1: Build
echo ""
echo -e "${YELLOW}[1/7]${NC} Vérification du build..."
if [ ! -d "./dist" ]; then
    echo -e "${YELLOW}→${NC} Building..."
    npm run build
    echo -e "${GREEN}✓${NC} Build prêt"
else
    echo -e "${GREEN}✓${NC} Build existe déjà"
fi

# Étape 2: SSH test
echo ""
echo -e "${YELLOW}[2/7]${NC} Test de connexion SSH..."
if ssh -o ConnectTimeout=5 "$SERVER" "echo 'SSH OK'" > /dev/null; then
    echo -e "${GREEN}✓${NC} Connexion SSH établie"
else
    echo -e "${RED}✗${NC} Impossible de se connecter via SSH"
    exit 1
fi

# Étape 3: Arrêt serveur
echo ""
echo -e "${YELLOW}[3/7]${NC} Arrêt du serveur distant..."
ssh "$SERVER" "pkill -f 'node server.js' 2>/dev/null || true; sleep 1" || true
echo -e "${GREEN}✓${NC} Serveur arrêté"

# Étape 4: Nettoyage
echo ""
echo -e "${YELLOW}[4/7]${NC} Nettoyage de la base de données..."
ssh "$SERVER" "rm -f $SERVER_PATH/database/professeurs.db"
echo -e "${GREEN}✓${NC} DB supprimée (sera recréée)"

# Étape 5: Copie des fichiers
echo ""
echo -e "${YELLOW}[5/7]${NC} Copie des fichiers..."
cd dist
rsync -avz \
    --exclude='*.db' \
    --exclude='*.log' \
    --exclude='node_modules' \
    --delete \
    . "$SERVER:$SERVER_PATH/" \
    | grep -E '(^sending|^receiving|^deleting|^$)' || true
cd ..
echo -e "${GREEN}✓${NC} Fichiers transférés"

# Étape 6: Installation dépendances
echo ""
echo -e "${YELLOW}[6/7]${NC} Installation des dépendances..."
ssh "$SERVER" "cd $SERVER_PATH && npm install --production --no-optional 2>&1" | tail -5
echo -e "${GREEN}✓${NC} Dépendances installées"

# Étape 7: Démarrage
echo ""
echo -e "${YELLOW}[7/7]${NC} Démarrage du serveur..."
ssh "$SERVER" "cd $SERVER_PATH && nohup node server.js > server.log 2>&1 &"
sleep 3

# Vérification
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DÉPLOIEMENT TERMINÉ!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

echo ""
echo "📊 Vérification des logs:"
ssh "$SERVER" "tail -15 $SERVER_PATH/server.log"

echo ""
echo -e "${GREEN}📍 Application:${NC} http://213.136.86.229:3000"
echo -e "${GREEN}🔑 Admin:${NC} admin / admin123"
echo ""
echo -e "${YELLOW}💡 Pour voir les logs en direct:${NC}"
echo "   ssh $SERVER 'tail -f $SERVER_PATH/server.log'"
echo ""
