# Application de Gestion du Personnel Académique ESU-RSI

Cette application utilise maintenant une **base de données SQLite locale** avec un serveur Node.js pour une meilleure performance et persistance des données.

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 12 ou supérieure)
- npm (généralement inclus avec Node.js)

### Installation des dépendances

```bash
npm install
```

### Démarrage de l'application

```bash
# Démarrage du serveur de production
npm start

# Ou démarrage en mode développement (avec rechargement automatique)
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## 📁 Structure du projet

```
prof-identification/
├── server.js              # Serveur Node.js avec API REST
├── app-client.js           # Application frontend (remplace app.js)
├── index.html              # Interface utilisateur
├── styles.css              # Styles CSS
├── database/               # Dossier de la base de données
│   └── professeurs.db      # Base SQLite (créée automatiquement)
├── etab.json               # Données des universités
├── package.json            # Configuration npm
└── README.md               # Ce fichier
```

## 🔧 Fonctionnalités

### Base de données SQLite locale
- **Persistance réelle** : Les données sont stockées dans un fichier `database/professeurs.db`
- **Performance améliorée** : Accès direct à la base sans conversion JSON
- **Sécurité renforcée** : Validation côté serveur
- **Scalabilité** : Prêt pour la production

### API REST
- `POST /api/professeurs` - Ajouter un professeur
- `GET /api/professeurs` - Récupérer tous les professeurs
- `GET /api/professeurs/search/:term` - Rechercher un professeur
- `DELETE /api/professeurs/:id` - Supprimer un professeur
- `POST /api/admin/login` - Connexion administrateur
- `POST /api/admin/change-password` - Changer le mot de passe admin
- `GET /api/stats` - Statistiques

### Authentification administrateur
- **Compte par défaut** : `admin` / `admin123`
- **Changement de mot de passe** : Interface intégrée
- **Session persistante** : Maintien de la connexion

## 🔄 Migration depuis l'ancienne version

L'ancienne version utilisait SQL.js en mémoire avec localStorage. La nouvelle version :

1. **Utilise SQLite natif** pour de meilleures performances
2. **Stockage permanent** dans un fichier de base de données
3. **API REST** pour une architecture client-serveur propre
4. **Gestion des fichiers améliorée** avec multer

## 🛠️ Développement

### Scripts disponibles

```bash
npm start      # Démarrage production
npm run dev    # Démarrage développement avec nodemon
```

### Modification de la base de données

La base de données est créée automatiquement au premier démarrage. Les tables suivantes sont créées :

- `professeurs` : Données des professeurs
- `administrateurs` : Comptes administrateur

### Ajout de nouvelles fonctionnalités

1. Modifiez `server.js` pour les routes API
2. Modifiez `app-client.js` pour le frontend
3. Redémarrez le serveur pour voir les changements

## 🔒 Sécurité

- **Validation côté serveur** de tous les inputs
- **Gestion des fichiers sécurisée** avec multer
- **Protection CORS** configurée
- **Authentification** pour l'accès administrateur

## 📱 Accès

- **Formulaires publics** : Accessible à tous
- **Consultation des données** : Réservée aux administrateurs
- **Gestion** : Interface d'administration complète

## 🆘 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que les dépendances sont installées
npm install

# Vérifier les permissions du dossier database
chmod 755 database/
```

### Erreur de base de données
```bash
# Supprimer la base pour la recréer
rm database/professeurs.db
npm start
```

### Port déjà utilisé
```bash
# Changer le port dans server.js ou utiliser une variable d'environnement
PORT=3001 npm start
```

---

**Version** : 2.0.0 (Base SQLite locale)  
**Développé pour** : ESU-RSI  
**Support** : Node.js + Express + SQLite3
