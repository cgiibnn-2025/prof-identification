#!/bin/bash

echo "🚀 Installation complète sur le serveur"
echo "========================================"
echo ""

ssh root@213.136.86.229 << 'ENDSSH'

cd /opt/idprof.bnn/

echo "📦 Installation des dépendances Node.js..."
npm install --production
echo ""

echo "🗄️  Création du dossier database s'il n'existe pas..."
mkdir -p database
mkdir -p files
echo ""

echo "🔑 Création des permissions..."
chmod 755 database
chmod 755 files
echo ""

echo "🔄 Arrêt des anciens processus..."
pkill -f "node server.js"
sleep 2
echo ""

echo "🚀 Démarrage du serveur..."
nohup node server.js > server.log 2>&1 &
echo "✅ Serveur démarré"
echo ""

echo "⏳ Attente de l'initialisation (5 secondes)..."
sleep 5
echo ""

echo "📋 Logs du serveur:"
tail -30 server.log
echo ""

echo "🔍 Vérification de la base de données:"
if [ -f "database/professeurs.db" ]; then
    echo "✅ Base de données créée!"
    echo ""
    echo "👤 Administrateurs dans la base:"
    sqlite3 database/professeurs.db "SELECT username, password, date_creation FROM administrateurs;"
else
    echo "❌ Base de données non créée"
fi

ENDSSH

echo ""
echo "✅ Installation terminée!"
echo ""
echo "🌐 Votre application devrait être accessible sur:"
echo "   http://213.136.86.229:3000"
echo ""
echo "🔐 Identifiants admin:"
echo "   Username: admin"
echo "   Password: admin123"
