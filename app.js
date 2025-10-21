// Configuration et initialisation de la base de données SQLite
class DatabaseManager {
    constructor() {
        this.db = null;
        this.initPromise = this.initDatabase();
    }

    async initDatabase() {
        try {
            // Initialiser SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // Pour corriger le problème de contrainte UNIQUE, on peut forcer une reconstruction
            const savedDb = localStorage.getItem('professeurs_db');
            const forceRebuild = localStorage.getItem('force_rebuild_db');
            
            if (savedDb && !forceRebuild) {
                try {
                    const uint8Array = new Uint8Array(JSON.parse(savedDb));
                    this.db = new SQL.Database(uint8Array);
                    
                    // Vérifier si la table a encore une contrainte UNIQUE problématique
                    const checkConstraint = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='professeurs'");
                    if (checkConstraint.step()) {
                        const tableSQL = checkConstraint.getAsObject().sql;
                        if (tableSQL && tableSQL.includes('matricule') && tableSQL.includes('UNIQUE')) {
                            console.log('Contrainte UNIQUE détectée, reconstruction nécessaire');
                            checkConstraint.free();
                            throw new Error('Rebuild needed');
                        }
                    }
                    checkConstraint.free();
                } catch (error) {
                    console.log('Reconstruction de la base de données nécessaire');
                    this.db = new SQL.Database();
                    this.createTables();
                }
            } else {
                this.db = new SQL.Database();
                this.createTables();
                // Marquer que la reconstruction a été faite
                localStorage.removeItem('force_rebuild_db');
            }

            console.log('Base de données initialisée avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de la base de données:', error);
            return false;
        }
    }

    createTables() {
        // Vérifier si la table existe et la recréer si nécessaire pour supprimer la contrainte UNIQUE
        try {
            // Supprimer l'ancienne table si elle existe avec une contrainte UNIQUE sur matricule
            this.db.run("DROP TABLE IF EXISTS professeurs_old");
            this.db.run("ALTER TABLE professeurs RENAME TO professeurs_old");
        } catch (error) {
            // La table n'existe pas encore, c'est normal
        }

        const createTableSQL = `
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
                date_creation TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        this.db.run(createTableSQL);
        
        // Migrer les données de l'ancienne table si elle existe
        try {
            const checkOldTable = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='professeurs_old'");
            if (checkOldTable.step()) {
                const migrateSQL = `
                    INSERT INTO professeurs (
                        nom, sexe, matricule, lieu_naissance, date_naissance, grade,
                        pays_soutenance, universite_soutenance, numero_equivalence, arrete_equivalence,
                        date_soutenance, type_diplome, universite_attache, email, telephone,
                        numero_arrete, prime_institutionnelle, salaire_base, photo_identite,
                        copie_diplome, copie_these, commentaire, confirmation, date_creation
                    )
                    SELECT 
                        nom, sexe, matricule, lieu_naissance, date_naissance, grade,
                        pays_soutenance, universite_soutenance, numero_equivalence, arrete_equivalence,
                        date_soutenance, type_diplome, universite_attache, email, telephone,
                        numero_arrete, prime_institutionnelle, salaire_base, photo_identite,
                        copie_diplome, copie_these, commentaire, confirmation, date_creation
                    FROM professeurs_old
                `;
                this.db.run(migrateSQL);
                this.db.run("DROP TABLE professeurs_old");
                console.log('Migration des données terminée');
            }
            checkOldTable.free();
        } catch (error) {
            console.log('Aucune migration nécessaire:', error.message);
        }
        
        // Créer aussi une table pour les administrateurs
        const createAdminTableSQL = `
            CREATE TABLE IF NOT EXISTS administrateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
                derniere_connexion TEXT
            )
        `;
        
        this.db.run(createTableSQL);
        this.db.run(createAdminTableSQL);
        
        // Insérer un administrateur par défaut
        try {
            this.db.run("INSERT OR IGNORE INTO administrateurs (username, password) VALUES ('admin', 'admin123')");
        } catch (error) {
            console.log('Administrateur par défaut déjà existant');
        }
        
        this.saveDatabase();
    }

    saveDatabase() {
        const data = this.db.export();
        localStorage.setItem('professeurs_db', JSON.stringify(Array.from(data)));
    }

    async insertProfesseur(data) {
        await this.initPromise;
        
        const insertSQL = `
            INSERT INTO professeurs (
                nom, sexe, matricule, lieu_naissance, date_naissance, grade,
                pays_soutenance, universite_soutenance, numero_equivalence, arrete_equivalence,
                date_soutenance, type_diplome, universite_attache, email, telephone,
                numero_arrete, prime_institutionnelle, salaire_base, photo_identite,
                copie_diplome, copie_these, commentaire, confirmation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            this.db.run(insertSQL, Object.values(data));
            this.saveDatabase();
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'insertion:', error);
            throw error;
        }
    }

    async getAllProfesseurs() {
        await this.initPromise;
        
        const selectSQL = `
            SELECT * FROM professeurs ORDER BY date_creation DESC
        `;
        
        try {
            const stmt = this.db.prepare(selectSQL);
            const result = [];
            while (stmt.step()) {
                result.push(stmt.getAsObject());
            }
            stmt.free();
            return result;
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            return [];
        }
    }

    async searchProfesseurs(searchTerm) {
        await this.initPromise;
        
        const searchSQL = `
            SELECT * FROM professeurs 
            WHERE nom LIKE ? OR matricule LIKE ? OR telephone LIKE ?
            ORDER BY date_creation DESC
        `;
        
        try {
            const stmt = this.db.prepare(searchSQL);
            const searchPattern = `%${searchTerm}%`;
            const result = [];
            
            stmt.bind([searchPattern, searchPattern, searchPattern]);
            while (stmt.step()) {
                result.push(stmt.getAsObject());
            }
            stmt.free();
            return result;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            return [];
        }
    }

    async deleteProfesseur(id) {
        await this.initPromise;
        
        const deleteSQL = `DELETE FROM professeurs WHERE id = ?`;
        
        try {
            this.db.run(deleteSQL, [id]);
            this.saveDatabase();
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            return false;
        }
    }

    // Méthodes pour la gestion des administrateurs
    async loginAdmin(username, password) {
        await this.initPromise;
        
        const loginSQL = `
            SELECT * FROM administrateurs 
            WHERE username = ? AND password = ?
        `;
        
        try {
            const stmt = this.db.prepare(loginSQL);
            stmt.bind([username, password]);
            
            if (stmt.step()) {
                const admin = stmt.getAsObject();
                stmt.free();
                
                // Mettre à jour la dernière connexion
                const updateSQL = `UPDATE administrateurs SET derniere_connexion = datetime('now') WHERE id = ?`;
                this.db.run(updateSQL, [admin.id]);
                this.saveDatabase();
                
                return admin;
            } else {
                stmt.free();
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return null;
        }
    }

    async updateAdminPassword(username, oldPassword, newPassword) {
        await this.initPromise;
        
        // Vérifier l'ancien mot de passe
        const admin = await this.loginAdmin(username, oldPassword);
        if (!admin) {
            return false;
        }
        
        const updateSQL = `UPDATE administrateurs SET password = ? WHERE username = ?`;
        
        try {
            this.db.run(updateSQL, [newPassword, username]);
            this.saveDatabase();
            return true;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            return false;
        }
    }
}

// Gestionnaire d'authentification administrateur
class AuthManager {
    constructor(dbManager) {
        this.db = dbManager;
        this.currentAdmin = null;
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        // Modal de connexion
        const loginModal = document.getElementById('loginModal');
        const loginBtn = document.getElementById('adminLoginBtn');
        const closeLoginModal = loginModal.querySelector('.close');
        
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });
        
        closeLoginModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
        
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', this.handleLogin.bind(this));
        
        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        
        // Formulaire de changement de mot de passe
        const passwordForm = document.getElementById('passwordForm');
        passwordForm.addEventListener('submit', this.handlePasswordChange.bind(this));
        
        // Modal de changement de mot de passe
        const passwordModal = document.getElementById('passwordModal');
        const passwordChangeBtn = document.getElementById('passwordChangeBtn');
        const closePasswordModal = passwordModal.querySelector('.close');
        
        passwordChangeBtn.addEventListener('click', () => {
            if (this.currentAdmin) {
                passwordModal.style.display = 'block';
            }
        });
        
        closePasswordModal.addEventListener('click', () => {
            passwordModal.style.display = 'none';
        });
        
        // Fermer les modaux en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
        });
        
        // Initialiser les contrôles désactivés
        this.disableSearchControls();
        
        // Vérifier si un admin est déjà connecté
        this.checkExistingSession();
    }

    checkExistingSession() {
        const savedAdmin = localStorage.getItem('admin_session');
        if (savedAdmin) {
            this.currentAdmin = JSON.parse(savedAdmin);
            this.showAdminInterface();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showAuthMessage('Veuillez remplir tous les champs.', 'error');
            return;
        }
        
        const admin = await this.db.loginAdmin(username, password);
        
        if (admin) {
            this.currentAdmin = admin;
            localStorage.setItem('admin_session', JSON.stringify(admin));
            this.showAdminInterface();
            document.getElementById('loginModal').style.display = 'none';
            this.showAuthMessage('Connexion réussie !', 'success');
            document.getElementById('loginForm').reset();
        } else {
            this.showAuthMessage('Nom d\'utilisateur ou mot de passe incorrect.', 'error');
        }
    }

    handleLogout() {
        this.currentAdmin = null;
        localStorage.removeItem('admin_session');
        this.hideAdminInterface();
        this.showAuthMessage('Déconnexion réussie.', 'success');
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        if (!this.currentAdmin) {
            this.showAuthMessage('Vous devez être connecté pour changer le mot de passe.', 'error');
            return;
        }
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!oldPassword || !newPassword || !confirmPassword) {
            this.showAuthMessage('Veuillez remplir tous les champs.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showAuthMessage('Les nouveaux mots de passe ne correspondent pas.', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showAuthMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }
        
        const success = await this.db.updateAdminPassword(this.currentAdmin.username, oldPassword, newPassword);
        
        if (success) {
            this.showAuthMessage('Mot de passe mis à jour avec succès !', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            this.showAuthMessage('Ancien mot de passe incorrect.', 'error');
        }
    }

    showAdminInterface() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminStatsPanel').style.display = 'flex';
        document.getElementById('adminUsername').textContent = this.currentAdmin.username;
        
        // Activer les contrôles de recherche
        this.enableSearchControls();
        
        // Afficher les statistiques
        this.updateAdminStats();
        
        // Recharger les données maintenant que l'admin est connecté
        app.loadAndDisplayData();
    }

    hideAdminInterface() {
        document.getElementById('adminLoginBtn').style.display = 'inline-flex';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('adminStatsPanel').style.display = 'none';
        
        // Désactiver les contrôles de recherche
        this.disableSearchControls();
        
        // Masquer les données quand l'admin se déconnecte
        app.loadAndDisplayData();
    }

    enableSearchControls() {
        document.getElementById('searchInput').disabled = false;
        document.getElementById('searchBtn').disabled = false;
        document.getElementById('searchInput').placeholder = 'Rechercher un professeur...';
    }

    disableSearchControls() {
        document.getElementById('searchInput').disabled = true;
        document.getElementById('searchBtn').disabled = true;
        document.getElementById('searchInput').placeholder = 'Connexion administrateur requise pour rechercher';
        document.getElementById('searchInput').value = '';
    }

    async updateAdminStats() {
        const professeurs = await this.db.getAllProfesseurs();
        document.getElementById('totalProfesseurs').textContent = professeurs.length;
        
        if (this.currentAdmin.derniere_connexion) {
            const lastLogin = new Date(this.currentAdmin.derniere_connexion);
            document.getElementById('lastLogin').textContent = lastLogin.toLocaleString('fr-FR');
        } else {
            document.getElementById('lastLogin').textContent = 'Première connexion';
        }
    }

    showAuthMessage(message, type = 'info') {
        // Vérifier quel modal est ouvert
        const loginModal = document.getElementById('loginModal');
        const passwordModal = document.getElementById('passwordModal');
        
        let messageDiv;
        if (loginModal.style.display === 'block') {
            messageDiv = document.getElementById('authMessage');
        } else if (passwordModal.style.display === 'block') {
            messageDiv = document.getElementById('passwordMessage');
        } else {
            // Utiliser le système de messages principal
            app.showMessage(message, type);
            return;
        }
        
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    isAdmin() {
        return this.currentAdmin !== null;
    }
}

// Gestionnaire d'application principal
class ProfesseurApp {
    constructor() {
        this.db = new DatabaseManager();
        this.auth = new AuthManager(this.db);
        this.universites = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadUniversites();
        this.setupEventListeners();
        await this.loadAndDisplayData();
        this.hideLoading();
    }

    async loadUniversites() {
        try {
            const response = await fetch('./etab.json');
            this.universites = await response.json();
            this.populateUniversiteSelect();
        } catch (error) {
            console.error('Erreur lors du chargement des universités:', error);
            this.showMessage('Erreur lors du chargement des universités', 'error');
        }
    }

    populateUniversiteSelect() {
        const select = document.getElementById('universiteAttache');
        select.innerHTML = '<option value="">Sélectionnez une université</option>';
        
        this.universites.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni.shortname;
            option.textContent = uni.name;
            option.dataset.logo = uni.path;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Formulaire principal
        const form = document.getElementById('professeurForm');
        form.addEventListener('submit', this.handleFormSubmit.bind(this));
        form.addEventListener('reset', this.handleFormReset.bind(this));

        // Sélection d'université
        document.getElementById('universiteAttache').addEventListener('change', this.handleUniversiteChange.bind(this));

        // Compteur de caractères pour le commentaire
        document.getElementById('commentaire').addEventListener('input', this.updateCharCounter.bind(this));

        // Validation des fichiers
        document.getElementById('photoIdentite').addEventListener('change', this.validatePhotoFile.bind(this));
        document.getElementById('copieThese').addEventListener('change', this.validatePdfFile.bind(this));
        document.getElementById('copieDiplome').addEventListener('change', this.validateFile.bind(this));
        document.getElementById('arreteEquivalence').addEventListener('change', this.validateFile.bind(this));

        // Recherche
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchBtn.addEventListener('click', this.handleSearch.bind(this));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Modal
        const modal = document.getElementById('detailModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Validation en temps réel
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const telephoneInput = document.getElementById('telephone');
        telephoneInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const pattern = /^(\+243|0)[0-9]{9}$/;
            
            if (value && !pattern.test(value)) {
                e.target.style.borderColor = 'var(--danger-color)';
                this.showFieldError(e.target, 'Format: +243123456789 ou 0123456789');
            } else {
                e.target.style.borderColor = '';
                this.hideFieldError(e.target);
            }
        });
    }

    showFieldError(field, message) {
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: var(--danger-color); font-size: 0.875rem; margin-top: 5px;';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    hideFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    handleUniversiteChange(e) {
        const selectedOption = e.target.selectedOptions[0];
        const logoContainer = document.getElementById('universityLogo');
        
        if (selectedOption && selectedOption.dataset.logo) {
            logoContainer.innerHTML = `<img src="${selectedOption.dataset.logo}" alt="Logo ${selectedOption.textContent}">`;
        } else {
            logoContainer.innerHTML = '';
        }
    }

    updateCharCounter(e) {
        const counter = document.querySelector('.char-counter');
        const currentLength = e.target.value.length;
        counter.textContent = `${currentLength}/50 caractères`;
        
        if (currentLength > 45) {
            counter.style.color = 'var(--warning-color)';
        } else {
            counter.style.color = 'var(--secondary-color)';
        }
    }

    validatePhotoFile(e) {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 8 * 1024 * 1024; // 8MB

            if (!allowedTypes.includes(file.type)) {
                this.showMessage('Format de photo non valide. Utilisez JPG, JPEG ou PNG.', 'error');
                e.target.value = '';
                return false;
            }

            if (file.size > maxSize) {
                this.showMessage('La photo ne doit pas dépasser 8MB.', 'error');
                e.target.value = '';
                return false;
            }
        }
        return true;
    }

    validatePdfFile(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                this.showMessage('Seuls les fichiers PDF sont acceptés pour la thèse.', 'error');
                e.target.value = '';
                return false;
            }
        }
        return true;
    }

    validateFile(e) {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            
            if (!allowedTypes.includes(file.type)) {
                this.showMessage('Format de fichier non valide. Utilisez PDF, JPG, JPEG ou PNG.', 'error');
                e.target.value = '';
                return false;
            }
        }
        return true;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.showLoading();

        try {
            const formData = await this.collectFormData();
            await this.db.insertProfesseur(formData);
            
            this.showMessage('Professeur enregistré avec succès!', 'success');
            this.resetForm();
            // Ne pas recharger les données automatiquement - seulement si admin connecté
            if (this.auth.isAdmin()) {
                await this.loadAndDisplayData();
                this.auth.updateAdminStats(); // Mettre à jour les statistiques
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                // Identifier quelle contrainte a échoué
                if (error.message.includes('username')) {
                    this.showMessage('Ce nom d\'utilisateur existe déjà.', 'error');
                } else {
                    this.showMessage('Une contrainte de base de données a été violée. Veuillez vérifier vos données.', 'error');
                }
            } else {
                this.showMessage('Erreur lors de l\'enregistrement. Veuillez réessayer.', 'error');
            }
        } finally {
            this.hideLoading();
        }
    }

    validateForm() {
        const requiredFields = [
            'nom', 'sexe', 'matricule', 'lieuNaissance', 'dateNaissance',
            'grade', 'paysSoutenance', 'universiteSoutenance', 'dateSoutenance',
            'typeDiplome', 'universiteAttache', 'telephone', 'numeroArrete',
            'primeInstitutionnelle', 'salaireBase', 'photoIdentite',
            'copieDiplome', 'copieThese', 'commentaire', 'confirmation'
        ];

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value && fieldId !== 'confirmation') {
                this.showMessage(`Le champ "${field.labels[0].textContent.replace(' *', '')}" est requis.`, 'error');
                field.focus();
                return false;
            }
        }

        // Vérification spéciale pour la confirmation
        const confirmation = document.getElementById('confirmation');
        if (!confirmation.checked) {
            this.showMessage('Vous devez confirmer que les renseignements sont vrais et vérifiables.', 'error');
            return false;
        }

        // Validation du téléphone
        const telephone = document.getElementById('telephone').value;
        if (!/^(\+243|0)[0-9]{9}$/.test(telephone)) {
            this.showMessage('Le numéro de téléphone doit avoir le format +243123456789 ou 0123456789.', 'error');
            return false;
        }

        return true;
    }

    async collectFormData() {
        const formData = {};
        const form = document.getElementById('professeurForm');
        const formElements = form.elements;

        for (let element of formElements) {
            if (element.type === 'file') {
                if (element.files[0]) {
                    formData[element.name] = await this.fileToBase64(element.files[0]);
                } else {
                    formData[element.name] = null;
                }
            } else if (element.type === 'checkbox') {
                formData[element.name] = element.checked ? 1 : 0;
            } else if (element.name && element.value) {
                formData[element.name] = element.value;
            }
        }

        return [
            formData.nom,
            formData.sexe,
            formData.matricule,
            formData.lieuNaissance,
            formData.dateNaissance,
            formData.grade,
            formData.paysSoutenance,
            formData.universiteSoutenance,
            formData.numeroEquivalence || null,
            formData.arreteEquivalence,
            formData.dateSoutenance,
            formData.typeDiplome,
            formData.universiteAttache,
            formData.email || null,
            formData.telephone,
            formData.numeroArrete,
            formData.primeInstitutionnelle,
            formData.salaireBase,
            formData.photoIdentite,
            formData.copieDiplome,
            formData.copieThese,
            formData.commentaire,
            formData.confirmation
        ];
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    handleFormReset(e) {
        setTimeout(() => {
            this.resetForm();
        }, 100);
    }

    resetForm() {
        document.getElementById('universityLogo').innerHTML = '';
        document.querySelector('.char-counter').textContent = '0/50 caractères';
        document.querySelector('.char-counter').style.color = 'var(--secondary-color)';
        
        // Supprimer les erreurs de validation
        const fieldErrors = document.querySelectorAll('.field-error');
        fieldErrors.forEach(error => error.remove());
        
        // Réinitialiser les styles des champs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }

    async loadAndDisplayData() {
        // Vérifier si l'utilisateur est administrateur pour afficher les données
        if (!this.auth.isAdmin()) {
            this.displayNoAccessMessage();
            return;
        }

        try {
            const professeurs = await this.db.getAllProfesseurs();
            this.displayProfesseurs(professeurs);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showMessage('Erreur lors du chargement des données.', 'error');
        }
    }

    displayProfesseurs(professeurs) {
        const tbody = document.getElementById('professeursTableBody');
        tbody.innerHTML = '';

        if (professeurs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--secondary-color);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        Aucun professeur enregistré
                    </td>
                </tr>
            `;
            return;
        }

        professeurs.forEach(prof => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${prof.photo_identite ? 
                        `<img src="${prof.photo_identite}" alt="Photo ${prof.nom}" class="profile-img">` : 
                        '<i class="fas fa-user-circle" style="font-size: 50px; color: var(--medium-gray);"></i>'
                    }
                </td>
                <td><strong>${prof.nom}</strong></td>
                <td><code>${prof.matricule}</code></td>
                <td><span class="badge badge-${prof.grade.toLowerCase()}">${prof.grade}</span></td>
                <td>${prof.universite_attache}</td>
                <td>${prof.telephone}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="app.viewDetails(${prof.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${app.auth.isAdmin() ? `
                        <button class="btn btn-danger" onclick="app.deleteProfesseur(${prof.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Ajouter les styles des badges
        this.addBadgeStyles();
    }

    displayNoAccessMessage() {
        const tbody = document.getElementById('professeursTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--secondary-color);">
                    <i class="fas fa-lock" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--warning-color);"></i>
                    <strong>Accès restreint</strong><br>
                    Seuls les administrateurs peuvent consulter la liste des professeurs.<br>
                    <button onclick="document.getElementById('adminLoginBtn').click()" class="btn btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-user-shield"></i> Se connecter en tant qu'administrateur
                    </button>
                </td>
            </tr>
        `;
    }

    addBadgeStyles() {
        const existingStyle = document.getElementById('dynamic-badge-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'dynamic-badge-styles';
        style.textContent = `
            .badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge-pe { background: #fee2e2; color: #dc2626; }
            .badge-po { background: #dbeafe; color: #2563eb; }
            .badge-p { background: #d1fae5; color: #059669; }
            .badge-pa { background: #fef3c7; color: #d97706; }
        `;
        document.head.appendChild(style);
    }

    async handleSearch() {
        // Vérifier si l'utilisateur est administrateur pour effectuer une recherche
        if (!this.auth.isAdmin()) {
            this.showMessage('Seuls les administrateurs peuvent effectuer des recherches.', 'error');
            return;
        }

        const searchTerm = document.getElementById('searchInput').value.trim();
        
        if (!searchTerm) {
            await this.loadAndDisplayData();
            return;
        }

        this.showLoading();

        try {
            const results = await this.db.searchProfesseurs(searchTerm);
            this.displayProfesseurs(results);
            
            if (results.length === 0) {
                this.showMessage(`Aucun résultat trouvé pour "${searchTerm}"`, 'warning');
            }
        } catch (error) {
            console.error('Erreur de recherche:', error);
            this.showMessage('Erreur lors de la recherche.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewDetails(id) {
        // Vérifier si l'utilisateur est administrateur pour voir les détails
        if (!this.auth.isAdmin()) {
            this.showMessage('Seuls les administrateurs peuvent consulter les détails des professeurs.', 'error');
            return;
        }

        try {
            const professeurs = await this.db.getAllProfesseurs();
            const professeur = professeurs.find(p => p.id === id);
            
            if (!professeur) {
                this.showMessage('Professeur non trouvé.', 'error');
                return;
            }

            this.showProfesseurDetails(professeur);
        } catch (error) {
            console.error('Erreur:', error);
            this.showMessage('Erreur lors du chargement des détails.', 'error');
        }
    }

    showProfesseurDetails(professeur) {
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        const universiteInfo = this.universites.find(u => u.shortname === professeur.universite_attache);
        
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                ${professeur.photo_identite ? 
                    `<img src="${professeur.photo_identite}" alt="Photo ${professeur.nom}" class="detail-image" style="width: 120px; height: 120px; border-radius: 50%;">` : 
                    '<i class="fas fa-user-circle" style="font-size: 120px; color: var(--medium-gray);"></i>'
                }
                <h3 style="margin: 15px 0; color: var(--primary-color);">${professeur.nom}</h3>
                <p style="color: var(--secondary-color);">Matricule: ${professeur.matricule}</p>
            </div>

            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-venus-mars"></i> Sexe:</span>
                    <span class="detail-value">${professeur.sexe}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Lieu de naissance:</span>
                    <span class="detail-value">${professeur.lieu_naissance}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-calendar"></i> Date de naissance:</span>
                    <span class="detail-value">${new Date(professeur.date_naissance).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-medal"></i> Grade:</span>
                    <span class="detail-value"><span class="badge badge-${professeur.grade.toLowerCase()}">${professeur.grade}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-flag"></i> Pays de soutenance:</span>
                    <span class="detail-value">${professeur.pays_soutenance}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-university"></i> Université de soutenance:</span>
                    <span class="detail-value">${professeur.universite_soutenance}</span>
                </div>
                
                ${professeur.numero_equivalence ? `
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-certificate"></i> N° arrêté d'équivalence:</span>
                    <span class="detail-value">${professeur.numero_equivalence}</span>
                </div>
                ` : ''}
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-calendar-check"></i> Date de soutenance:</span>
                    <span class="detail-value">${new Date(professeur.date_soutenance).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-graduation-cap"></i> Type de diplôme:</span>
                    <span class="detail-value">${professeur.type_diplome}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-school"></i> Université d'attache:</span>
                    <span class="detail-value">
                        ${professeur.universite_attache}
                        ${universiteInfo ? `<br><img src="${universiteInfo.path}" alt="Logo" style="max-width: 80px; margin-top: 5px;">` : ''}
                    </span>
                </div>
                
                ${professeur.email ? `
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-envelope"></i> Email:</span>
                    <span class="detail-value"><a href="mailto:${professeur.email}">${professeur.email}</a></span>
                </div>
                ` : ''}
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-phone"></i> Téléphone:</span>
                    <span class="detail-value"><a href="tel:${professeur.telephone}">${professeur.telephone}</a></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-file-alt"></i> N° arrêté ministériel:</span>
                    <span class="detail-value">${professeur.numero_arrete}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-money-bill"></i> Prime institutionnelle:</span>
                    <span class="detail-value">${professeur.prime_institutionnelle}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-coins"></i> Salaire de base:</span>
                    <span class="detail-value">${professeur.salaire_base}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-comment"></i> Commentaire:</span>
                    <span class="detail-value">${professeur.commentaire}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-clock"></i> Date d'enregistrement:</span>
                    <span class="detail-value">${new Date(professeur.date_creation).toLocaleString('fr-FR')}</span>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    async deleteProfesseur(id) {
        // Vérifier si l'utilisateur est administrateur
        if (!this.auth.isAdmin()) {
            this.showMessage('Seuls les administrateurs peuvent supprimer des professeurs.', 'error');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce professeur ? Cette action est irréversible.')) {
            return;
        }

        this.showLoading();

        try {
            const success = await this.db.deleteProfesseur(id);
            
            if (success) {
                this.showMessage('Professeur supprimé avec succès.', 'success');
                await this.loadAndDisplayData();
                this.auth.updateAdminStats(); // Mettre à jour les statistiques
            } else {
                this.showMessage('Erreur lors de la suppression.', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showMessage('Erreur lors de la suppression.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showMessage(message, type = 'info') {
        // Supprimer les messages précédents
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const icon = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        messageDiv.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto-supprimer après 5 secondes
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Initialisation de l'application
let app;

document.addEventListener('DOMContentLoaded', () => {
    // Forcer la reconstruction de la base de données pour corriger le problème UNIQUE
    localStorage.setItem('force_rebuild_db', 'true');
    
    app = new ProfesseurApp();
});

// Service Worker pour le cache (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker enregistré:', registration);
            })
            .catch(error => {
                console.log('Erreur Service Worker:', error);
            });
    });
}
