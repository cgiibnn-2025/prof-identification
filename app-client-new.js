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

        // Charger les données et stats
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
        this.apiURL = '/api';
    }

    async getAllProfesseurs() {
        try {
            const response = await fetch(`${this.apiURL}/professeurs`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des professeurs:', error);
            throw error;
        }
    }

    async createProfesseur(formData) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du professeur:', error);
            throw error;
        }
    }

    async deleteProfesseur(id) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la suppression du professeur:', error);
            throw error;
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

            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            return false;
        }
    }
}

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
        this.sessionManager.logout();
        this.showAuthMessage('Déconnexion réussie.', 'success');
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const admin = this.sessionManager.getCurrentAdmin();
        if (!admin) return;
        
        const username = admin.username;
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
        
        const success = await this.db.updateAdminPassword(username, oldPassword, newPassword);
        
        if (success) {
            document.getElementById('passwordModal').style.display = 'none';
            this.showAuthMessage('Mot de passe modifié avec succès !', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            this.showAuthMessage('Erreur lors de la modification. Vérifiez l\'ancien mot de passe.', 'error');
        }
    }

    updateAdminStats() {
        if (!this.sessionManager.isAdmin()) return;
        
        const admin = this.sessionManager.getCurrentAdmin();
        if (admin && admin.derniere_connexion) {
            const lastLogin = new Date(admin.derniere_connexion);
            document.getElementById('lastLogin').textContent = lastLogin.toLocaleString();
        }
    }

    showAuthMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        const icon = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle', 
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        messageDiv.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Déléguer les méthodes importantes au SessionManager
    isAdmin() {
        return this.sessionManager.isAdmin();
    }

    getCurrentAdmin() {
        return this.sessionManager.getCurrentAdmin();
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
        
        await this.loadUniversites();
        this.setupEventListeners();
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
        } catch (error) {
            console.error('❌ Erreur lors du chargement des universités:', error);
            this.showMessage('Erreur lors du chargement des universités.', 'error');
        }
    }

    populateUniversiteSelect() {
        const select = document.getElementById('universiteAttache');
        if (!select) {
            console.error('❌ Élément universiteAttache non trouvé lors de populateUniversiteSelect');
            return;
        }

        select.innerHTML = '<option value="">Sélectionnez une université...</option>';
        
        console.log(`🔄 Population du select avec ${this.universites.length} universités`);
        
        this.universites.forEach(univ => {
            const option = document.createElement('option');
            option.value = univ.name;
            option.textContent = univ.name;
            select.appendChild(option);
        });
        
        console.log(`✅ Select populé avec ${select.options.length - 1} options`);
    }

    setupEventListeners() {
        const form = document.getElementById('professeurForm');
        form.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn.addEventListener('click', this.handleSearch.bind(this));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            this.showLoading();
            await this.db.createProfesseur(formData);
            this.showMessage('Professeur enregistré avec succès !', 'success');
            e.target.reset();
            
            if (this.auth.isAdmin()) {
                await this.loadAndDisplayData();
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            this.showMessage(error.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadAndDisplayData() {
        if (!this.auth.isAdmin()) {
            this.displayNoAccessMessage();
            return;
        }

        try {
            const professeurs = await this.db.getAllProfesseurs();
            this.displayProfesseurs(professeurs);
            this.updateStats(professeurs.length);
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
                        <button class="btn btn-danger" onclick="app.deleteProfesseur(${prof.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
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

    updateStats(total) {
        document.getElementById('totalProfesseurs').textContent = total;
    }

    clearDisplayedData() {
        const tbody = document.getElementById('professeursTableBody');
        tbody.innerHTML = '';
    }

    async deleteProfesseur(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
            return;
        }

        try {
            await this.db.deleteProfesseur(id);
            this.showMessage('Professeur supprimé avec succès.', 'success');
            await this.loadAndDisplayData();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            this.showMessage('Erreur lors de la suppression.', 'error');
        }
    }

    viewDetails(id) {
        // Implémentation pour voir les détails
        console.log('Voir détails pour l\'ID:', id);
    }

    handleSearch() {
        const query = document.getElementById('searchInput').value;
        console.log('Recherche:', query);
        // Implémentation de la recherche
    }

    showMessage(message, type = 'info') {
        this.auth.showAuthMessage(message, type);
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }
}

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
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'flex';
        }
    }

    hideDataTab() {
        const donneesTab = document.getElementById('donneesTab');
        if (donneesTab) {
            donneesTab.style.display = 'none';
        }
        if (this.currentTab === 'donnees') {
            this.switchTab('formulaire');
        }
    }
}

// Initialisation de l'application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ProfesseurApp();
    window.app = app; // Rendre l'app accessible globalement
    window.tabManager = new TabManager();
    
    // Vérifier s'il y a une session admin existante après l'initialisation complète
    setTimeout(() => {
        app.auth.initializeSession();
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
