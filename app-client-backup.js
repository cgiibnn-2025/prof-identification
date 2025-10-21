// Configuration de l'API pour la base de données SQLite locale
// Gestionnaire de session et d'affichage
class SessionManager {
    constructor() {
        this.currentAdmin = null;
        this.isLoggedIn = false;
    }

    // Vérifier la session au démarrage
    initializeSession() {
        const savedAdmin = localStorage.getItem('admin_session');
        if (savedAdmin) {
            try {
                this.currentAdmin = JSON.parse(savedAdmin);
                this.isLoggedIn = true;
                this.showAdminMode();
                return true;
            } catch (error) {
                console.error('Erreur lors de la lecture de la session:', error);
                this.clearSession();
                return false;
            }
        }
        this.showPublicMode();
        return false;
    }

    // Connexion admin
    login(adminData) {
        this.currentAdmin = adminData;
        this.isLoggedIn = true;
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        this.showAdminMode();
    }

    // Déconnexion
    logout() {
        this.currentAdmin = null;
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
        this.showPublicMode();
    }

    // Effacer la session (en cas d'erreur)
    clearSession() {
        this.currentAdmin = null;
        this.isLoggedIn = false;
        localStorage.removeItem('admin_session');
    }

    // Afficher le mode administrateur
    showAdminMode() {
        console.log('🔐 Mode administrateur activé');
        
        // Interface admin
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminStatsPanel').style.display = 'flex';
        
        if (this.currentAdmin && this.currentAdmin.username) {
            document.getElementById('adminUsername').textContent = this.currentAdmin.username;
        }

        // Afficher l'onglet des données
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'flex';
        }

        // Basculer vers l'onglet des données
        if (window.tabManager) {
            window.tabManager.switchTab('donnees');
        }

        // Activer les contrôles de recherche
        this.enableSearchControls();

        // Charger les données
        if (window.app) {
            window.app.loadAndDisplayData();
            window.app.auth.updateAdminStats();
        }
    }

    // Afficher le mode public
    showPublicMode() {
        console.log('👤 Mode public activé');
        
        // Interface publique
        document.getElementById('adminLoginBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('adminStatsPanel').style.display = 'none';

        // Cacher l'onglet des données
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'none';
        }

        // Basculer vers l'onglet formulaire
        if (window.tabManager) {
            window.tabManager.switchTab('formulaire');
        }

        // Désactiver les contrôles de recherche
        this.disableSearchControls();

        // Vider les données affichées
        if (window.app) {
            window.app.clearDisplayedData();
        }
    }

    // Activer les contrôles de recherche
    enableSearchControls() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.disabled = false;
            searchInput.placeholder = 'Rechercher un professeur...';
        }
        if (searchBtn) {
            searchBtn.disabled = false;
        }
    }

    // Désactiver les contrôles de recherche
    disableSearchControls() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = 'Connexion admin requise';
            searchInput.value = '';
        }
        if (searchBtn) {
            searchBtn.disabled = true;
        }
    }

    // Vérifier si l'utilisateur est connecté
    isAdmin() {
        return this.isLoggedIn && this.currentAdmin !== null;
    }

    // Obtenir les données de l'admin actuel
    getCurrentAdmin() {
        return this.currentAdmin;
    }
}

class DatabaseManager {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
    }

    async insertProfesseur(formData) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l\'enregistrement');
            }
            
            return result;
        } catch (error) {
            console.error('Erreur lors de l\'insertion:', error);
            throw error;
        }
    }

    async getAllProfesseurs() {
        try {
            const response = await fetch(`${this.apiURL}/professeurs`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            return [];
        }
    }

    async searchProfesseurs(searchTerm) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs/search/${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la recherche');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            return [];
        }
    }

    async deleteProfesseur(id) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            return false;
        }
    }

    async loginAdmin(username, password) {
        try {
            const response = await fetch(`${this.apiURL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (!response.ok) {
                return null;
            }
            
            return result.admin;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return null;
        }
    }

    async updateAdminPassword(username, oldPassword, newPassword) {
        try {
            const response = await fetch(`${this.apiURL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, oldPassword, newPassword })
            });

            const result = await response.json();
            
            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            return false;
        }
    }

    async getStats() {
        try {
            const response = await fetch(`${this.apiURL}/stats`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des statistiques');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return { totalProfesseurs: 0 };
        }
    }
}

// Gestionnaire d'authentification administrateur
class AuthManager {
    constructor(dbManager) {
        this.db = dbManager;
        this.sessionManager = new SessionManager();
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
        passwordForm.addEventListener('submit', this.handlePasswordChange.bind(this));
        
        // Modal de changement de mot de passe
        const passwordModal = document.getElementById('passwordModal');
        const passwordBtn = document.getElementById('passwordChangeBtn');
        const closePasswordModal = passwordModal.querySelector('.close');
        
        passwordBtn.addEventListener('click', () => {
            passwordModal.style.display = 'block';
        });
        
        closePasswordModal.addEventListener('click', () => {
            passwordModal.style.display = 'none';
        });

        // Fermer modals en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
        });
    }

    // Initialiser la session au démarrage
    initializeSession() {
        return this.sessionManager.initializeSession();
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
            this.sessionManager.login(admin);
            document.getElementById('loginModal').style.display = 'none';
            this.showAuthMessage('Connexion réussie !', 'success');
            document.getElementById('loginForm').reset();
        } else {
            this.showAuthMessage('Nom d\'utilisateur ou mot de passe incorrect.', 'error');
        }
    }

    handleLogout() {
    handleLogout() {
        this.sessionManager.logout();
        this.showAuthMessage('Déconnexion réussie.', 'success');
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        if (!this.currentAdmin) {
            this.showAuthMessage('Vous devez être connecté pour changer le mot de passe.', 'error');
            return;
        }
        
        const oldPasswordEl = document.getElementById('oldPassword');
        const newPasswordEl = document.getElementById('newPassword');
        const confirmPasswordEl = document.getElementById('confirmPassword');
        
        if (!oldPasswordEl || !newPasswordEl || !confirmPasswordEl) {
            this.showAuthMessage('Erreur: éléments du formulaire introuvables.', 'error');
            return;
        }
        
        const oldPassword = oldPasswordEl.value;
        const newPassword = newPasswordEl.value;
        const confirmPassword = confirmPasswordEl.value;
        
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
            const passwordForm = document.getElementById('passwordForm');
            if (passwordForm) {
                passwordForm.reset();
            }
        } else {
            this.showAuthMessage('Ancien mot de passe incorrect.', 'error');
        }
    }

    showAdminInterface() {
        document.getElementById('adminLoginBtn').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminStatsPanel').style.display = 'flex';
        document.getElementById('adminUsername').textContent = this.currentAdmin.username;
        
        // Afficher l'onglet des données des professeurs
        if (window.tabManager) {
            window.tabManager.showDataTab();
            console.log('✅ Onglet des données affiché pour les admins');
        }
        
        // Activer les contrôles de recherche
        this.enableSearchControls();
        
        // Afficher les statistiques
        this.updateAdminStats();
        
        // Recharger les données maintenant que l'admin est connecté
        app.loadAndDisplayData();
    }

    hideAdminInterface() {
        document.getElementById('adminLoginBtn').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('adminStatsPanel').style.display = 'none';
        
        // Cacher l'onglet des données et revenir au formulaire
        if (window.tabManager) {
            window.tabManager.hideDataTab();
            console.log('✅ Onglet des données caché pour les utilisateurs normaux');
        }
        
        // Désactiver les contrôles de recherche
        this.disableSearchControls();
        
        // Vider les données affichées car l'utilisateur n'est plus admin
        app.clearDisplayedData();
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
        const stats = await this.db.getStats();
        document.getElementById('totalProfesseurs').textContent = stats.totalProfesseurs;
        
        if (this.currentAdmin.derniere_connexion) {
            const lastLogin = new Date(this.currentAdmin.derniere_connexion);
            document.getElementById('lastLogin').textContent = lastLogin.toLocaleString('fr-FR');
        } else {
            document.getElementById('lastLogin').textContent = 'Première connexion';
        }
    }

    showAuthMessage(message, type = 'info') {
        // Vérifier quel modal est ouvert en utilisant une méthode plus robuste
        const loginModal = document.getElementById('loginModal');
        const passwordModal = document.getElementById('passwordModal');
        
        let messageDiv = null;
        
        // Vérifier si le modal de connexion est visible
        if (loginModal && (loginModal.style.display === 'block' || 
            window.getComputedStyle(loginModal).display === 'block')) {
            messageDiv = document.getElementById('authMessage');
        } 
        // Vérifier si le modal de changement de mot de passe est visible
        else if (passwordModal && (passwordModal.style.display === 'block' || 
                 window.getComputedStyle(passwordModal).display === 'block')) {
            messageDiv = document.getElementById('passwordMessage');
        }
        
        // Si aucun modal n'est ouvert ou si l'élément message n'existe pas
        if (!messageDiv) {
            // Utiliser le système de messages principal
            if (typeof app !== 'undefined' && app.showMessage) {
                app.showMessage(message, type);
            } else {
                console.log(`Message ${type}: ${message}`);
            }
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
        console.log('🚀 Initialisation de l\'application...');
        
        // Vérifier que les éléments DOM existent
        const select = document.getElementById('universiteAttache');
        if (!select) {
            console.error('❌ Élément universiteAttache non trouvé au moment de l\'init');
        } else {
            console.log('✅ Élément universiteAttache trouvé');
        }
        
        await this.loadUniversites();
        this.setupEventListeners();
        
        // Note: La vérification de session se fait après l'initialisation du TabManager
        
        await this.loadAndDisplayData();
        this.hideLoading();
        
        console.log('✅ Initialisation terminée');
    }

    async loadUniversites() {
        try {
            console.log('🔄 Chargement des universités...');
            const response = await fetch('./etab.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.universites = await response.json();
            console.log(`✅ ${this.universites.length} universités chargées`);
            
            this.populateUniversiteSelect();
            console.log('✅ Dropdown peuplé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des universités:', error);
            this.showMessage('Erreur lors du chargement des universités', 'error');
        }
    }

    populateUniversiteSelect() {
        const select = document.getElementById('universiteAttache');
        
        if (!select) {
            console.error('❌ Élément select "universiteAttache" non trouvé');
            return;
        }
        
        console.log('🔄 Peuplement du dropdown universités...');
        select.innerHTML = '<option value="">Sélectionnez une université</option>';
        
        if (!this.universites || this.universites.length === 0) {
            console.error('❌ Aucune université à afficher');
            return;
        }
        
        this.universites.forEach((uni, index) => {
            const option = document.createElement('option');
            option.value = uni.shortname;
            option.textContent = uni.name;
            option.dataset.logo = uni.path;
            select.appendChild(option);
            
            if (index < 3) { // Log les 3 premières pour debug
                console.log(`📍 Ajouté: ${uni.shortname} - ${uni.name}`);
            }
        });
        
        console.log(`✅ ${this.universites.length} universités ajoutées au dropdown`);
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
            const formData = new FormData();
            const form = document.getElementById('professeurForm');
            
            // Ajouter tous les champs du formulaire
            const formElements = form.elements;
            for (let element of formElements) {
                if (element.name && element.type !== 'file') {
                    if (element.type === 'checkbox') {
                        formData.append(element.name, element.checked);
                    } else if (element.value) {
                        formData.append(element.name, element.value);
                    }
                }
            }
            
            // Ajouter les fichiers
            const fileFields = ['photoIdentite', 'copieDiplome', 'copieThese', 'arreteEquivalence'];
            fileFields.forEach(fieldName => {
                const fileInput = document.getElementById(fieldName);
                if (fileInput.files[0]) {
                    formData.append(fieldName, fileInput.files[0]);
                }
            });

            const result = await this.db.insertProfesseur(formData);
            
            this.showMessage('Professeur enregistré avec succès!', 'success');
            this.resetForm();
            
            // Recharger les données si admin connecté
            if (this.auth.isAdmin()) {
                await this.loadAndDisplayData();
                this.auth.updateAdminStats();
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showMessage('Erreur lors de l\'enregistrement. Veuillez réessayer.', 'error');
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
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--secondary-color);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        Aucun professeur enregistré
                    </td>
                </tr>
            `;
            return;
        }

        professeurs.forEach(prof => {
            const row = document.createElement('tr');
            
            // Créer les liens pour les documents
            const createDocumentLinks = (prof) => {
                const documents = [];
                
                if (prof.photo_identite) {
                    documents.push(`<a href="/files/${prof.photo_identite}" target="_blank" class="doc-link" title="Photo d'identité"><i class="fas fa-image"></i> Photo</a>`);
                }
                if (prof.copie_diplome) {
                    documents.push(`<a href="/files/${prof.copie_diplome}" target="_blank" class="doc-link" title="Copie du diplôme"><i class="fas fa-graduation-cap"></i> Diplôme</a>`);
                }
                if (prof.copie_these) {
                    documents.push(`<a href="/files/${prof.copie_these}" target="_blank" class="doc-link" title="Copie de la thèse"><i class="fas fa-book"></i> Thèse</a>`);
                }
                if (prof.arrete_equivalence) {
                    documents.push(`<a href="/files/${prof.arrete_equivalence}" target="_blank" class="doc-link" title="Arrêté d'équivalence"><i class="fas fa-file-alt"></i> Arrêté</a>`);
                }
                
                return documents.length > 0 ? documents.join('<br>') : '<span class="no-docs">Aucun document</span>';
            };
            
            row.innerHTML = `
                <td>
                    ${prof.photo_identite ? 
                        `<img src="/files/${prof.photo_identite}" alt="Photo ${prof.nom}" class="profile-img">` : 
                        '<i class="fas fa-user-circle" style="font-size: 50px; color: var(--medium-gray);"></i>'
                    }
                </td>
                <td><strong>${prof.nom}</strong></td>
                <td><code>${prof.matricule}</code></td>
                <td><span class="badge badge-${prof.grade.toLowerCase()}">${prof.grade}</span></td>
                <td>${prof.universite_attache}</td>
                <td>${prof.telephone}</td>
                <td class="documents-cell">
                    ${createDocumentLinks(prof)}
                </td>
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
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--secondary-color);">
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
                this.auth.updateAdminStats();
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

// Gestionnaire de navigation par onglets
class TabManager {
    constructor() {
        this.currentTab = 'formulaire';
        this.initTabNavigation();
    }

    initTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Retirer la classe active de tous les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Cacher toutes les pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // Activer l'onglet et la page sélectionnés
        const targetTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const targetPage = document.getElementById(`page-${tabName}`);

        if (targetTabBtn && targetPage) {
            targetTabBtn.classList.add('active');
            targetPage.classList.add('active');
            this.currentTab = tabName;
            
            // Ajuster la largeur du conteneur selon la page
            const container = document.querySelector('.container');
            if (tabName === 'donnees') {
                container.classList.add('wide-container');
            } else {
                container.classList.remove('wide-container');
            }
        }
    }

    showDataTab() {
        // Afficher l'onglet des données pour les admins
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'flex';
        }
    }

    hideDataTab() {
        // Cacher l'onglet des données et revenir au formulaire
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'none';
        }
        // Revenir au formulaire si on était sur l'onglet données
        if (this.currentTab === 'donnees') {
            this.switchTab('formulaire');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    app = new ProfesseurApp();
    window.tabManager = new TabManager();
    
    // Vérifier s'il y a une session admin existante après l'initialisation complète
    setTimeout(() => {
        app.auth.checkExistingSession();
    }, 100);
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
