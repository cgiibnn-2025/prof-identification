#!/bin/bash

echo "🗄️  VÉRIFICATION DE LA BASE DE DONNÉES SQLITE"
echo "=============================================="
echo ""

ssh root@213.136.86.229 << 'ENDSSH'

cd /opt/idprof.bnn

echo "📍 Répertoire courant:"
pwd
echo ""

echo "📁 Vérification de la structure des dossiers:"
ls -lah
echo ""

echo "🗄️  Vérification du dossier database:"
ls -lah database/
echo ""

echo "📊 Vérification du fichier de base de données:"
if [ -f "database/professeurs.db" ]; then
    echo "✅ database/professeurs.db existe"
    echo "Taille: $(du -h database/professeurs.db | cut -f1)"
    echo ""
    
    echo "📋 Contenu de la base de données:"
    echo "Tables disponibles:"
    echo ".tables" | sqlite3 database/professeurs.db
    echo ""
    
    echo "👤 Compte administrateur:"
    echo "SELECT id, username, password, date_creation FROM administrateurs LIMIT 5;" | sqlite3 database/professeurs.db
    echo ""
    
    echo "📊 Nombre de professeurs enregistrés:"
    echo "SELECT COUNT(*) as total FROM professeurs;" | sqlite3 database/professeurs.db
else
    echo "❌ database/professeurs.db n'existe pas"
    echo "Création en cours..."
    node -e "require('./server.js')" &
    sleep 3
    kill %1 2>/dev/null
    echo "✅ Base de données créée"
fi

echo ""
echo "🔍 Vérification du serveur Node.js:"
ps aux | grep -E "node|npm" | grep -v grep
echo ""

echo "📝 Dernières lignes du fichier log:"
if [ -f "server.log" ]; then
    tail -20 server.log
else
    echo "Pas de fichier server.log"
fi

ENDSSH

echo ""
echo "✅ Vérification terminée"
