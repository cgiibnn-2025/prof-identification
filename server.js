const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de multer pour les fichiers
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, filesDir)
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique avec timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Servir les fichiers statiques depuis le dossier racine
app.use(express.static(__dirname));

// Servir les fichiers uploadés depuis le dossier /files
app.use('/files', express.static(path.join(__dirname, 'files')));

// Initialisation de la base de données SQLite
const dbPath = path.join(__dirname, 'database', 'professeurs.db');

// Créer le dossier database s'il n'existe pas
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
        initDatabase();
    }
});

// Initialisation des tables
function initDatabase() {
    const createProfesseursTable = `
        CREATE TABLE IF NOT EXISTS professeurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            sexe TEXT NOT NULL,
            matricule TEXT NOT NULL,
            lieu_naissance TEXT NOT NULL,
            date_naissance TEXT NOT NULL,
            grade TEXT NOT NULL,
            pays_soutenance TEXT NOT NULL,
            universite_soutenance TEXT NOT NULL,
            numero_equivalence TEXT,
            arrete_equivalence TEXT,
            date_soutenance TEXT NOT NULL,
            type_diplome TEXT NOT NULL,
            universite_attache TEXT NOT NULL,
            email TEXT,
            telephone TEXT NOT NULL,
            numero_arrete TEXT NOT NULL,
            prime_institutionnelle TEXT NOT NULL,
            salaire_base TEXT NOT NULL,
            photo_identite TEXT,
            copie_diplome TEXT,
            copie_these TEXT,
            commentaire TEXT NOT NULL,
            confirmation INTEGER NOT NULL,
            date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createAdminTable = `
        CREATE TABLE IF NOT EXISTS administrateurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
            derniere_connexion DATETIME
        )
    `;

    db.run(createProfesseursTable, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table professeurs:', err);
        } else {
            console.log('Table professeurs créée ou existe déjà');
        }
    });

    db.run(createAdminTable, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table administrateurs:', err);
        } else {
            console.log('Table administrateurs créée ou existe déjà');
            
            // Insérer un administrateur par défaut
            const insertAdmin = `INSERT OR IGNORE INTO administrateurs (username, password) VALUES (?, ?)`;
            db.run(insertAdmin, ['admin', 'admin123'], (err) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion de l\'admin par défaut:', err);
                } else {
                    console.log('Administrateur par défaut créé (admin/admin123)');
                }
            });
        }
    });
}

// Routes API

// Route pour servir la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour l'authentification administrateur
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    const query = `SELECT * FROM administrateurs WHERE username = ? AND password = ?`;
    
    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('Erreur lors de l\'authentification:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        if (row) {
            // Mettre à jour la dernière connexion
            const updateQuery = `UPDATE administrateurs SET derniere_connexion = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateQuery, [row.id]);
            
            res.json({
                success: true,
                admin: {
                    id: row.id,
                    username: row.username,
                    derniere_connexion: row.derniere_connexion
                }
            });
        } else {
            res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
    });
});

// Route pour changer le mot de passe administrateur
app.post('/api/admin/change-password', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    
    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier l'ancien mot de passe
    const checkQuery = `SELECT id FROM administrateurs WHERE username = ? AND password = ?`;
    
    db.get(checkQuery, [username, oldPassword], (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification du mot de passe:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        if (!row) {
            return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }
        
        // Mettre à jour le mot de passe
        const updateQuery = `UPDATE administrateurs SET password = ? WHERE id = ?`;
        
        db.run(updateQuery, [newPassword, row.id], (err) => {
            if (err) {
                console.error('Erreur lors de la mise à jour du mot de passe:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            
            res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
        });
    });
});

// Route pour ajouter un professeur
app.post('/api/professeurs', upload.fields([
    { name: 'photoIdentite', maxCount: 1 },
    { name: 'copieDiplome', maxCount: 1 },
    { name: 'copieThese', maxCount: 1 },
    { name: 'arreteEquivalence', maxCount: 1 }
]), (req, res) => {
    const {
        nom, sexe, matricule, lieuNaissance, dateNaissance, grade,
        paysSoutenance, universiteSoutenance, numeroEquivalence,
        dateSoutenance, typeDiplome, universiteAttache, email, telephone,
        numeroArrete, primeInstitutionnelle, salaireBase, commentaire, confirmation
    } = req.body;

    // Sauvegarder les noms de fichiers au lieu du contenu
    let photoIdentite = null;
    let copieDiplome = null;
    let copieThese = null;
    let arreteEquivalence = null;

    if (req.files) {
        if (req.files.photoIdentite && req.files.photoIdentite[0]) {
            photoIdentite = req.files.photoIdentite[0].filename;
        }
        if (req.files.copieDiplome && req.files.copieDiplome[0]) {
            copieDiplome = req.files.copieDiplome[0].filename;
        }
        if (req.files.copieThese && req.files.copieThese[0]) {
            copieThese = req.files.copieThese[0].filename;
        }
        if (req.files.arreteEquivalence && req.files.arreteEquivalence[0]) {
            arreteEquivalence = req.files.arreteEquivalence[0].filename;
        }
    }

    const insertQuery = `
        INSERT INTO professeurs (
            nom, sexe, matricule, lieu_naissance, date_naissance, grade,
            pays_soutenance, universite_soutenance, numero_equivalence, arrete_equivalence,
            date_soutenance, type_diplome, universite_attache, email, telephone,
            numero_arrete, prime_institutionnelle, salaire_base, photo_identite,
            copie_diplome, copie_these, commentaire, confirmation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nom, sexe, matricule, lieuNaissance, dateNaissance, grade,
        paysSoutenance, universiteSoutenance, numeroEquivalence, arreteEquivalence,
        dateSoutenance, typeDiplome, universiteAttache, email, telephone,
        numeroArrete, primeInstitutionnelle, salaireBase, photoIdentite,
        copieDiplome, copieThese, commentaire, confirmation === 'true' ? 1 : 0
    ];

    db.run(insertQuery, values, function(err) {
        if (err) {
            console.error('Erreur lors de l\'insertion:', err);
            return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
        }
        
        res.json({
            success: true,
            message: 'Professeur enregistré avec succès',
            id: this.lastID
        });
    });
});

// Route pour récupérer tous les professeurs
app.get('/api/professeurs', (req, res) => {
    const query = `SELECT * FROM professeurs ORDER BY date_creation DESC`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json(rows);
    });
});

// Route pour récupérer un professeur par ID
app.get('/api/professeurs/:id', (req, res) => {
    const id = req.params.id;
    
    const query = `SELECT * FROM professeurs WHERE id = ?`;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Erreur lors de la récupération du professeur:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Professeur non trouvé' });
        }
        
        res.json(row);
    });
});

// Route pour rechercher des professeurs
app.get('/api/professeurs/search/:term', (req, res) => {
    const searchTerm = `%${req.params.term}%`;
    
    const query = `
        SELECT * FROM professeurs 
        WHERE nom LIKE ? OR matricule LIKE ? OR telephone LIKE ?
        ORDER BY date_creation DESC
    `;
    
    db.all(query, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la recherche:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json(rows);
    });
});

// Route pour supprimer un professeur
app.delete('/api/professeurs/:id', (req, res) => {
    const id = req.params.id;
    
    const query = `DELETE FROM professeurs WHERE id = ?`;
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Erreur lors de la suppression:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Professeur non trouvé' });
        }
        
        res.json({ success: true, message: 'Professeur supprimé avec succès' });
    });
});

// Route pour obtenir les statistiques
app.get('/api/stats', (req, res) => {
    const query = `SELECT COUNT(*) as total FROM professeurs`;
    
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Erreur lors du calcul des statistiques:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json({ totalProfesseurs: row.total });
    });
});

// Gestionnaire d'erreur global
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Base de données SQLite: ${dbPath}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
    console.log('\n⏹️  Fermeture du serveur...');
    
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la base de données:', err);
        } else {
            console.log('✅ Base de données fermée');
        }
        process.exit(0);
    });
});
