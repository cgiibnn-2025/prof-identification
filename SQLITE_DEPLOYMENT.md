# 🔧 Configuration SQLite pour Déploiement en Ligne

## ❌ Problème Résolu

**Le problème:** Lorsque vous déployiez, la base de données vide (`database/professeurs.db`) était copiée sur le serveur et écrasait celle créée automatiquement par le serveur.

**Résultat:** Les tables et l'utilisateur admin n'étaient jamais créés.

## ✅ Solution Implémentée

### 1. **build.js** - Excluir la DB du build
- Le dossier `database/` est créé dans le build
- MAIS le fichier `.db` n'est PAS copié
- Seul un fichier `.gitkeep` est inclus pour que le dossier existe

### 2. **server.js** - Créer la DB automatiquement
- Quand le serveur démarre, il crée automatiquement `database/professeurs.db`
- Il initialise les tables `professeurs` et `administrateurs`
- Il crée l'utilisateur par défaut `admin / admin123`

### 3. **Logs améliorés** pour diagnostiquer
```
📍 Chemin DB: /opt/idprof.bnn/database/professeurs.db
📍 DB existe: NON (va être créée)
✅ Connexion à la base de données SQLite réussie
✅ Table professeurs créée ou existe déjà
✅ Table administrateurs créée ou existe déjà
✅ Administrateur par défaut créé (admin/admin123)
```

## 🚀 Déploiement Correct

### Option 1: Script automatique (si SSH avec clé)
```bash
./deploy.sh
```

### Option 2: Commandes manuelles

```bash
# 1. Arrêter l'ancien serveur
ssh root@213.136.86.229 'pkill -f "node server.js" || true'

# 2. Nettoyer complètement
ssh root@213.136.86.229 'rm -rf /opt/idprof.bnn/*'

# 3. Créer les dossiers
ssh root@213.136.86.229 'mkdir -p /opt/idprof.bnn/{database,files,LOGO}'

# 4. Copier les fichiers du dist (rsync exclut les .db)
cd dist
rsync -avz --exclude='*.db' --exclude='*.log' . root@213.136.86.229:/opt/idprof.bnn/
cd ..

# 5. Installer les dépendances
ssh root@213.136.86.229 'cd /opt/idprof.bnn && npm install --production'

# 6. Démarrer le serveur
ssh root@213.136.86.229 'cd /opt/idprof.bnn && nohup node server.js > server.log 2>&1 &'

# 7. Vérifier les logs
sleep 3
ssh root@213.136.86.229 'tail -20 /opt/idprof.bnn/server.log'
```

## 📊 Structure du Déploiement

```
/opt/idprof.bnn/
├── index.html          # Interface (copiée)
├── styles.css          # Styles (copiée)
├── app-client.js       # Code client (copié)
├── server.js           # Serveur Node (copié)
├── package.json        # Dépendances (copié)
├── LOGO/               # Logos (copiés)
├── files/              # Uploads (créé vide, puis rempli)
└── database/           
    └── professeurs.db  # ⭐ CRÉÉE PAR LE SERVEUR AU DÉMARRAGE
                        #    PAS COPIÉE DEPUIS LOCAL
```

## 🔑 Credentials Par Défaut

- **Utilisateur:** admin
- **Mot de passe:** admin123
- **URL:** http://213.136.86.229:3000

⚠️ **À faire après la première connexion:**
- Changer le mot de passe admin dans la page d'administration
- Configurer HTTPS en production

## 🐛 Diagnostiquer les Problèmes

### Vérifier si le serveur tourne
```bash
ssh root@213.136.86.229 'ps aux | grep "node server.js"'
```

### Voir les logs en direct
```bash
ssh root@213.136.86.229 'tail -f /opt/idprof.bnn/server.log'
```

### Vérifier la DB
```bash
ssh root@213.136.86.229 'ls -lah /opt/idprof.bnn/database/'
```

### Vérifier la connexion
```bash
curl -I http://213.136.86.229:3000
```

## 📝 Points Clés

✅ **La DB se crée automatiquement** - Pas besoin de l'uploader  
✅ **L'admin se crée automatiquement** - À chaque démarrage (INSERT OR IGNORE)  
✅ **Les logs sont clairs** - Vous savez exactement ce qui se passe  
✅ **Pas de conflit** - Exclure *.db du build et du rsync  

## 🎯 Prochaines Fois

À chaque déploiement:
1. Faire `npm run build`
2. Exécuter le script `deploy.sh` OU les commandes manuelles
3. Vérifier avec `curl http://213.136.86.229:3000`
4. Logger avec `admin / admin123`

**LA DB NE DOIT JAMAIS ÊTRE COPIÉE MANUELLEMENT** - Laissez le serveur la créer!
