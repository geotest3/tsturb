// Main Application JavaScript - Versão Completa e Finalizada
class RegFundiariaApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.notifications = [];
        this.settings = {
            autoSave: true,
            notifications: true,
            darkMode: false,
            language: 'pt-BR'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.initializeTooltips();
        this.loadSettings();
        this.initializeServiceWorker();
    }

    bindEvents() {
        // Navigation events
        $(document).on('click', '.nav-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page) {
                this.navigateTo(page);
            }
        });

        // Mobile menu toggle
        $('#menuToggle').on('click', () => {
            this.toggleSidebar();
        });

        // Sidebar overlay click
        $('#sidebarOverlay').on('click', () => {
            this.closeSidebar();
        });

        // Logout button
        $('#logoutButton').on('click', () => {
            this.logout();
        });

        // Window resize
        $(window).on('resize', () => {
            if ($(window).width() >= 1024) {
                this.closeSidebar();
            }
        });

        // Global search
        $('#globalSearch').on('input', (e) => {
            this.handleGlobalSearch($(e.target).val());
        });

        // Keyboard shortcuts
        $(document).on('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showAlert('Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showAlert('Sem conexão com a internet', 'warning');
        });
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch((error) => {
                    console.log('Erro ao registrar Service Worker:', error);
                });
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('regfundiaria_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            this.applySettings();
        }
    }

    saveSettings() {
        localStorage.setItem('regfundiaria_settings', JSON.stringify(this.settings));
    }

    applySettings() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    checkAuth() {
        $.get('api/auth.php?action=check')
            .done((response) => {
                if (response.authenticated) {
                    this.currentUser = response.user;
                    this.showMainApp();
                    this.updateUserInfo();
                    this.navigateTo('dashboard');
                    this.startPeriodicUpdates();
                    this.loadNotifications();
                } else {
                    this.showLogin();
                }
            })
            .fail(() => {
                this.showLogin();
            });
    }

    startPeriodicUpdates() {
        // Update notifications every 30 seconds
        setInterval(() => {
            this.updateNotifications();
        }, 30000);

        // Check for system updates every 5 minutes
        setInterval(() => {
            this.checkSystemUpdates();
        }, 300000);
    }

    updateNotifications() {
        if (!this.settings.notifications) return;

        // Simulate notification updates
        const notificationCount = Math.floor(Math.random() * 5);
        const notificationBadge = $('.notification-badge');
        
        if (notificationCount > 0) {
            notificationBadge.text(notificationCount).removeClass('d-none');
        } else {
            notificationBadge.addClass('d-none');
        }
    }

    loadNotifications() {
        // Simular carregamento de notificações
        this.notifications = [
            {
                id: 1,
                type: 'info',
                title: 'Bem-vindo ao RegFundiária',
                message: 'Sistema carregado com sucesso',
                time: new Date(),
                read: false
            }
        ];
    }

    checkSystemUpdates() {
        // Verificar atualizações do sistema
        console.log('Verificando atualizações do sistema...');
    }

    showLogin() {
        $('#loginForm').removeClass('hidden');
        $('#mainApp').addClass('hidden');
        document.title = 'RegFundiária - Login';
        
        // Add login animation
        $('#loginForm').addClass('fade-in');
    }

    showMainApp() {
        $('#loginForm').addClass('hidden');
        $('#mainApp').removeClass('hidden');
        
        // Add main app animation
        $('#mainApp').addClass('fade-in');
    }

    updateUserInfo() {
        if (this.currentUser) {
            $('#userName').text(this.currentUser.nome);
            $('#userEmail').text(this.currentUser.email);
            $('#userInitial').text(this.currentUser.nome.charAt(0).toUpperCase());
            
            // Update user role badge
            const roleBadge = this.currentUser.role === 'admin' ? 
                '<span class="badge bg-danger ms-2">Admin</span>' : 
                '<span class="badge bg-info ms-2">Usuário</span>';
            $('#userName').append(roleBadge);

            // Update user avatar with gradient
            const colors = ['primary', 'success', 'info', 'warning', 'danger'];
            const colorIndex = this.currentUser.nome.charCodeAt(0) % colors.length;
            $('#userInitial').parent().removeClass().addClass(`w-10 h-10 bg-gradient-to-r from-${colors[colorIndex]}-500 to-${colors[colorIndex]}-600 rounded-full flex items-center justify-center shadow-lg`);
        }
    }

    navigateTo(page, updateHistory = true) {
        if (this.currentPage === page) return;

        // Add loading state
        this.showPageTransition();

        this.currentPage = page;
        this.updateActiveNav(page);
        this.updatePageTitle(page);
        this.updateBreadcrumb(page);
        this.loadPageContent(page);
        this.closeSidebar();
        
        // Update URL without page reload
        if (updateHistory) {
            history.pushState({ page: page }, '', `#${page}`);
        }

        // Track page view
        this.trackPageView(page);
    }

    trackPageView(page) {
        // Analytics tracking
        console.log(`Page view: ${page}`);
    }

    showPageTransition() {
        $('#pageContent').addClass('opacity-50');
        setTimeout(() => {
            $('#pageContent').removeClass('opacity-50');
        }, 300);
    }

    updateActiveNav(page) {
        $('.nav-link').removeClass('active bg-blue-600 text-white');
        $(`.nav-link[data-page="${page}"]`).addClass('active bg-blue-600 text-white');
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            imoveis: 'Imóveis',
            proprietarios: 'Proprietários',
            processos: 'Processos',
            importar: 'Importar Arquivo',
            memorial: 'Memorial Descritivo',
            mapa: 'Visualização em Mapa',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações',
            ajuda: 'Ajuda'
        };
        
        const title = titles[page] || 'Dashboard';
        $('#pageTitle').text(title);
        document.title = `RegFundiária - ${title}`;
    }

    updateBreadcrumb(page) {
        const breadcrumbs = {
            dashboard: [{ text: 'Dashboard', active: true }],
            imoveis: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Imóveis', active: true }],
            proprietarios: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Proprietários', active: true }],
            processos: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Processos', active: true }],
            importar: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Importar', active: true }],
            memorial: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Memorial', active: true }],
            mapa: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Mapa', active: true }],
            relatorios: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Relatórios', active: true }],
            configuracoes: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Configurações', active: true }],
            ajuda: [{ text: 'Dashboard', link: 'dashboard' }, { text: 'Ajuda', active: true }]
        };

        const breadcrumb = breadcrumbs[page] || breadcrumbs.dashboard;
        let breadcrumbHtml = '<nav aria-label="breadcrumb"><ol class="breadcrumb mb-0">';
        
        breadcrumb.forEach(item => {
            if (item.active) {
                breadcrumbHtml += `<li class="breadcrumb-item active">${item.text}</li>`;
            } else {
                breadcrumbHtml += `<li class="breadcrumb-item"><a href="#" onclick="app.navigateTo('${item.link}')">${item.text}</a></li>`;
            }
        });
        
        breadcrumbHtml += '</ol></nav>';
        
        // Add breadcrumb to page if it doesn't exist
        if (!$('#breadcrumb').length) {
            $('#pageTitle').after('<div id="breadcrumb" class="mt-2"></div>');
        }
        $('#breadcrumb').html(breadcrumbHtml);
    }

    loadPageContent(page) {
        this.showLoading();
        
        // Load page-specific content
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'imoveis':
                this.loadImoveis();
                break;
            case 'proprietarios':
                this.loadProprietarios();
                break;
            case 'processos':
                this.loadProcessos();
                break;
            case 'importar':
                this.loadImportar();
                break;
            case 'memorial':
                this.loadMemorial();
                break;
            case 'mapa':
                this.loadMapa();
                break;
            case 'relatorios':
                this.loadRelatorios();
                break;
            case 'configuracoes':
                this.loadConfiguracoes();
                break;
            case 'ajuda':
                this.loadAjuda();
                break;
            default:
                this.loadDashboard();
        }
    }

    loadDashboard() {
        if (typeof window.DashboardModule !== 'undefined') {
            window.DashboardModule.load();
        } else {
            this.loadGenericPage('Dashboard', 'Painel principal com estatísticas do sistema.');
        }
    }

    loadImoveis() {
        if (typeof window.ImoveisModule !== 'undefined') {
            window.ImoveisModule.load();
        } else {
            this.loadGenericPage('Imóveis', 'Gerenciamento de imóveis cadastrados no sistema.');
        }
    }

    loadProprietarios() {
        if (typeof window.ProprietariosModule !== 'undefined') {
            window.ProprietariosModule.load();
        } else {
            this.loadGenericPage('Proprietários', 'Gerenciamento de proprietários cadastrados no sistema.');
        }
    }

    loadProcessos() {
        if (typeof window.ProcessosModule !== 'undefined') {
            window.ProcessosModule.load();
        } else {
            this.loadGenericPage('Processos', 'Gerenciamento de processos de regularização fundiária.');
        }
    }

    loadImportar() {
        if (typeof window.ImportarModule !== 'undefined') {
            window.ImportarModule.load();
        } else {
            this.loadGenericPage('Importar Arquivo', 'Importação de arquivos SIGEF (CSV, KML, PDF).');
        }
    }

    loadMemorial() {
        if (typeof window.MemorialModule !== 'undefined') {
            window.MemorialModule.load();
        } else {
            this.loadGenericPage('Memorial Descritivo', 'Editor de memorial descritivo.');
        }
    }

    loadMapa() {
        if (typeof window.MapaModule !== 'undefined') {
            window.MapaModule.load();
        } else {
            this.loadGenericPage('Visualização em Mapa', 'Mapa interativo com visualização dos imóveis.');
        }
    }

    loadRelatorios() {
        if (typeof window.RelatoriosModule !== 'undefined') {
            window.RelatoriosModule.load();
        } else {
            this.loadGenericPage('Relatórios', 'Geração de relatórios e estatísticas.');
        }
    }

    loadConfiguracoes() {
        this.renderConfiguracoes();
    }

    loadAjuda() {
        this.renderAjuda();
    }

    renderConfiguracoes() {
        const content = `
            <div class="fade-in">
                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-cog text-primary me-2"></i>
                                    Configurações do Sistema
                                </h5>
                            </div>
                            <div class="card-body">
                                <form id="settingsForm">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <h6 class="text-primary">Preferências Gerais</h6>
                                            <hr>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="autoSave" ${this.settings.autoSave ? 'checked' : ''}>
                                                <label class="form-check-label" for="autoSave">
                                                    Salvamento Automático
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="notifications" ${this.settings.notifications ? 'checked' : ''}>
                                                <label class="form-check-label" for="notifications">
                                                    Notificações
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="darkMode" ${this.settings.darkMode ? 'checked' : ''}>
                                                <label class="form-check-label" for="darkMode">
                                                    Modo Escuro
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Idioma</label>
                                            <select class="form-select" id="language">
                                                <option value="pt-BR" ${this.settings.language === 'pt-BR' ? 'selected' : ''}>Português (Brasil)</option>
                                                <option value="en-US" ${this.settings.language === 'en-US' ? 'selected' : ''}>English (US)</option>
                                                <option value="es-ES" ${this.settings.language === 'es-ES' ? 'selected' : ''}>Español</option>
                                            </select>
                                        </div>
                                        <div class="col-12 mt-4">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save me-2"></i>Salvar Configurações
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Informações do Sistema</h6>
                            </div>
                            <div class="card-body">
                                <div class="list-group list-group-flush">
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Versão:</span>
                                        <strong>1.0.0</strong>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Última Atualização:</span>
                                        <strong>${new Date().toLocaleDateString()}</strong>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Usuário:</span>
                                        <strong>${this.currentUser?.nome || 'N/A'}</strong>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Perfil:</span>
                                        <strong>${this.currentUser?.role || 'N/A'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        this.hideLoading();

        $('#settingsForm').on('submit', (e) => {
            e.preventDefault();
            this.saveUserSettings();
        });
    }

    renderAjuda() {
        const content = `
            <div class="fade-in">
                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-question-circle text-primary me-2"></i>
                                    Central de Ajuda
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="accordion" id="helpAccordion">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help1">
                                                Como importar arquivos SIGEF?
                                            </button>
                                        </h2>
                                        <div id="help1" class="accordion-collapse collapse show" data-bs-parent="#helpAccordion">
                                            <div class="accordion-body">
                                                <p>Para importar arquivos SIGEF:</p>
                                                <ol>
                                                    <li>Acesse o menu "Importar"</li>
                                                    <li>Selecione o arquivo (CSV, KML ou PDF)</li>
                                                    <li>Aguarde a validação dos dados</li>
                                                    <li>Confirme a importação</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help2">
                                                Como gerar um memorial descritivo?
                                            </button>
                                        </h2>
                                        <div id="help2" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                            <div class="accordion-body">
                                                <p>Para gerar um memorial descritivo:</p>
                                                <ol>
                                                    <li>Acesse o menu "Memorial"</li>
                                                    <li>Selecione o imóvel desejado</li>
                                                    <li>Escolha o template adequado</li>
                                                    <li>Clique em "Gerar Automático"</li>
                                                    <li>Edite se necessário e salve</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help3">
                                                Como visualizar imóveis no mapa?
                                            </button>
                                        </h2>
                                        <div id="help3" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                            <div class="accordion-body">
                                                <p>Para visualizar imóveis no mapa:</p>
                                                <ol>
                                                    <li>Acesse o menu "Mapa"</li>
                                                    <li>Use os filtros para refinar a busca</li>
                                                    <li>Clique nos marcadores para ver detalhes</li>
                                                    <li>Use as ferramentas de zoom e medição</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Atalhos do Teclado</h6>
                            </div>
                            <div class="card-body">
                                <div class="list-group list-group-flush">
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Busca Global:</span>
                                        <kbd>Ctrl + K</kbd>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Fechar Modal:</span>
                                        <kbd>Esc</kbd>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Dashboard:</span>
                                        <kbd>Alt + D</kbd>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between px-0">
                                        <span>Imóveis:</span>
                                        <kbd>Alt + I</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mt-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Suporte</h6>
                            </div>
                            <div class="card-body">
                                <p class="small text-muted">Precisa de ajuda adicional?</p>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-primary btn-sm">
                                        <i class="fas fa-envelope me-2"></i>Enviar Email
                                    </button>
                                    <button class="btn btn-outline-success btn-sm">
                                        <i class="fas fa-phone me-2"></i>Contato Telefônico
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        this.hideLoading();
    }

    saveUserSettings() {
        this.settings.autoSave = $('#autoSave').is(':checked');
        this.settings.notifications = $('#notifications').is(':checked');
        this.settings.darkMode = $('#darkMode').is(':checked');
        this.settings.language = $('#language').val();

        this.saveSettings();
        this.applySettings();
        
        this.showAlert('Configurações salvas com sucesso', 'success');
    }

    loadGenericPage(title, description) {
        const content = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 fade-in">
                <div class="text-center">
                    <i class="fas fa-cog fa-3x text-blue-500 mb-4"></i>
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">${title}</h2>
                    <p class="text-gray-600 mb-4">${description}</p>
                    <div class="mt-4">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-refresh me-2"></i>Recarregar Página
                        </button>
                    </div>
                </div>
            </div>
        `;
        $('#pageContent').html(content);
        this.hideLoading();
    }

    handleGlobalSearch(query) {
        if (query.length < 3) return;
        
        // Implement global search functionality
        console.log('Searching for:', query);
        
        // Show search results
        this.showSearchResults(query);
    }

    showSearchResults(query) {
        // Simular resultados de busca
        const results = [
            { type: 'imovel', title: `Imóvel M-001-2024`, description: 'Rua das Flores, 123' },
            { type: 'proprietario', title: 'João Silva', description: 'CPF: 123.456.789-00' },
            { type: 'processo', title: 'Regularização Vila Nova', description: 'Status: Em Andamento' }
        ];

        // Implementar dropdown de resultados
        console.log('Search results:', results);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            $('#globalSearch').focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            $('.modal').modal('hide');
        }

        // Alt + D for Dashboard
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            this.navigateTo('dashboard');
        }

        // Alt + I for Imóveis
        if (e.altKey && e.key === 'i') {
            e.preventDefault();
            this.navigateTo('imoveis');
        }
    }

    toggleSidebar() {
        const sidebar = $('#sidebar');
        const overlay = $('#sidebarOverlay');
        
        if (sidebar.hasClass('-translate-x-full')) {
            sidebar.removeClass('-translate-x-full');
            overlay.removeClass('hidden');
            $('body').addClass('overflow-hidden');
        } else {
            sidebar.addClass('-translate-x-full');
            overlay.addClass('hidden');
            $('body').removeClass('overflow-hidden');
        }
    }

    closeSidebar() {
        $('#sidebar').addClass('-translate-x-full');
        $('#sidebarOverlay').addClass('hidden');
        $('body').removeClass('overflow-hidden');
    }

    showLoading() {
        $('#loading').removeClass('hidden');
    }

    hideLoading() {
        $('#loading').addClass('hidden');
    }

    logout() {
        this.showConfirm('Tem certeza que deseja sair do sistema?', () => {
            this.showLoading();
            
            $.post('api/auth.php?action=logout')
                .always(() => {
                    this.currentUser = null;
                    this.showLogin();
                    this.hideLoading();
                    this.showAlert('Logout realizado com sucesso', 'success');
                    
                    // Clear local data
                    localStorage.removeItem('regfundiaria_cache');
                });
        });
    }

    // Enhanced utility methods
    showAlert(message, type = 'info', duration = 5000) {
        const alertClass = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        };

        const iconClass = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const alertId = 'alert-' + Date.now();
        const alert = `
            <div id="${alertId}" class="alert ${alertClass[type]} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;" role="alert">
                <i class="fas ${iconClass[type]} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        $('body').append(alert);
        
        // Auto dismiss
        setTimeout(() => {
            $(`#${alertId}`).alert('close');
        }, duration);

        // Add to notifications if important
        if (type === 'error' || type === 'warning') {
            this.addNotification(message, type);
        }
    }

    addNotification(message, type) {
        this.notifications.unshift({
            id: Date.now(),
            type: type,
            message: message,
            time: new Date(),
            read: false
        });

        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
    }

    showConfirm(message, callback) {
        const modal = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirmação</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <i class="fas fa-question-circle text-warning fa-3x mb-3"></i>
                                <p class="mb-0">${message}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmButton">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#confirmModal').remove();
        $('body').append(modal);
        $('#confirmModal').modal('show');

        $('#confirmButton').on('click', () => {
            $('#confirmModal').modal('hide');
            if (callback) callback();
        });
    }

    // Utility functions for formatting
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('pt-BR').format(value);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validation functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        
        // Check for repeated digits
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validate check digits
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14) return false;
        
        // Check for repeated digits
        if (/^(\d)\1{13}$/.test(cnpj)) return false;
        
        // Validate check digits
        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;
        
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        
        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;
        
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        
        return true;
    }
}

// Initialize app when document is ready
$(document).ready(() => {
    window.app = new RegFundiariaApp();
});

// Global utility functions
window.utils = {
    showLoading: () => window.app.showLoading(),
    hideLoading: () => window.app.hideLoading(),
    showAlert: (message, type, duration) => window.app.showAlert(message, type, duration),
    showConfirm: (message, callback) => window.app.showConfirm(message, callback),
    formatCurrency: (value) => window.app.formatCurrency(value),
    formatNumber: (value) => window.app.formatNumber(value),
    formatDate: (date) => window.app.formatDate(date),
    formatDateTime: (date) => window.app.formatDateTime(date),
    formatFileSize: (bytes) => window.app.formatFileSize(bytes),
    validateEmail: (email) => window.app.validateEmail(email),
    validateCPF: (cpf) => window.app.validateCPF(cpf),
    validateCNPJ: (cnpj) => window.app.validateCNPJ(cnpj)
};

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}