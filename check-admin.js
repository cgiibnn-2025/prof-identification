// Script pour vérifier et créer le compte admin
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'professeurs.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Vérification de la base de données...\n');

// Vérifier si la table administrateurs existe
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='administrateurs'", (err, row) => {
    if (err) {
        console.error('❌ Erreur:', err);
        return;
    }
    
    if (!row) {
        console.log('⚠️  La table administrateurs n\'existe pas. Création...');
        const createTable = `
            CREATE TABLE administrateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                derniere_connexion DATETIME
            )
        `;
        db.run(createTable, (err) => {
            if (err) {
                console.error('❌ Erreur création table:', err);
                return;
            }
            console.log('✅ Table administrateurs créée');
            insertAdmin();
        });
    } else {
        console.log('✅ Table administrateurs existe');
        checkAdmin();
    }
});

function checkAdmin() {
    db.get("SELECT * FROM administrateurs WHERE username = 'admin'", (err, row) => {
        if (err) {
            console.error('❌ Erreur:', err);
            return;
        }
        
        if (row) {
            console.log('✅ Compte admin existe déjà');
            console.log('   Username:', row.username);
            console.log('   Password:', row.password);
            console.log('   Créé le:', row.date_creation);
            console.log('   Dernière connexion:', row.derniere_connexion || 'Jamais');
        } else {
            console.log('⚠️  Compte admin n\'existe pas. Création...');
            insertAdmin();
        }
        
        db.close();
    });
}

function insertAdmin() {
    db.run("INSERT OR REPLACE INTO administrateurs (username, password) VALUES ('admin', 'admin123')", (err) => {
        if (err) {
            console.error('❌ Erreur insertion admin:', err);
        } else {
            console.log('✅ Compte admin créé avec succès!');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        }
        
        db.close();
    });
}
