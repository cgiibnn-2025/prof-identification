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

        // Afficher le bouton d'exportation PDF
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.style.display = 'inline-flex';
        }

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

        // Cacher le bouton d'exportation PDF
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.style.display = 'none';
        }

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

    async getProfesseurById(id) {
        try {
            const response = await fetch(`${this.apiURL}/professeurs/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération du professeur:', error);
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

    async searchProfesseur(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                return await this.getAllProfesseurs();
            }

            const response = await fetch(`${this.apiURL}/professeurs/search/${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            throw error;
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
        this.pdfExporter = new PDFExporter();
        this.universites = [];
        this.currentEditId = null;
        this.editingProfesseurId = null; // Pour gérer le mode édition
        this.currentProfesseurData = null; // Pour stocker les données du professeur dans la modal
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
        const universityFilter = document.getElementById('universityFilter');
        
        searchBtn.addEventListener('click', this.handleSearch.bind(this));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Gestion du filtre par université
        if (universityFilter) {
            universityFilter.addEventListener('change', this.handleUniversityFilter.bind(this));
            this.loadUniversities();
        }

        // Gestion du choix de diplôme (Oui/Non)
        const possedeDiplomeSelect = document.getElementById('possedeDiplome');
        if (possedeDiplomeSelect) {
            possedeDiplomeSelect.addEventListener('change', this.handleDiplomaChoice.bind(this));
        }

        // Gestion du choix d'université (afficher champ "Autres" si nécessaire)
        const universiteAttacheSelect = document.getElementById('universiteAttache');
        if (universiteAttacheSelect) {
            universiteAttacheSelect.addEventListener('change', this.handleUniversiteChoice.bind(this));
        }

        // Bouton d'exportation PDF de la liste
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        exportPdfBtn.addEventListener('click', this.handleExportPDF.bind(this));

        // Bouton d'exportation PDF des détails
        const exportDetailPdfBtn = document.getElementById('exportDetailPdfBtn');
        exportDetailPdfBtn.addEventListener('click', this.handleExportDetailPDF.bind(this));
    }

    handleDiplomaChoice() {
        const possedeDiplomeSelect = document.getElementById('possedeDiplome');
        const diplomaSection = document.getElementById('diplomaSection');
        const documentEquivalentSection = document.getElementById('documentEquivalentSection');
        const copieDiplomeInput = document.getElementById('copieDiplome');
        const documentEquivalentInput = document.getElementById('documentEquivalent');
        
        const choice = possedeDiplomeSelect.value;
        
        if (choice === 'Oui') {
            // Afficher le champ diplôme
            diplomaSection.style.display = 'block';
            documentEquivalentSection.style.display = 'none';
            copieDiplomeInput.required = true;
            documentEquivalentInput.required = false;
        } else if (choice === 'Non') {
            // Afficher le champ documents équivalents
            diplomaSection.style.display = 'none';
            documentEquivalentSection.style.display = 'block';
            copieDiplomeInput.required = false;
            documentEquivalentInput.required = true;
        } else {
            // Masquer les deux
            diplomaSection.style.display = 'none';
            documentEquivalentSection.style.display = 'none';
            copieDiplomeInput.required = false;
            documentEquivalentInput.required = false;
        }
    }

    handleUniversiteChoice() {
        const universiteAttacheSelect = document.getElementById('universiteAttache');
        const autresUniversiteSection = document.getElementById('autresUniversiteSection');
        const autresUniversiteInput = document.getElementById('autresUniversite');
        
        const choice = universiteAttacheSelect.value;
        
        if (choice === 'Autres') {
            // Afficher le champ pour préciser l'université
            autresUniversiteSection.style.display = 'block';
            autresUniversiteInput.required = true;
        } else {
            // Masquer le champ
            autresUniversiteSection.style.display = 'none';
            autresUniversiteInput.required = false;
            autresUniversiteInput.value = ''; // Vider le champ
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            this.showLoading();
            
            // Vérifier si l'utilisateur a saisi une université personnalisée
            const universiteAttache = formData.get('universiteAttache');
            const autresUniversite = formData.get('autresUniversite');
            
            if (universiteAttache === 'Autres' && autresUniversite && autresUniversite.trim()) {
                // Ajouter l'université à etab-new.json
                await this.addNewUniversity(autresUniversite.trim());
                
                // Mettre à jour formData avec le nom de l'université personnalisée
                formData.set('universiteAttache', autresUniversite.trim());
            }
            
            // Vérifier si c'est une édition ou une création
            if (this.editingProfesseurId) {
                // Mode édition
                await fetch(`${this.db.apiURL}/professeurs/${this.editingProfesseurId}`, {
                    method: 'PUT',
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.error || `HTTP ${response.status}`);
                        });
                    }
                    return response.json();
                });
                
                this.showMessage('Professeur mis à jour avec succès !', 'success');
                this.editingProfesseurId = null;
                document.getElementById('submitBtn').textContent = 'Enregistrer le professeur';
            } else {
                // Mode création
                await this.db.createProfesseur(formData);
                this.showMessage('Professeur enregistré avec succès ! Les données seront affichées dans l\'onglet "Données des professeurs"', 'success');
            }
            
            e.target.reset();
            
            // Recharger et afficher les données si l'admin est connecté
            if (this.auth.isAdmin()) {
                // Basculer automatiquement à l'onglet des données
                if (window.tabManager) {
                    window.tabManager.switchTab('donnees');
                }
                await this.loadAndDisplayData();
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            this.showMessage(error.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async addNewUniversity(universityName) {
        try {
            const response = await fetch(`${this.db.apiURL}/universities/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: universityName,
                    shortname: universityName.substring(0, 10).toUpperCase(),
                    path: `LOGO/${universityName.replace(/\s+/g, '-')}.png`
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de l\'ajout de l\'université');
            }

            console.log(`✅ Université '${universityName}' ajoutée à etab-new.json`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'université:', error);
            // On ne lance pas d'erreur pour ne pas bloquer l'enregistrement du professeur
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
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="app.viewDetails(${prof.id})" title="Voir détails du professeur">
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

    async viewDetails(id) {
        try {
            this.showLoading();
            const professeur = await this.db.getProfesseurById(id);
            this.showProfesseurDetails(professeur);
        } catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            this.showMessage('Erreur lors de la récupération des détails du professeur.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        
        if (!query) {
            // Si la recherche est vide, charger tous les professeurs
            await this.loadAndDisplayData();
            return;
        }

        try {
            this.showLoading();
            const results = await this.db.searchProfesseur(query);
            
            if (results.length === 0) {
                this.showMessage(`Aucun résultat pour "${query}"`, 'warning');
                this.displayProfesseurs([]);
            } else {
                this.showMessage(`${results.length} résultat(s) trouvé(s)`, 'success');
                this.displayProfesseurs(results);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            this.showMessage('Erreur lors de la recherche.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadUniversities() {
        try {
            const response = await fetch('/api/universities');
            const universities = await response.json();
            
            const universityFilter = document.getElementById('universityFilter');
            universities.forEach(uni => {
                const option = document.createElement('option');
                option.value = uni;
                option.textContent = uni;
                universityFilter.appendChild(option);
            });

            // Activer le filtre
            universityFilter.disabled = false;
        } catch (error) {
            console.error('Erreur lors du chargement des universités:', error);
        }
    }

    async handleUniversityFilter() {
        const selectedUniversity = document.getElementById('universityFilter').value;
        
        try {
            this.showLoading();
            
            if (!selectedUniversity) {
                // Si aucune université sélectionnée, afficher tous
                await this.loadAndDisplayData();
            } else {
                // Récupérer les professeurs filtrés par université
                const response = await fetch(`/api/professeurs?university=${encodeURIComponent(selectedUniversity)}`);
                const results = await response.json();
                this.displayProfesseurs(results);
            }
        } catch (error) {
            console.error('Erreur lors du filtrage:', error);
            this.showMessage('Erreur lors du filtrage.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleExportPDF() {
        if (!this.auth.isAdmin()) {
            this.showMessage('Accès refusé. Connexion admin requise.', 'error');
            return;
        }

        try {
            this.showLoading();
            const professeurs = await this.db.getAllProfesseurs();
            
            if (professeurs.length === 0) {
                this.showMessage('Aucune donnée à exporter.', 'warning');
                return;
            }

            await this.pdfExporter.exportProfesseursList(professeurs);
            this.showMessage('Liste des professeurs exportée avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'exportation PDF:', error);
            this.showMessage('Erreur lors de l\'exportation PDF.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleExportDetailPDF() {
        if (!this.currentProfesseurData) {
            this.showMessage('Aucune donnée de professeur à exporter.', 'error');
            return;
        }

        try {
            await this.pdfExporter.exportProfesseurDetails(this.currentProfesseurData);
            this.showMessage('Détails du professeur exportés avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'exportation des détails:', error);
            this.showMessage('Erreur lors de l\'exportation des détails.', 'error');
        }
    }

    showProfesseurDetails(professeur) {
        // Stocker les données pour l'exportation
        this.currentProfesseurData = professeur;
        
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');
        
        // Formatage des dates
        const formatDate = (dateString) => {
            if (!dateString) return 'Non disponible';
            try {
                return new Date(dateString).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch {
                return dateString;
            }
        };

        const dateEnregistrement = professeur.date_creation ? 
            new Date(professeur.date_creation).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Non disponible';

        // Création du contenu HTML des détails - COMPLET
        modalBody.innerHTML = `
            <div class="professor-details">
                <!-- ENTÊTE AVEC PHOTO -->
                <div class="detail-section">
                    <div class="detail-header">
                        <div class="photo-section">
                            ${professeur.photo_identite ? 
                                `<img src="/files/${professeur.photo_identite}" alt="Photo ${professeur.nom}" class="detail-photo">` : 
                                '<div class="detail-photo-placeholder"><i class="fas fa-user-circle"></i></div>'
                            }
                        </div>
                        <div class="name-section">
                            <h2 class="professor-name">${professeur.nom || 'Non renseigné'}</h2>
                            <p class="professor-matricule"><strong>Matricule:</strong> <code>${professeur.matricule || 'Non renseigné'}</code></p>
                            <span class="grade-badge badge-${(professeur.grade || '').toLowerCase()}">${professeur.grade || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                <!-- INFORMATIONS PERSONNELLES -->
                <div class="detail-section">
                    <h3><i class="fas fa-id-card"></i> Informations Personnelles</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Nom complet:</label>
                            <span>${professeur.nom || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Sexe:</label>
                            <span>${professeur.sexe || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Lieu de naissance:</label>
                            <span>${professeur.lieu_naissance || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date de naissance:</label>
                            <span>${formatDate(professeur.date_naissance)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Téléphone:</label>
                            <span>${professeur.telephone || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${professeur.email || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                <!-- INFORMATIONS ACADÉMIQUES ET DE DOCTORAT -->
                <div class="detail-section">
                    <h3><i class="fas fa-graduation-cap"></i> Informations Académiques</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Grade:</label>
                            <span class="badge badge-${(professeur.grade || '').toLowerCase()}">${professeur.grade || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Université d'attache:</label>
                            <span>${professeur.universite_attache || 'Non renseignée'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type de diplôme de doctorat:</label>
                            <span>${professeur.type_diplome || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date de soutenance:</label>
                            <span>${formatDate(professeur.date_soutenance)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Pays de soutenance:</label>
                            <span>${professeur.pays_soutenance || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Université de soutenance:</label>
                            <span>${professeur.universite_soutenance || 'Non renseignée'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Domaine de recherche:</label>
                            <span>${professeur.domaine_recherche || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Sujet ou intitulé de la thèse:</label>
                            <span>${professeur.sujet_these || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                <!-- ÉQUIVALENCES ET ARRÊTÉS -->
                <div class="detail-section">
                    <h3><i class="fas fa-certificate"></i> Équivalences et Arrêtés</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Numéro d'équivalence (si diplôme hors RDC):</label>
                            <span>${professeur.numero_equivalence || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Référence du dernier arrêté ministériel:</label>
                            <span>${professeur.numero_arrete || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                <!-- INFORMATIONS FINANCIÈRES -->
                <div class="detail-section">
                    <h3><i class="fas fa-money-bill-wave"></i> Informations Financières</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Salaire de base:</label>
                            <span class="badge badge-${professeur.salaire_base === 'Oui' ? 'success' : 'secondary'}">${professeur.salaire_base || 'Non renseigné'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Prime institutionnelle:</label>
                            <span class="badge badge-${professeur.prime_institutionnelle === 'Oui' ? 'success' : 'secondary'}">${professeur.prime_institutionnelle || 'Non renseignée'}</span>
                        </div>
                    </div>
                </div>

                <!-- DOCUMENTS -->
                <div class="detail-section">
                    <h3><i class="fas fa-file-alt"></i> Documents</h3>
                    <div class="documents-list">
                        ${professeur.photo_identite ? 
                            `<a href="/files/${professeur.photo_identite}" target="_blank" class="doc-link" title="Photo d'identité"><i class="fas fa-image"></i> Photo</a>` : 
                            `<span class="doc-link-missing"><i class="fas fa-times-circle"></i> Photo</span>`
                        }
                        ${professeur.possede_diplome === 'Oui' ? (
                            professeur.copie_diplome ? 
                                `<a href="/files/${professeur.copie_diplome}" target="_blank" class="doc-link" title="Copie du diplôme"><i class="fas fa-graduation-cap"></i> Diplôme</a>` : 
                                `<span class="doc-link-missing"><i class="fas fa-times-circle"></i> Diplôme</span>`
                        ) : (
                            professeur.document_equivalent ? (
                                professeur.document_equivalent.split(',').map(doc => doc.trim()).map(doc => 
                                    `<a href="/files/${doc}" target="_blank" class="doc-link" title="Document équivalent"><i class="fas fa-file"></i> Equivalent-diplôme</a>`
                                ).join('')
                            ) : 
                                `<span class="doc-link-missing"><i class="fas fa-times-circle"></i> Equivalent-diplôme</span>`
                        )}
                        ${professeur.copie_these ? (
                            professeur.copie_these.includes(',') ? (
                                professeur.copie_these.split(',').map(doc => doc.trim()).map(doc => 
                                    `<a href="/files/${doc}" target="_blank" class="doc-link" title="Copie de la thèse"><i class="fas fa-book"></i> Thèse</a>`
                                ).join('')
                            ) : (
                                `<a href="/files/${professeur.copie_these}" target="_blank" class="doc-link" title="Copie de la thèse"><i class="fas fa-book"></i> Thèse</a>`
                            )
                        ) : 
                            `<span class="doc-link-missing"><i class="fas fa-times-circle"></i> Thèse</span>`
                        }
                        ${professeur.arrete_equivalence ? 
                            `<a href="/files/${professeur.arrete_equivalence}" target="_blank" class="doc-link" title="Arrêté d'équivalence"><i class="fas fa-file-alt"></i> Arrêté</a>` : 
                            ``
                        }
                    </div>
                </div>

                <!-- COMMENTAIRES -->
                <div class="detail-section">
                    <h3><i class="fas fa-comment"></i> Commentaires / Notes</h3>
                    <div class="detail-grid">
                        <div class="detail-item full-width">
                            <span>${professeur.commentaire || 'Aucun commentaire'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Afficher la modal
        modal.style.display = 'block';
        
        // Afficher le bouton Éditer seulement si l'admin est connecté
        const editBtn = document.getElementById('editDetailBtn');
        if (editBtn) {
            editBtn.style.display = this.auth.isAdmin() ? 'inline-block' : 'none';
        }
        
        // Gérer la fermeture de la modal
        this.setupDetailModalListeners();
    }

    setupDetailModalListeners() {
        const modal = document.getElementById('detailModal');
        const closeBtn = modal.querySelector('.close');
        const editBtn = document.getElementById('editDetailBtn');
        
        // Bouton Éditer
        if (editBtn) {
            editBtn.onclick = () => {
                if (this.currentProfesseurData) {
                    this.loadEditForm(this.currentProfesseurData);
                    modal.style.display = 'none';
                }
            };
        }
        
        // Fermer avec le bouton X
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        // Fermer en cliquant à l'extérieur (créer un nouvel event listener spécifique)
        const handleModalClick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.removeEventListener('click', handleModalClick);
            }
        };
        
        document.addEventListener('click', handleModalClick);
        
        // Fermer avec la touche Escape
        const handleKeyPress = (event) => {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
    }

    loadEditForm(professeur) {
        // Charger les données du professeur dans le formulaire
        document.getElementById('nom').value = professeur.nom || '';
        document.getElementById('sexe').value = professeur.sexe || '';
        document.getElementById('matricule').value = professeur.matricule || '';
        document.getElementById('lieuNaissance').value = professeur.lieu_naissance || '';
        document.getElementById('dateNaissance').value = professeur.date_naissance || '';
        document.getElementById('grade').value = professeur.grade || '';
        document.getElementById('paysSoutenance').value = professeur.pays_soutenance || '';
        document.getElementById('universiteSoutenance').value = professeur.universite_soutenance || '';
        document.getElementById('numeroEquivalence').value = professeur.numero_equivalence || '';
        document.getElementById('dateSoutenance').value = professeur.date_soutenance || '';
        document.getElementById('typeDiplome').value = professeur.type_diplome || '';
        document.getElementById('universiteAttache').value = professeur.universite_attache || '';
        document.getElementById('email').value = professeur.email || '';
        document.getElementById('telephone').value = professeur.telephone || '';
        document.getElementById('numeroArrete').value = professeur.numero_arrete || '';
        document.getElementById('primeInstitutionnelle').value = professeur.prime_institutionnelle || '';
        document.getElementById('salaireBase').value = professeur.salaire_base || '';
        document.getElementById('sujetThese').value = professeur.sujet_these || '';
        document.getElementById('commentaire').value = professeur.commentaire || '';
        document.getElementById('possedeDiplome').value = professeur.possede_diplome || '';
        
        // Déclencher handleDiplomaChoice pour afficher les bons champs
        if (professeur.possede_diplome) {
            this.handleDiplomaChoice();
        }
        
        // Marquer le formulaire comme en mode édition
        this.editingProfesseurId = professeur.id;
        document.getElementById('submitBtn').textContent = 'Mettre à jour le professeur';
        
        // Aller à l'onglet du formulaire
        document.querySelector('input[name="tab"][value="form"]').checked = true;
        const formSection = document.querySelector('.tab-content[data-tab="form"]');
        if (formSection) {
            formSection.style.display = 'block';
        }
        const donneesSection = document.querySelector('.tab-content[data-tab="donnees"]');
        if (donneesSection) {
            donneesSection.style.display = 'none';
        }
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

    console.log('✅ Application initialisée avec exportation PDF');
});

// Gestionnaire d'exportation PDF
class PDFExporter {
    constructor() {
        this.logoDataUrl = null;
        this.loadLogo();
    }

    async loadLogo() {
        try {
            const response = await fetch('./app-logo.png');
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    this.logoDataUrl = reader.result;
                    resolve();
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Erreur lors du chargement du logo:', error);
        }
    }

    addHeader(doc) {
        // Ajouter le logo si disponible
        if (this.logoDataUrl) {
            doc.addImage(this.logoDataUrl, 'PNG', 15, 10, 55, 15);
        }

        // Titre de l'application - aligné à droite du logo
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('ESU-RSI', 80, 16);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text('Corps académique du MINESURSI', 75, 22);
        
        doc.setFontSize(9);
        doc.text('Registre d\'Identification des Professeurs', 75, 27);

        // Ligne de séparation
        doc.setLineWidth(1);
        doc.setDrawColor(30, 64, 175);
        doc.line(15, 32, 195, 32);

        // Reset des couleurs
        doc.setTextColor(0, 0, 0);

        return 45; // Position Y après l'en-tête
    }

    async exportProfesseursList(professeurs) {
        await this.loadLogo();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Ajouter l'en-tête
        let yPosition = this.addHeader(doc);

        // Section titre du document avec fond
        doc.setFillColor(30, 64, 175);
        doc.rect(15, yPosition - 5, 180, 16, 'F');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('LISTE DES PROFESSEURS', 105, yPosition + 3, { align: 'center' });
        
        yPosition += 20;

        // Préparer les données pour le tableau avec meilleur formatage
        const headers = [
            { content: '#', styles: { halign: 'center' } },
            { content: 'Nom Complet', styles: { halign: 'left' } },
            { content: 'Matricule', styles: { halign: 'center' } },
            { content: 'Grade', styles: { halign: 'center' } },
            { content: 'Université d\'Attache', styles: { halign: 'left' } },
            { content: 'Téléphone', styles: { halign: 'center' } },
            { content: 'Email', styles: { halign: 'left' } }
        ];
        
        const data = professeurs.map((prof, index) => [
            { content: (index + 1).toString(), styles: { halign: 'center' } },
            { content: prof.nom || 'N/A', styles: { halign: 'left', fontStyle: 'bold' } },
            { content: prof.matricule || 'N/A', styles: { halign: 'center' } },
            { content: prof.grade || 'N/A', styles: { halign: 'center' } },
            { content: prof.universite_attache || 'N/A', styles: { halign: 'left' } },
            { content: prof.telephone || 'N/A', styles: { halign: 'center' } },
            { content: prof.email || 'N/A', styles: { halign: 'left' } }
        ]);

        // Ajouter le tableau avec styling amélioré
        doc.autoTable({
            head: [headers],
            body: data,
            startY: yPosition,
            styles: {
                fontSize: 8,
                cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
                lineColor: [200, 200, 200],
                lineWidth: 0.5,
                textColor: [55, 65, 81],
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [30, 64, 175],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: { top: 6, right: 2, bottom: 6, left: 2 }
            },
            alternateRowStyles: {
                fillColor: [240, 245, 255]
            },
            columnStyles: {
                0: { cellWidth: 10 }, // #
                1: { cellWidth: 30 }, // Nom
                2: { cellWidth: 22 }, // Matricule
                3: { cellWidth: 20 }, // Grade
                4: { cellWidth: 40 }, // Université
                5: { cellWidth: 22 }, // Téléphone
                6: { cellWidth: 36 }  // Email
            },
            margin: { left: 15, right: 15 },
            tableWidth: 180,
            showHead: 'everyPage',
            theme: 'striped'
        });

        // Pied de page amélioré
        const totalPages = doc.internal.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Ligne de séparation du pied de page
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(15, pageHeight - 20, 195, pageHeight - 20);
            
            // Informations du pied de page
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            
            // Côté gauche - Informations
            doc.text('ESU-RSI - Application de gestion du personnel académique', 15, pageHeight - 12);
            doc.text(`Total: ${professeurs.length} professeur(s)`, 15, pageHeight - 8);
            
            // Côté droit - Pagination
            doc.text(`Page ${i} / ${totalPages}`, 195, pageHeight - 10, { align: 'right' });
        }

        // Télécharger le PDF
        doc.save(`Liste_Professeurs_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    async exportProfesseurDetails(professeur) {
        await this.loadLogo();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Ajouter l'en-tête
        let yPosition = this.addHeader(doc);

        // Section titre du document
        doc.setFillColor(30, 64, 175);
        doc.rect(15, yPosition - 5, 180, 25, 'F');
        
        // Titre principal
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('FICHE DÉTAILLÉE DU PROFESSEUR', 105, yPosition + 5, { align: 'center' });
        
        // Nom du professeur
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${professeur.nom || 'Non renseigné'}`, 105, yPosition + 12, { align: 'center' });
        
        // Matricule
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(`Matricule: ${professeur.matricule || 'Non renseigné'}`, 105, yPosition + 18, { align: 'center' });
        
        yPosition += 35;

        const formatDate = (dateString) => {
            if (!dateString) return 'Non disponible';
            try {
                return new Date(dateString).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch {
                return dateString;
            }
        };

        // Sections d'informations essentielles
        const sections = [
            {
                title: 'INFORMATIONS PERSONNELLES',
                color: [30, 64, 175], // Bleu principal
                data: [
                    ['Nom complet', professeur.nom || 'Non renseigné'],
                    ['Sexe', professeur.sexe || 'Non renseigné'],
                    ['Lieu de naissance', professeur.lieu_naissance || 'Non renseigné'],
                    ['Date de naissance', formatDate(professeur.date_naissance)],
                    ['Téléphone', professeur.telephone || 'Non renseigné'],
                    ['Email', professeur.email || 'Non renseigné']
                ]
            },
            {
                title: 'INFORMATIONS ACADÉMIQUES',
                color: [30, 64, 175], // Bleu principal
                data: [
                    ['Grade', professeur.grade || 'Non renseigné'],
                    ['Matricule', professeur.matricule || 'Non renseigné'],
                    ['Université d\'attache', professeur.universite_attache || 'Non renseignée'],
                    ['Type de diplôme', professeur.type_diplome || 'Non renseigné'],
                    ['Date de soutenance', formatDate(professeur.date_soutenance)],
                    ['Pays de soutenance', professeur.pays_soutenance || 'Non renseigné'],
                    ['Université de soutenance', professeur.universite_soutenance || 'Non renseignée']
                ]
            },
            {
                title: 'ÉQUIVALENCES ET ARRÊTÉS',
                color: [30, 64, 175], // Bleu principal
                data: [
                    ['Numéro d\'équivalence', professeur.numero_equivalence || 'Non renseigné'],
                    ['Numéro d\'arrêté', professeur.numero_arrete || 'Non renseigné']
                ]
            },
            {
                title: 'INFORMATIONS FINANCIÈRES',
                color: [30, 64, 175], // Bleu principal
                data: [
                    ['Salaire de base', professeur.salaire_base || 'Non renseigné'],
                    ['Prime institutionnelle', professeur.prime_institutionnelle || 'Non renseignée']
                ]
            }
        ];

        // Ajouter chaque section avec style amélioré
        sections.forEach(section => {
            // Vérifier si on a besoin d'une nouvelle page
            if (yPosition > 220) {
                doc.addPage();
                yPosition = 20;
            }

            // En-tête de section avec couleur
            doc.setFillColor(...section.color);
            doc.rect(15, yPosition - 2, 180, 10, 'F');
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(section.title, 20, yPosition + 4);
            
            yPosition += 12;

            // Tableau pour cette section
            doc.autoTable({
                body: section.data.map(([label, value]) => [
                    { content: label, styles: { fontStyle: 'bold', textColor: [55, 65, 81] } },
                    { content: value, styles: { textColor: [75, 85, 99] } }
                ]),
                startY: yPosition,
                styles: {
                    fontSize: 9,
                    cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
                    lineColor: [229, 231, 235],
                    lineWidth: 0.5
                },
                columnStyles: {
                    0: { 
                        cellWidth: 55,
                        fillColor: [240, 245, 255],
                        halign: 'left'
                    },
                    1: { 
                        cellWidth: 125,
                        halign: 'left'
                    }
                },
                margin: { left: 15, right: 15 },
                theme: 'grid'
            });

            yPosition = doc.lastAutoTable.finalY + 12;
        });

        // Sections terminées - pas de commentaires ni statut

        // Pied de page amélioré
        const totalPages = doc.internal.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Ligne de séparation
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(15, pageHeight - 20, 195, pageHeight - 20);
            
            // Informations du pied de page
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            
            // Côté gauche
            doc.text('ESU-RSI - Fiche détaillée du personnel académique', 15, pageHeight - 12);
            doc.text(`${professeur.nom || 'Professeur'} • ID: ${professeur.id}`, 15, pageHeight - 8);
            
            // Côté droit
            doc.text(`Page ${i} / ${totalPages}`, 195, pageHeight - 10, { align: 'right' });
        }

        // Télécharger le PDF
        const fileName = `Professeur_${professeur.nom?.replace(/[^a-zA-Z0-9]/g, '_') || 'Inconnu'}_${professeur.id}.pdf`;
        doc.save(fileName);
    }
}

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
