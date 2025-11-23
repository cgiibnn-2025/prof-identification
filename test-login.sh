#!/bin/bash

echo "🧪 TEST DE L'API DE CONNEXION"
echo "=============================="
echo ""

# Teste l'API de login
echo "🔐 Test du login avec admin/admin123..."
curl -s -X POST http://213.136.86.229:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq '.' || echo "Erreur de connexion"

echo ""
echo ""
echo "✅ Test terminé"
echo ""
echo "🌐 Accédez à votre application:"
echo "   http://213.136.86.229:3000"
echo ""
echo "🔐 Identifiants:"
echo "   Admin: admin"
echo "   Password: admin123"
