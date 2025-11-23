#!/bin/bash

# Script de déploiement complet
# Usage: ./deploy.sh

set -e  # Arrêter si erreur

echo "🚀 Déploiement en cours..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_IP="213.136.86.229"
SERVER_USER="root"
SERVER_PATH="/opt/idprof.bnn"
DIST_DIR="./dist"

# Vérifier que le build existe
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ Erreur: $DIST_DIR n'existe pas${NC}"
    echo "Exécutez d'abord: npm run build"
    exit 1
fi

echo -e "${BLUE}[1]${NC} Arrêt du serveur distant..."
ssh "$SERVER_USER@$SERVER_IP" 'pkill -f "node server.js" 2>/dev/null || true; sleep 2; echo "✅ Serveur arrêté"'

echo -e "${BLUE}[2]${NC} Suppression de l'ancienne base de données..."
ssh "$SERVER_USER@$SERVER_IP" "rm -f $SERVER_PATH/database/professeurs.db; echo '✅ DB supprimée'"

echo -e "${BLUE}[3]${NC} Création des répertoires..."
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH/database $SERVER_PATH/files; echo '✅ Répertoires créés'"

echo -e "${BLUE}[4]${NC} Copie des fichiers (excepté database/*.db)..."
rsync -avz \
    --exclude='*.db' \
    --exclude='*.db-journal' \
    --exclude='node_modules' \
    --delete \
    "$DIST_DIR/" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

echo -e "${BLUE}[5]${NC} Installation des dépendances..."
ssh "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && npm install --production --no-optional"

echo -e "${BLUE}[6]${NC} Démarrage du serveur..."
ssh "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && nohup node server.js > server.log 2>&1 &"

# Attendre que le serveur démarre
sleep 3

echo -e "${BLUE}[7]${NC} Vérification du démarrage..."
ssh "$SERVER_USER@$SERVER_IP" "sleep 2; tail -10 $SERVER_PATH/server.log"

echo ""
echo -e "${GREEN}✅ Déploiement réussi!${NC}"
echo ""
echo "📍 Application accessible sur: http://$SERVER_IP:3000"
echo "🔑 Admin: admin / admin123"
echo ""
echo "📊 Logs en direct:"
echo "   ssh root@$SERVER_IP 'tail -f $SERVER_PATH/server.log'"
