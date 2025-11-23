const fs = require('fs');
const path = require('path');

const BUILD_DIR = 'dist';
const isProduction = process.env.NODE_ENV === 'production';

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    console.log(`${colors.bright}${colors.blue}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logError(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

// Créer le dossier de build
function createBuildDir() {
    logStep(1, 'Création du dossier de build...');
    
    if (fs.existsSync(BUILD_DIR)) {
        fs.rmSync(BUILD_DIR, { recursive: true, force: true });
        log(`  Ancien dossier ${BUILD_DIR}/ supprimé`, 'yellow');
    }
    
    fs.mkdirSync(BUILD_DIR, { recursive: true });
    fs.mkdirSync(path.join(BUILD_DIR, 'files'), { recursive: true });
    fs.mkdirSync(path.join(BUILD_DIR, 'database'), { recursive: true });
    fs.mkdirSync(path.join(BUILD_DIR, 'LOGO'), { recursive: true });
    
    // Créer un fichier .gitkeep dans database pour que le dossier soit inclus
    // mais PAS la DB elle-même (elle sera créée par le serveur)
    fs.writeFileSync(path.join(BUILD_DIR, 'database', '.gitkeep'), '');
    
    logSuccess(`Dossier ${BUILD_DIR}/ créé avec succès`);
}

// Copier les fichiers
function copyFiles() {
    logStep(2, 'Copie des fichiers...');
    
    const filesToCopy = [
        // Fichiers principaux
        'index.html',
        'styles.css',
        'manifest.json',
        'sw.js',
        
        // Scripts
        'app-client.js',
        'server.js',
        
        // Fichiers de configuration
        'package.json',
        'etab.json',
        
        // Documentation
        'README.md',
        'README-SQLITE.md',
        
        // Assets
        'app-logo.png'
    ];
    
    let copiedCount = 0;
    let errorCount = 0;
    
    filesToCopy.forEach(file => {
        const srcPath = path.join(__dirname, file);
        const destPath = path.join(__dirname, BUILD_DIR, file);
        
        try {
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                copiedCount++;
                log(`  ✓ ${file}`, 'green');
            } else {
                logWarning(`  ⚠ ${file} (non trouvé, ignoré)`);
            }
        } catch (error) {
            logError(`  ✗ ${file} (erreur: ${error.message})`);
            errorCount++;
        }
    });
    
    // Copier le dossier LOGO
    try {
        const logoDir = path.join(__dirname, 'LOGO');
        const destLogoDir = path.join(__dirname, BUILD_DIR, 'LOGO');
        
        if (fs.existsSync(logoDir)) {
            const logoFiles = fs.readdirSync(logoDir);
            logoFiles.forEach(file => {
                fs.copyFileSync(
                    path.join(logoDir, file),
                    path.join(destLogoDir, file)
                );
            });
            logSuccess(`  ${logoFiles.length} logos copiés`);
        }
    } catch (error) {
        logWarning(`  Logos: ${error.message}`);
    }
    
    logSuccess(`${copiedCount} fichiers copiés${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}`);
}

// Créer le fichier .gitignore pour dist
function createGitignore() {
    logStep(3, 'Configuration Git...');
    
    const gitignoreContent = `# Base de données de production
database/*.db
database/*.db-journal

# Fichiers uploadés
files/*
!files/.gitkeep

# Logs
*.log
npm-debug.log*

# Node modules
node_modules/

# Environment variables
.env
.env.local
`;
    
    fs.writeFileSync(path.join(__dirname, BUILD_DIR, '.gitignore'), gitignoreContent);
    
    // Créer les fichiers .gitkeep
    fs.writeFileSync(path.join(__dirname, BUILD_DIR, 'files', '.gitkeep'), '');
    fs.writeFileSync(path.join(__dirname, BUILD_DIR, 'database', '.gitkeep'), '');
    
    logSuccess('.gitignore créé');
}

// Créer le fichier de configuration de production
function createProductionConfig() {
    logStep(4, 'Configuration de production...');
    
    const config = {
        environment: isProduction ? 'production' : 'development',
        port: process.env.PORT || 3000,
        database: {
            path: './database/professeurs.db'
        },
        uploads: {
            path: './files',
            maxSize: 5242880 // 5MB
        },
        security: {
            rateLimit: true,
            cors: true
        },
        buildDate: new Date().toISOString(),
        version: require('./package.json').version
    };
    
    fs.writeFileSync(
        path.join(__dirname, BUILD_DIR, 'config.json'),
        JSON.stringify(config, null, 2)
    );
    
    logSuccess('Configuration de production créée');
}

// Créer le fichier README pour le déploiement
function createDeploymentReadme() {
    logStep(5, 'Création du guide de déploiement...');
    
    const deploymentReadme = `# Guide de Déploiement - Production

## 📦 Installation

1. Copier tous les fichiers sur le serveur
2. Installer les dépendances :
   \`\`\`bash
   npm install --production
   \`\`\`

3. Configurer les variables d'environnement (optionnel) :
   \`\`\`bash
   PORT=3000
   NODE_ENV=production
   \`\`\`

4. Initialiser la base de données (première installation) :
   \`\`\`bash
   node server.js
   \`\`\`
   La base de données sera créée automatiquement au premier lancement.

## 🚀 Démarrage

### Production
\`\`\`bash
npm start
\`\`\`

### Avec PM2 (recommandé)
\`\`\`bash
pm2 start server.js --name "prof-identification"
pm2 save
pm2 startup
\`\`\`

## 🔒 Sécurité

- Changez le mot de passe administrateur par défaut (admin/admin123)
- Assurez-vous que le dossier \`files/\` a les bonnes permissions
- Configurez un reverse proxy (nginx/Apache) pour la production
- Activez HTTPS

## 📁 Structure

\`\`\`
dist/
├── index.html          # Interface principale
├── styles.css          # Styles
├── app-client.js       # Code client
├── server.js           # Serveur Node.js
├── package.json        # Dépendances
├── database/           # Base de données SQLite
├── files/              # Fichiers uploadés
└── LOGO/               # Logos des universités
\`\`\`

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Sauvegarder les dossiers \`database/\` et \`files/\`
2. Remplacer tous les fichiers
3. Exécuter \`npm install --production\`
4. Redémarrer le serveur

## 📊 Monitoring

- Logs : \`pm2 logs prof-identification\`
- Status : \`pm2 status\`
- Restart : \`pm2 restart prof-identification\`

## 🆘 Support

Pour toute question ou problème, consultez le README.md principal.

Build date: ${new Date().toLocaleString('fr-FR')}
`;
    
    fs.writeFileSync(path.join(__dirname, BUILD_DIR, 'DEPLOYMENT.md'), deploymentReadme);
    logSuccess('Guide de déploiement créé');
}

// Générer un rapport de build
function generateBuildReport() {
    logStep(6, 'Génération du rapport de build...');
    
    const buildInfo = {
        date: new Date().toISOString(),
        environment: isProduction ? 'production' : 'development',
        version: require('./package.json').version,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
    };
    
    // Calculer la taille du build
    function getDirSize(dirPath) {
        let size = 0;
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stats.size;
            }
        });
        
        return size;
    }
    
    const buildSize = getDirSize(path.join(__dirname, BUILD_DIR));
    const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);
    
    buildInfo.buildSize = `${buildSizeMB} MB`;
    
    fs.writeFileSync(
        path.join(__dirname, BUILD_DIR, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );
    
    logSuccess(`Rapport de build généré (Taille: ${buildSizeMB} MB)`);
}

// Fonction principale
async function build() {
    console.log('\n' + '='.repeat(60));
    log('🏗️  BUILD DE PRODUCTION - APPLICATION PROF-IDENTIFICATION', 'bright');
    console.log('='.repeat(60) + '\n');
    
    if (isProduction) {
        log('Mode: PRODUCTION', 'green');
    } else {
        log('Mode: DEVELOPMENT', 'yellow');
    }
    
    console.log('\n');
    
    try {
        createBuildDir();
        copyFiles();
        createGitignore();
        createProductionConfig();
        createDeploymentReadme();
        generateBuildReport();
        
        console.log('\n' + '='.repeat(60));
        log('✅ BUILD TERMINÉ AVEC SUCCÈS!', 'green');
        console.log('='.repeat(60));
        
        console.log(`\n${colors.bright}Prochaines étapes:${colors.reset}`);
        console.log(`  1. cd ${BUILD_DIR}`);
        console.log(`  2. npm install --production`);
        console.log(`  3. npm start`);
        console.log(`\n${colors.blue}ℹ${colors.reset}  Consultez ${BUILD_DIR}/DEPLOYMENT.md pour plus d'informations\n`);
        
    } catch (error) {
        console.log('\n' + '='.repeat(60));
        logError('❌ ERREUR LORS DU BUILD');
        console.log('='.repeat(60));
        console.error(error);
        process.exit(1);
    }
}

// Exécuter le build
build();
