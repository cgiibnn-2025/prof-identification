#!/bin/bash

echo "🔧 Script de vérification et réparation de l'admin"
echo "=================================================="
echo ""

# Se connecter au serveur et exécuter les commandes
ssh root@213.136.86.229 << 'ENDSSH'

echo "📍 Répertoire de l'application:"
cd /opt/idprof.bnn/
pwd
echo ""

echo "📁 Vérification des fichiers:"
ls -la database/
echo ""

echo "🔍 Vérification de la base de données:"
if [ -f "database/professeurs.db" ]; then
    echo "✅ Base de données existe"
    echo ""
    echo "👤 Contenu de la table administrateurs:"
    sqlite3 database/professeurs.db "SELECT * FROM administrateurs;" 2>/dev/null || echo "⚠️  Table administrateurs n'existe pas ou erreur"
else
    echo "❌ Base de données n'existe pas!"
fi
echo ""

echo "🔄 Redémarrage du serveur Node.js..."
# Trouver et tuer le processus Node.js
pkill -f "node server.js"
sleep 2

# Redémarrer le serveur en arrière-plan
cd /opt/idprof.bnn/
nohup node server.js > server.log 2>&1 &
echo "✅ Serveur redémarré"
echo ""

echo "📋 Dernières lignes du log:"
sleep 2
tail -20 server.log

ENDSSH

echo ""
echo "✅ Terminé!"
