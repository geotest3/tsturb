// Memorial Module - Funcionalidade Completa
window.MemorialModule = {
    currentImovelId: null,
    isEditing: false,
    originalContent: '',
    autoSaveInterval: null,

    load() {
        this.renderMemorialEditor();
        this.startAutoSave();
    },

    renderMemorialEditor() {
        const content = `
            <div class="fade-in">
                <div class="row g-4">
                    <!-- Editor Principal -->
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-file-alt text-primary me-2"></i>
                                        Editor de Memorial Descritivo
                                    </h5>
                                    <div class="btn-group">
                                        <button type="button" id="editBtn" class="btn btn-outline-secondary" onclick="MemorialModule.toggleEdit()">
                                            <i class="fas fa-edit me-2"></i>Editar
                                        </button>
                                        <button type="button" class="btn btn-outline-primary" onclick="MemorialModule.showPreview()">
                                            <i class="fas fa-eye me-2"></i>Visualizar
                                        </button>
                                        <button type="button" class="btn btn-outline-success" onclick="MemorialModule.generateMemorial()">
                                            <i class="fas fa-magic me-2"></i>Gerar Automático
                                        </button>
                                        <button type="button" class="btn btn-outline-info" onclick="MemorialModule.showTemplates()">
                                            <i class="fas fa-file-copy me-2"></i>Templates
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-8">
                                        <label class="form-label">Selecionar Imóvel</label>
                                        <select id="imovelSelect" class="form-select">
                                            <option value="">Selecione um imóvel...</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Template</label>
                                        <select id="templateSelect" class="form-select">
                                            <option value="padrao">Padrão INCRA</option>
                                            <option value="urbano">Urbano</option>
                                            <option value="rural">Rural</option>
                                            <option value="loteamento">Loteamento</option>
                                        </select>
                                    </div>
                                </div>

                                <div id="memorialContent">
                                    <div id="viewMode">
                                        <div class="bg-light p-4 rounded border">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <h6 class="mb-0">Memorial Descritivo</h6>
                                                <div class="btn-group btn-group-sm">
                                                    <button class="btn btn-outline-secondary" onclick="MemorialModule.copyToClipboard()">
                                                        <i class="fas fa-copy me-1"></i>Copiar
                                                    </button>
                                                    <button class="btn btn-outline-primary" onclick="MemorialModule.printMemorial()">
                                                        <i class="fas fa-print me-1"></i>Imprimir
                                                    </button>
                                                </div>
                                            </div>
                                            <pre id="memorialText" class="mb-0" style="white-space: pre-wrap; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6;">
Selecione um imóvel para visualizar ou gerar o memorial descritivo.

Para começar:
1. Selecione um imóvel no campo acima
2. Escolha um template adequado
3. Clique em "Gerar Automático" ou "Editar" para criar manualmente
                                            </pre>
                                        </div>
                                    </div>

                                    <div id="editMode" class="d-none">
                                        <div class="position-relative">
                                            <textarea id="memorialEditor" class="form-control" rows="25" 
                                                      style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6;"
                                                      placeholder="Digite o memorial descritivo aqui..."></textarea>
                                            <div class="position-absolute top-0 end-0 m-2">
                                                <span id="autoSaveStatus" class="badge bg-success d-none">
                                                    <i class="fas fa-check me-1"></i>Salvo automaticamente
                                                </span>
                                            </div>
                                        </div>
                                        <div class="mt-3 d-flex justify-content-between align-items-center">
                                            <div class="btn-group">
                                                <button type="button" class="btn btn-success" onclick="MemorialModule.saveMemorial()">
                                                    <i class="fas fa-save me-2"></i>Salvar Alterações
                                                </button>
                                                <button type="button" class="btn btn-secondary" onclick="MemorialModule.cancelEdit()">
                                                    Cancelar
                                                </button>
                                            </div>
                                            <div class="text-muted small">
                                                <i class="fas fa-info-circle me-1"></i>
                                                Salvamento automático ativado
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Painel Lateral -->
                    <div class="col-lg-4">
                        <!-- Informações do Imóvel -->
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Informações do Imóvel</h6>
                            </div>
                            <div class="card-body" id="imovelInfo">
                                <div class="text-center text-muted py-4">
                                    <i class="fas fa-building fa-2x mb-2"></i>
                                    <p class="mb-0">Selecione um imóvel para ver as informações</p>
                                </div>
                            </div>
                        </div>

                        <!-- Ferramentas -->
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Ferramentas</h6>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-primary" onclick="MemorialModule.insertCoordinates()">
                                        <i class="fas fa-map-marker-alt me-2"></i>Inserir Coordenadas
                                    </button>
                                    <button class="btn btn-outline-success" onclick="MemorialModule.calculateArea()">
                                        <i class="fas fa-calculator me-2"></i>Calcular Área
                                    </button>
                                    <button class="btn btn-outline-info" onclick="MemorialModule.insertConfrontations()">
                                        <i class="fas fa-compass me-2"></i>Inserir Confrontações
                                    </button>
                                    <button class="btn btn-outline-warning" onclick="MemorialModule.spellCheck()">
                                        <i class="fas fa-spell-check me-2"></i>Verificar Ortografia
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Histórico -->
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Histórico de Versões</h6>
                            </div>
                            <div class="card-body">
                                <div id="versionHistory" class="list-group list-group-flush">
                                    <div class="text-center text-muted py-3">
                                        <i class="fas fa-history fa-2x mb-2"></i>
                                        <p class="mb-0 small">Nenhuma versão salva</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Exportação -->
                <div class="card mt-4">
                    <div class="card-header bg-white">
                        <h5 class="card-title mb-0">Exportar Memorial</h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <div class="card h-100 border-2 border-danger">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                        <h6 class="card-title">PDF</h6>
                                        <p class="card-text small text-muted">Formato padrão para impressão e arquivo</p>
                                        <button type="button" class="btn btn-outline-danger" onclick="MemorialModule.exportPDF()">
                                            <i class="fas fa-download me-2"></i>Exportar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card h-100 border-2 border-primary">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-word fa-3x text-primary mb-3"></i>
                                        <h6 class="card-title">DOCX</h6>
                                        <p class="card-text small text-muted">Editável no Microsoft Word</p>
                                        <button type="button" class="btn btn-outline-primary" onclick="MemorialModule.exportDOCX()">
                                            <i class="fas fa-download me-2"></i>Exportar DOCX
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card h-100 border-2 border-secondary">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-alt fa-3x text-secondary mb-3"></i>
                                        <h6 class="card-title">TXT</h6>
                                        <p class="card-text small text-muted">Texto simples para edição</p>
                                        <button type="button" class="btn btn-outline-secondary" onclick="MemorialModule.exportTXT()">
                                            <i class="fas fa-download me-2"></i>Exportar TXT
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card h-100 border-2 border-success">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-code fa-3x text-success mb-3"></i>
                                        <h6 class="card-title">HTML</h6>
                                        <p class="card-text small text-muted">Para publicação web</p>
                                        <button type="button" class="btn btn-outline-success" onclick="MemorialModule.exportHTML()">
                                            <i class="fas fa-download me-2"></i>Exportar HTML
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        this.loadImoveis();
        this.bindEvents();
    },

    bindEvents() {
        $('#imovelSelect').on('change', (e) => {
            const imovelId = $(e.target).val();
            if (imovelId) {
                this.currentImovelId = imovelId;
                this.loadMemorial(imovelId);
                this.loadImovelInfo(imovelId);
            } else {
                this.clearMemorial();
                this.clearImovelInfo();
            }
        });

        $('#templateSelect').on('change', () => {
            if (this.currentImovelId) {
                this.generateMemorial();
            }
        });

        $('#memorialEditor').on('input', () => {
            this.showAutoSaveStatus();
        });
    },

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.isEditing && this.currentImovelId) {
                this.autoSaveMemorial();
            }
        }, 30000); // Auto save every 30 seconds
    },

    loadImoveis() {
        $.get('api/imoveis.php', { limit: 100 })
            .done((response) => {
                if (response.success) {
                    let options = '<option value="">Selecione um imóvel...</option>';
                    response.data.forEach(imovel => {
                        options += `<option value="${imovel.id}">${imovel.matricula} - ${imovel.endereco}</option>`;
                    });
                    $('#imovelSelect').html(options);
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao carregar imóveis', 'error');
            });
    },

    loadImovelInfo(imovelId) {
        $.get(`api/imoveis.php?id=${imovelId}`)
            .done((response) => {
                if (response.success) {
                    this.displayImovelInfo(response.data);
                }
            });
    },

    displayImovelInfo(imovel) {
        const info = `
            <div class="text-center mb-3">
                <div class="bg-primary rounded-circle text-white d-inline-flex align-items-center justify-content-center" 
                     style="width: 60px; height: 60px; font-size: 20px;">
                    <i class="fas fa-building"></i>
                </div>
            </div>
            <h6 class="text-center mb-3">${imovel.matricula}</h6>
            <div class="row g-2 text-sm">
                <div class="col-6"><strong>Área:</strong></div>
                <div class="col-6">${window.utils.formatNumber(imovel.area)} m²</div>
                <div class="col-6"><strong>Perímetro:</strong></div>
                <div class="col-6">${imovel.perimetro ? window.utils.formatNumber(imovel.perimetro) + ' m' : 'N/A'}</div>
                <div class="col-6"><strong>Cidade:</strong></div>
                <div class="col-6">${imovel.cidade}</div>
                <div class="col-6"><strong>Estado:</strong></div>
                <div class="col-6">${imovel.estado}</div>
                <div class="col-6"><strong>Proprietário:</strong></div>
                <div class="col-6">${imovel.proprietario_nome || 'N/A'}</div>
                <div class="col-6"><strong>Coordenadas:</strong></div>
                <div class="col-6">
                    ${imovel.coordenadas ? `${imovel.coordenadas.length} pontos` : 'N/A'}
                </div>
            </div>
        `;
        $('#imovelInfo').html(info);
    },

    clearImovelInfo() {
        $('#imovelInfo').html(`
            <div class="text-center text-muted py-4">
                <i class="fas fa-building fa-2x mb-2"></i>
                <p class="mb-0">Selecione um imóvel para ver as informações</p>
            </div>
        `);
    },

    loadMemorial(imovelId) {
        window.utils.showLoading();
        
        $.get(`api/memorial.php?imovel_id=${imovelId}`)
            .done((response) => {
                if (response.success) {
                    this.displayMemorial(response.data.conteudo);
                    this.loadVersionHistory(imovelId);
                } else {
                    this.generateMemorial();
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao carregar memorial', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    generateMemorial() {
        if (!this.currentImovelId) {
            window.utils.showAlert('Selecione um imóvel primeiro', 'warning');
            return;
        }

        const template = $('#templateSelect').val();
        window.utils.showLoading();
        
        $.get(`api/memorial.php?action=gerar&imovel_id=${this.currentImovelId}&template=${template}`)
            .done((response) => {
                if (response.success) {
                    this.displayMemorial(response.conteudo);
                    window.utils.showAlert('Memorial gerado automaticamente', 'success');
                } else {
                    window.utils.showAlert('Erro ao gerar memorial', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    displayMemorial(content) {
        $('#memorialText').text(content);
        $('#memorialEditor').val(content);
        this.originalContent = content;
    },

    clearMemorial() {
        const defaultText = `Selecione um imóvel para visualizar ou gerar o memorial descritivo.

Para começar:
1. Selecione um imóvel no campo acima
2. Escolha um template adequado
3. Clique em "Gerar Automático" ou "Editar" para criar manualmente`;
        
        $('#memorialText').text(defaultText);
        $('#memorialEditor').val('');
        this.originalContent = '';
        this.currentImovelId = null;
    },

    toggleEdit() {
        if (!this.currentImovelId) {
            window.utils.showAlert('Selecione um imóvel primeiro', 'warning');
            return;
        }

        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            $('#viewMode').addClass('d-none');
            $('#editMode').removeClass('d-none');
            $('#editBtn').html('<i class="fas fa-eye me-2"></i>Visualizar');
            $('#memorialEditor').focus();
        } else {
            $('#editMode').addClass('d-none');
            $('#viewMode').removeClass('d-none');
            $('#editBtn').html('<i class="fas fa-edit me-2"></i>Editar');
            $('#memorialText').text($('#memorialEditor').val());
        }
    },

    saveMemorial() {
        if (!this.currentImovelId) {
            window.utils.showAlert('Selecione um imóvel primeiro', 'warning');
            return;
        }

        const content = $('#memorialEditor').val();
        if (!content.trim()) {
            window.utils.showAlert('O conteúdo do memorial não pode estar vazio', 'warning');
            return;
        }

        window.utils.showLoading();

        const data = {
            imovel_id: this.currentImovelId,
            conteudo: content
        };

        $.post('api/memorial.php', JSON.stringify(data), null, 'json')
            .done((response) => {
                if (response.success) {
                    this.originalContent = content;
                    $('#memorialText').text(content);
                    this.toggleEdit();
                    this.loadVersionHistory(this.currentImovelId);
                    window.utils.showAlert('Memorial salvo com sucesso', 'success');
                } else {
                    window.utils.showAlert('Erro ao salvar memorial', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    autoSaveMemorial() {
        if (!this.currentImovelId || !this.isEditing) return;

        const content = $('#memorialEditor').val();
        if (content === this.originalContent) return;

        const data = {
            imovel_id: this.currentImovelId,
            conteudo: content
        };

        $.post('api/memorial.php', JSON.stringify(data), null, 'json')
            .done((response) => {
                if (response.success) {
                    this.originalContent = content;
                    this.showAutoSaveStatus();
                }
            });
    },

    showAutoSaveStatus() {
        $('#autoSaveStatus').removeClass('d-none').fadeIn();
        setTimeout(() => {
            $('#autoSaveStatus').fadeOut();
        }, 2000);
    },

    cancelEdit() {
        $('#memorialEditor').val(this.originalContent);
        this.toggleEdit();
    },

    showPreview() {
        const content = this.isEditing ? $('#memorialEditor').val() : $('#memorialText').text();
        
        if (!content.trim()) {
            window.utils.showAlert('Nenhum conteúdo para visualizar', 'warning');
            return;
        }

        const modal = `
            <div class="modal fade" id="previewModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye text-primary me-2"></i>
                                Visualização do Memorial
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="bg-white p-5 border" style="font-family: 'Times New Roman', serif; line-height: 1.8; font-size: 14px;">
                                <div class="text-center mb-4">
                                    <h4 class="text-uppercase">MEMORIAL DESCRITIVO</h4>
                                    <hr style="width: 200px; margin: 20px auto;">
                                </div>
                                <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${content}</pre>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary" onclick="MemorialModule.printPreview()">
                                <i class="fas fa-print me-2"></i>Imprimir
                            </button>
                            <button type="button" class="btn btn-success" onclick="MemorialModule.exportPDF()">
                                <i class="fas fa-file-pdf me-2"></i>Exportar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#previewModal').remove();
        $('body').append(modal);
        $('#previewModal').modal('show');
    },

    showTemplates() {
        const modal = `
            <div class="modal fade" id="templatesModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-copy text-primary me-2"></i>
                                Templates de Memorial
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-file-alt text-primary me-2"></i>
                                                Padrão INCRA
                                            </h6>
                                            <p class="card-text small">Template padrão seguindo as normas do INCRA para regularização fundiária.</p>
                                            <button class="btn btn-outline-primary btn-sm" onclick="MemorialModule.useTemplate('padrao')">
                                                Usar Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-city text-success me-2"></i>
                                                Urbano
                                            </h6>
                                            <p class="card-text small">Template específico para imóveis urbanos com confrontações detalhadas.</p>
                                            <button class="btn btn-outline-success btn-sm" onclick="MemorialModule.useTemplate('urbano')">
                                                Usar Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-tree text-warning me-2"></i>
                                                Rural
                                            </h6>
                                            <p class="card-text small">Template para propriedades rurais com características específicas do campo.</p>
                                            <button class="btn btn-outline-warning btn-sm" onclick="MemorialModule.useTemplate('rural')">
                                                Usar Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-map text-info me-2"></i>
                                                Loteamento
                                            </h6>
                                            <p class="card-text small">Template para loteamentos e subdivisões de terrenos.</p>
                                            <button class="btn btn-outline-info btn-sm" onclick="MemorialModule.useTemplate('loteamento')">
                                                Usar Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#templatesModal').remove();
        $('body').append(modal);
        $('#templatesModal').modal('show');
    },

    useTemplate(template) {
        $('#templateSelect').val(template);
        $('#templatesModal').modal('hide');
        if (this.currentImovelId) {
            this.generateMemorial();
        }
    },

    loadVersionHistory(imovelId) {
        // Simular histórico de versões
        const versions = [
            { id: 1, date: new Date(), user: 'Admin', action: 'Criação' },
            { id: 2, date: new Date(Date.now() - 86400000), user: 'Admin', action: 'Edição' }
        ];

        let html = '';
        versions.forEach(version => {
            html += `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${version.action}</h6>
                            <p class="mb-1 small text-muted">Por ${version.user}</p>
                            <small class="text-muted">${window.utils.formatDateTime(version.date)}</small>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" onclick="MemorialModule.restoreVersion(${version.id})">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        $('#versionHistory').html(html);
    },

    // Ferramentas
    insertCoordinates() {
        if (!this.isEditing) {
            window.utils.showAlert('Entre no modo de edição primeiro', 'warning');
            return;
        }
        
        const coordinates = "Coordenadas: [inserir coordenadas aqui]";
        this.insertTextAtCursor(coordinates);
    },

    calculateArea() {
        window.utils.showAlert('Calculadora de área será implementada', 'info');
    },

    insertConfrontations() {
        if (!this.isEditing) {
            window.utils.showAlert('Entre no modo de edição primeiro', 'warning');
            return;
        }
        
        const confrontations = `
CONFRONTAÇÕES:
Norte: [definir confrontação norte]
Sul: [definir confrontação sul]
Leste: [definir confrontação leste]
Oeste: [definir confrontação oeste]
        `;
        this.insertTextAtCursor(confrontations);
    },

    spellCheck() {
        window.utils.showAlert('Verificação ortográfica será implementada', 'info');
    },

    insertTextAtCursor(text) {
        const textarea = document.getElementById('memorialEditor');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = textarea.value;
        
        textarea.value = currentText.substring(0, start) + text + currentText.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
    },

    // Exportação
    copyToClipboard() {
        const content = $('#memorialText').text();
        navigator.clipboard.writeText(content).then(() => {
            window.utils.showAlert('Memorial copiado para a área de transferência', 'success');
        });
    },

    printMemorial() {
        const content = $('#memorialText').text();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Memorial Descritivo</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 2cm; }
                        h1 { text-align: center; text-transform: uppercase; }
                        pre { white-space: pre-wrap; font-family: inherit; }
                    </style>
                </head>
                <body>
                    <h1>Memorial Descritivo</h1>
                    <pre>${content}</pre>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    printPreview() {
        this.printMemorial();
    },

    exportPDF() {
        window.utils.showAlert('Gerando PDF...', 'info');
        // Implementar geração de PDF
    },

    exportDOCX() {
        window.utils.showAlert('Gerando DOCX...', 'info');
        // Implementar geração de DOCX
    },

    exportTXT() {
        const content = $('#memorialText').text();
        if (!content.trim()) {
            window.utils.showAlert('Nenhum conteúdo para exportar', 'warning');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memorial_${this.currentImovelId || 'descritivo'}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        window.utils.showAlert('Arquivo TXT baixado com sucesso', 'success');
    },

    exportHTML() {
        const content = $('#memorialText').text();
        if (!content.trim()) {
            window.utils.showAlert('Nenhum conteúdo para exportar', 'warning');
            return;
        }

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memorial Descritivo</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 2cm; }
        h1 { text-align: center; text-transform: uppercase; margin-bottom: 2cm; }
        pre { white-space: pre-wrap; font-family: inherit; }
    </style>
</head>
<body>
    <h1>Memorial Descritivo</h1>
    <pre>${content}</pre>
</body>
</html>
        `;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memorial_${this.currentImovelId || 'descritivo'}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        window.utils.showAlert('Arquivo HTML baixado com sucesso', 'success');
    },

    restoreVersion(versionId) {
        window.utils.showAlert(`Restaurando versão ${versionId}...`, 'info');
    }
};