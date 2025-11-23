#!/bin/bash

echo "🔍 DIAGNOSTIC ET CORRECTION DU LOGIN ADMIN"
echo "==========================================="
echo ""

ssh root@213.136.86.229 << 'ENDSSH'

cd /opt/idprof.bnn

echo "📍 Répertoire courant:"
pwd
echo ""

echo "🛑 Arrêt du serveur..."
pkill -f "node server.js"
sleep 2
echo "✅ Serveur arrêté"
echo ""

echo "🔍 Vérification de la base de données..."
if [ -f "database/professeurs.db" ]; then
    echo "✅ Base de données existe"
    echo ""
    
    echo "👤 Vérification du compte admin dans la base:"
    echo "SELECT * FROM administrateurs;" | sqlite3 database/professeurs.db
    echo ""
else
    echo "❌ Base de données n'existe pas"
    echo "Elle sera créée au redémarrage du serveur"
    echo ""
fi

echo "🔧 Suppression de la base de données pour la recréer..."
rm -f database/professeurs.db
echo "✅ Base de données supprimée"
echo ""

echo "🚀 Redémarrage du serveur (crée une nouvelle base)..."
nohup node server.js > server.log 2>&1 &
sleep 5
echo "✅ Serveur redémarré"
echo ""

echo "📋 Vérification des logs du serveur:"
tail -30 server.log
echo ""

echo "👤 Vérification du compte admin créé:"
echo "SELECT username, password, date_creation FROM administrateurs;" | sqlite3 database/professeurs.db
echo ""

echo "✅ Diagnostic terminé!"
echo ""
echo "🔐 Les identifiants de connexion sont:"
echo "   Username: admin"
echo "   Password: admin123"

ENDSSH

echo ""
echo "✅ Script de correction exécuté sur le serveur"
