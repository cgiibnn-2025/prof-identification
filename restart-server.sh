#!/bin/bash

echo "🔄 REDÉMARRAGE DU SERVEUR"
echo "========================="
echo ""

ssh root@213.136.86.229 << 'ENDSSH'

cd /opt/idprof.bnn

echo "🛑 Arrêt du serveur existant..."
pkill -f "node server.js"
sleep 2
echo "✅ Serveur arrêté"
echo ""

echo "🚀 Redémarrage du serveur..."
nohup node server.js > server.log 2>&1 &
sleep 3
echo "✅ Serveur redémarré"
echo ""

echo "📋 Vérification du statut:"
ps aux | grep "node server.js" | grep -v grep
echo ""

echo "📝 Vérification des logs:"
tail -10 server.log
echo ""

echo "✅ Redémarrage terminé"
echo ""
echo "🌐 Accédez à l'application sur:"
echo "   http://213.136.86.229:3000"

ENDSSH
