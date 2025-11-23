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
    console.log(`📁 Dossier créé: ${dbDir}`);
}

console.log(`📍 Chemin DB: ${dbPath}`);
console.log(`📍 DB existe: ${fs.existsSync(dbPath) ? 'OUI' : 'NON (va être créée)'}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur lors de l\'ouverture de la base de données:', err);
        process.exit(1);
    } else {
        console.log('✅ Connexion à la base de données SQLite réussie');
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
            matricule TEXT NOT NULL UNIQUE,
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
            email TEXT UNIQUE,
            telephone TEXT NOT NULL UNIQUE,
            numero_arrete TEXT NOT NULL,
            prime_institutionnelle TEXT NOT NULL,
            salaire_base TEXT NOT NULL,
            photo_identite TEXT,
            possede_diplome TEXT,
            copie_diplome TEXT,
            document_equivalent TEXT,
            copie_these TEXT,
            sujet_these TEXT,
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
            console.error('❌ Erreur lors de la création de la table professeurs:', err);
        } else {
            console.log('✅ Table professeurs créée ou existe déjà');
        }
    });

    // Vérifier et ajouter les colonnes manquantes (pour migration sur les anciennes bases)
    db.all("PRAGMA table_info(professeurs)", [], (err, cols) => {
        if (err) {
            console.error('Erreur lors de la vérification des colonnes de professeurs:', err);
            return;
        }

        const columnNames = cols ? cols.map(c => c.name) : [];
        const columnsToAdd = [
            { name: 'sujet_these', sql: "ALTER TABLE professeurs ADD COLUMN sujet_these TEXT" },
            { name: 'possede_diplome', sql: "ALTER TABLE professeurs ADD COLUMN possede_diplome TEXT" },
            { name: 'document_equivalent', sql: "ALTER TABLE professeurs ADD COLUMN document_equivalent TEXT" }
        ];

        columnsToAdd.forEach(col => {
            if (!columnNames.includes(col.name)) {
                console.log(`⚙️ Colonne '${col.name}' manquante — ajout en cours...`);
                db.run(col.sql, (alterErr) => {
                    if (alterErr) {
                        console.error(`❌ Erreur lors de l'ajout de la colonne '${col.name}':`, alterErr);
                    } else {
                        console.log(`✅ Colonne '${col.name}' ajoutée à la table professeurs`);
                    }
                });
            }
        });
    });

    db.run(createAdminTable, (err) => {
        if (err) {
            console.error('❌ Erreur lors de la création de la table administrateurs:', err);
        } else {
            console.log('✅ Table administrateurs créée ou existe déjà');
            
            // Insérer un administrateur par défaut
            const insertAdmin = `INSERT OR IGNORE INTO administrateurs (username, password) VALUES (?, ?)`;
            db.run(insertAdmin, ['admin', 'admin123'], (err) => {
                if (err) {
                    console.error('❌ Erreur lors de l\'insertion de l\'admin par défaut:', err);
                } else {
                    console.log('✅ Administrateur par défaut créé (admin/admin123)');
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
    { name: 'documentEquivalent', maxCount: 10 },
    { name: 'copieThese', maxCount: 10 },
    { name: 'arreteEquivalence', maxCount: 1 }
]), (req, res) => {
    const {
        nom, sexe, matricule, lieuNaissance, dateNaissance, grade,
        paysSoutenance, universiteSoutenance, numeroEquivalence,
        dateSoutenance, typeDiplome, universiteAttache, email, telephone,
        numeroArrete, primeInstitutionnelle, salaireBase, commentaire, confirmation,
        sujetThese, possedeDiplome
    } = req.body;

    // Sauvegarder les noms de fichiers au lieu du contenu
    let photoIdentite = null;
    let copieDiplome = null;
    let documentEquivalent = null;
    let copieThese = null;
    let arreteEquivalence = null;

    if (req.files) {
        if (req.files.photoIdentite && req.files.photoIdentite[0]) {
            photoIdentite = req.files.photoIdentite[0].filename;
        }
        if (req.files.copieDiplome && req.files.copieDiplome[0]) {
            copieDiplome = req.files.copieDiplome[0].filename;
        }
        if (req.files.documentEquivalent && req.files.documentEquivalent.length > 0) {
            // Stocker les noms de fichiers séparés par des virgules
            documentEquivalent = req.files.documentEquivalent.map(f => f.filename).join(',');
        }
        if (req.files.copieThese && req.files.copieThese.length > 0) {
            // Stocker les noms de fichiers séparés par des virgules pour les thèses
            copieThese = req.files.copieThese.map(f => f.filename).join(',');
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
            copie_diplome, copie_these, sujet_these, commentaire, confirmation, possede_diplome, document_equivalent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nom, sexe, matricule, lieuNaissance, dateNaissance, grade,
        paysSoutenance, universiteSoutenance, numeroEquivalence, arreteEquivalence,
        dateSoutenance, typeDiplome, universiteAttache, email, telephone,
        numeroArrete, primeInstitutionnelle, salaireBase, photoIdentite,
        copieDiplome, copieThese, sujetThese, commentaire, confirmation === 'true' ? 1 : 0,
        possedeDiplome, documentEquivalent
    ];

    db.run(insertQuery, values, function(err) {
        if (err) {
            console.error('Erreur lors de l\'insertion:', err);
            
            // Gestion des erreurs UNIQUE
            if (err.message.includes('UNIQUE constraint failed: professeurs.matricule')) {
                return res.status(400).json({ error: 'Ce matricule existe déjà' });
            }
            if (err.message.includes('UNIQUE constraint failed: professeurs.email')) {
                return res.status(400).json({ error: 'Cet email est déjà enregistré' });
            }
            if (err.message.includes('UNIQUE constraint failed: professeurs.telephone')) {
                return res.status(400).json({ error: 'Ce numéro de téléphone est déjà enregistré' });
            }
            
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
    const university = req.query.university;
    
    let query = `SELECT * FROM professeurs`;
    let params = [];
    
    if (university) {
        query += ` WHERE universite_attache = ?`;
        params.push(university);
    }
    
    query += ` ORDER BY date_creation DESC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json(rows);
    });
});

// Route pour récupérer les universités uniques
app.get('/api/universities', (req, res) => {
    const query = `SELECT DISTINCT universite_attache FROM professeurs WHERE universite_attache IS NOT NULL AND universite_attache != '' ORDER BY universite_attache`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des universités:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        const universities = rows.map(row => row.universite_attache);
        res.json(universities);
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

// Route pour mettre à jour un professeur
app.put('/api/professeurs/:id', upload.fields([
    { name: 'photoIdentite', maxCount: 1 },
    { name: 'copieDiplome', maxCount: 1 },
    { name: 'documentEquivalent', maxCount: 10 },
    { name: 'copieThese', maxCount: 10 },
    { name: 'arreteEquivalence', maxCount: 1 }
]), (req, res) => {
    const id = req.params.id;
    const {
        nom, sexe, matricule, lieuNaissance, dateNaissance, grade,
        paysSoutenance, universiteSoutenance, numeroEquivalence,
        dateSoutenance, typeDiplome, universiteAttache, email, telephone,
        numeroArrete, primeInstitutionnelle, salaireBase, commentaire, confirmation,
        sujetThese, possedeDiplome
    } = req.body;

    // Construire la requête UPDATE dynamiquement
    const updates = [];
    const values = [];

    if (nom) { updates.push('nom = ?'); values.push(nom); }
    if (sexe) { updates.push('sexe = ?'); values.push(sexe); }
    if (matricule) { updates.push('matricule = ?'); values.push(matricule); }
    if (lieuNaissance) { updates.push('lieu_naissance = ?'); values.push(lieuNaissance); }
    if (dateNaissance) { updates.push('date_naissance = ?'); values.push(dateNaissance); }
    if (grade) { updates.push('grade = ?'); values.push(grade); }
    if (paysSoutenance) { updates.push('pays_soutenance = ?'); values.push(paysSoutenance); }
    if (universiteSoutenance) { updates.push('universite_soutenance = ?'); values.push(universiteSoutenance); }
    if (numeroEquivalence) { updates.push('numero_equivalence = ?'); values.push(numeroEquivalence); }
    if (dateSoutenance) { updates.push('date_soutenance = ?'); values.push(dateSoutenance); }
    if (typeDiplome) { updates.push('type_diplome = ?'); values.push(typeDiplome); }
    if (universiteAttache) { updates.push('universite_attache = ?'); values.push(universiteAttache); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (telephone) { updates.push('telephone = ?'); values.push(telephone); }
    if (numeroArrete) { updates.push('numero_arrete = ?'); values.push(numeroArrete); }
    if (primeInstitutionnelle) { updates.push('prime_institutionnelle = ?'); values.push(primeInstitutionnelle); }
    if (salaireBase) { updates.push('salaire_base = ?'); values.push(salaireBase); }
    if (sujetThese) { updates.push('sujet_these = ?'); values.push(sujetThese); }
    if (commentaire) { updates.push('commentaire = ?'); values.push(commentaire); }
    if (confirmation !== undefined) { updates.push('confirmation = ?'); values.push(confirmation === 'true' ? 1 : 0); }
    if (possedeDiplome) { updates.push('possede_diplome = ?'); values.push(possedeDiplome); }

    // Gérer les fichiers
    if (req.files) {
        if (req.files.photoIdentite && req.files.photoIdentite[0]) {
            updates.push('photo_identite = ?');
            values.push(req.files.photoIdentite[0].filename);
        }
        if (req.files.copieDiplome && req.files.copieDiplome[0]) {
            updates.push('copie_diplome = ?');
            values.push(req.files.copieDiplome[0].filename);
        }
        if (req.files.documentEquivalent && req.files.documentEquivalent.length > 0) {
            updates.push('document_equivalent = ?');
            values.push(req.files.documentEquivalent.map(f => f.filename).join(','));
        }
        if (req.files.copieThese && req.files.copieThese.length > 0) {
            updates.push('copie_these = ?');
            values.push(req.files.copieThese.map(f => f.filename).join(','));
        }
        if (req.files.arreteEquivalence && req.files.arreteEquivalence[0]) {
            updates.push('arrete_equivalence = ?');
            values.push(req.files.arreteEquivalence[0].filename);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    values.push(id);
    const updateQuery = `UPDATE professeurs SET ${updates.join(', ')} WHERE id = ?`;

    db.run(updateQuery, values, function(err) {
        if (err) {
            console.error('Erreur lors de la mise à jour:', err);
            
            // Gestion des erreurs UNIQUE
            if (err.message.includes('UNIQUE constraint failed: professeurs.matricule')) {
                return res.status(400).json({ error: 'Ce matricule existe déjà' });
            }
            if (err.message.includes('UNIQUE constraint failed: professeurs.email')) {
                return res.status(400).json({ error: 'Cet email est déjà enregistré' });
            }
            if (err.message.includes('UNIQUE constraint failed: professeurs.telephone')) {
                return res.status(400).json({ error: 'Ce numéro de téléphone est déjà enregistré' });
            }
            
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Professeur non trouvé' });
        }

        res.json({
            success: true,
            message: 'Professeur mis à jour avec succès'
        });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://0.0.0.0:${PORT}`);
    console.log(`📁 Base de données SQLite: ${dbPath}`);
    console.log(`✅ Application accessible sur http://213.136.86.229:${PORT}`);
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
