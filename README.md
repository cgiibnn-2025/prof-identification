# Registre d'Identification des Professeurs - MINESURSI

Une application web moderne pour l'identification et la gestion du corps académique du MINESURSI (Ministère de l'Enseignement Supérieur, Universitaire et Recherche Scientifique et Innovation).

## Fonctionnalités

### 📋 Formulaire d'identification complet
- **Informations personnelles** : Nom complet, sexe, matricule ESU, lieu et date de naissance
- **Informations académiques** : Grade, université de soutenance, type de diplôme, université d'attache
- **Contact et administration** : Email, téléphone, arrêté ministériel, primes et salaires
- **Documents** : Photo d'identité, diplôme, thèse (avec validation des formats)
- **Validation en temps réel** des champs critiques (matricule, téléphone)

### 🏛️ Gestion des universités
- Liste complète des universités de RDC avec logos
- Affichage automatique du logo de l'université sélectionnée
- Données chargées depuis `etab.json`

### 💾 Base de données SQLite
- Stockage local avec SQLite via SQL.js
- Persistance des données dans le localStorage
- Gestion complète CRUD (Create, Read, Update, Delete)

### � Système d'administration
- **Login sécurisé** : Interface d'administration protégée
- **Gestion des professeurs** : Consultation et suppression des enregistrements
- **Statistiques** : Tableau de bord avec métriques importantes
- **Sécurité** : Changement du mot de passe administrateur

### �🔍 Fonctionnalités avancées
- **Recherche** : Par nom, matricule ou téléphone
- **Affichage des détails** : Modal avec toutes les informations
- **Validation des fichiers** : Contrôle des formats et tailles
- **Interface responsive** : Compatible mobile et desktop
- **Messages d'état** : Notifications de succès/erreur

## Technologies utilisées

- **HTML5** : Structure sémantique moderne
- **CSS3** : Design moderne avec variables CSS, animations, grid/flexbox
- **JavaScript ES6+** : Classes, async/await, modules
- **SQLite** : Base de données locale via SQL.js
- **Font Awesome** : Icônes
- **Google Fonts** : Police Inter

## Structure des fichiers

```
prof-identification/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── app.js             # Logique JavaScript principale
├── sw.js              # Service Worker pour le cache
├── etab.json          # Base de données des universités
├── app-logo.png       # Logo de l'application
├── LOGO/              # Dossier contenant les logos des universités
└── README.md          # Documentation
```

## Installation et utilisation

1. **Cloner ou télécharger** le projet
2. **Ouvrir** `index.html` dans un navigateur web moderne
3. **Remplir** le formulaire d'identification
4. **Enregistrer** les données (stockées localement)
5. **Consulter** la liste des professeurs enregistrés

### Démarrage d'un serveur local (recommandé)

Pour éviter les restrictions CORS avec les fichiers locaux :

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (si live-server est installé)
npx live-server

# Puis ouvrir http://localhost:8000
```

## Validation des données

### Matricule ESU
- **Aucune contrainte** : Tous les formats sont acceptés

### Numéro de téléphone
- Formats acceptés : `+243123456789` ou `0123456789`

### Fichiers
- **Photo d'identité** : JPG, PNG, JPEG (max 8MB)
- **Thèse** : PDF uniquement
- **Autres documents** : PDF, JPG, PNG, JPEG

## Accès administrateur

### Contrôle d'accès à deux niveaux

#### 🌍 **Accès Public**
- **Formulaire d'enregistrement** : Accessible à tous
- **Inscription des professeurs** : Libre et ouverte
- **Validation des données** : Automatique

#### 🔐 **Accès Restreint (Administrateurs uniquement)**
- **Consultation des données** : Liste de tous les professeurs
- **Recherche avancée** : Filtrage par critères
- **Détails complets** : Vue détaillée de chaque professeur
- **Gestion des données** : Suppression sécurisée

### Identifiants par défaut
- **Nom d'utilisateur** : admin
- **Mot de passe** : admin123

### Fonctionnalités administrateur
- Consultation de tous les professeurs enregistrés
- Recherche et filtrage des données
- Visualisation des détails complets
- Suppression des enregistrements (avec confirmation)
- Statistiques en temps réel
- Changement du mot de passe
- Historique des connexions

> **Important** : Changez le mot de passe par défaut après la première connexion pour sécuriser l'accès.

## Base de données

La base de données SQLite contient deux tables principales :

### Table `professeurs`
- Informations personnelles (nom, sexe, matricule, naissance)
- Informations académiques (grade, universités, diplôme)
- Contact et administration (email, téléphone, arrêtés)
- Documents (stockés en Base64)
- Métadonnées (date de création, confirmation)

### Table `administrateurs`
- Gestion des comptes administrateurs
- Authentification sécurisée
- Historique des connexions

## Compatibilité

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Appareils mobiles (responsive design)

## Fonctionnalités techniques

### Service Worker
- Cache des ressources pour un fonctionnement hors ligne
- Amélioration des performances de chargement

### Progressive Web App (PWA)
- Installation possible sur mobile/desktop
- Fonctionnement en mode hors ligne

### Sécurité
- Validation côté client rigoureuse
- Contrôle des types et tailles de fichiers
- Échappement des données utilisateur

## Développement futur

### Améliorations possibles
- [ ] Export des données (PDF, Excel)
- [ ] Import en masse via CSV/Excel
- [ ] Système d'authentification
- [ ] Synchronisation avec serveur distant
- [ ] Notifications push
- [ ] Statistiques et rapports
- [ ] Mode sombre
- [ ] Multi-langues

### Extensions techniques
- [ ] Base de données serveur (MySQL, PostgreSQL)
- [ ] API REST avec Node.js/Express
- [ ] Framework frontend (React, Vue.js)
- [ ] Tests unitaires et d'intégration

## Support et contribution

Pour signaler des bugs ou proposer des améliorations :
1. Créer une issue avec une description détaillée
2. Inclure les étapes de reproduction
3. Préciser le navigateur et la version

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**Développé pour l'ESU-RSI** - Application de gestion moderne et intuitive pour le personnel académique.
