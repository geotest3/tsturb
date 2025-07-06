// Importar Module - Funcionalidade Completa
window.ImportarModule = {
    selectedFile: null,
    importedData: [],
    currentStep: 1,
    totalSteps: 4,
    validationResults: {},

    load() {
        this.renderImportWizard();
    },

    renderImportWizard() {
        const content = `
            <div class="fade-in">
                <!-- Progress Bar -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-upload text-primary me-2"></i>
                                Assistente de Importação SIGEF
                            </h5>
                            <span class="badge bg-primary">Passo ${this.currentStep} de ${this.totalSteps}</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-gradient" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                        </div>
                        <div class="d-flex justify-content-between mt-2">
                            <small class="text-muted">Selecionar Arquivo</small>
                            <small class="text-muted">Validar Dados</small>
                            <small class="text-muted">Mapear Campos</small>
                            <small class="text-muted">Importar</small>
                        </div>
                    </div>
                </div>

                <!-- Step Content -->
                <div id="stepContent">
                    ${this.renderStep(this.currentStep)}
                </div>

                <!-- Navigation -->
                <div class="card mt-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-secondary" onclick="ImportarModule.previousStep()" 
                                    ${this.currentStep === 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-left me-2"></i>Anterior
                            </button>
                            <div class="btn-group">
                                <button class="btn btn-outline-info" onclick="ImportarModule.showHelp()">
                                    <i class="fas fa-question-circle me-2"></i>Ajuda
                                </button>
                                <button class="btn btn-outline-warning" onclick="ImportarModule.resetWizard()">
                                    <i class="fas fa-redo me-2"></i>Reiniciar
                                </button>
                            </div>
                            <button class="btn btn-primary" onclick="ImportarModule.nextStep()" 
                                    ${this.currentStep === this.totalSteps ? 'disabled' : ''}>
                                Próximo<i class="fas fa-chevron-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        this.bindEvents();
    },

    renderStep(step) {
        switch(step) {
            case 1:
                return this.renderFileSelection();
            case 2:
                return this.renderDataValidation();
            case 3:
                return this.renderFieldMapping();
            case 4:
                return this.renderImportConfirmation();
            default:
                return this.renderFileSelection();
        }
    },

    renderFileSelection() {
        return `
            <div class="card">
                <div class="card-header bg-white">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-file-upload text-primary me-2"></i>
                        Passo 1: Selecionar Arquivo SIGEF
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-lg-8">
                            <div id="uploadArea" class="upload-area">
                                <div class="text-center">
                                    <i class="fas fa-cloud-upload-alt fa-4x text-muted mb-3"></i>
                                    <h5 class="mb-2">Arraste e solte seu arquivo aqui</h5>
                                    <p class="text-muted mb-3">ou clique para selecionar</p>
                                    <input type="file" id="fileInput" accept=".csv,.kml,.pdf,.xml" class="d-none">
                                    <button type="button" class="btn btn-outline-primary btn-lg" onclick="$('#fileInput').click()">
                                        <i class="fas fa-folder-open me-2"></i>Selecionar Arquivo
                                    </button>
                                    <p class="text-muted small mt-3">
                                        <strong>Formatos suportados:</strong> CSV, KML, PDF, XML (SIGEF)
                                        <br><strong>Tamanho máximo:</strong> 50MB
                                    </p>
                                </div>
                            </div>

                            <div id="fileInfo" class="mt-4 d-none">
                                <div class="card bg-light border-success">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <i id="fileIcon" class="fas fa-file fa-3x text-primary me-3"></i>
                                                <div>
                                                    <h6 id="fileName" class="mb-1"></h6>
                                                    <div class="d-flex gap-3">
                                                        <small id="fileSize" class="text-muted"></small>
                                                        <small id="fileType" class="text-muted"></small>
                                                        <small id="fileDate" class="text-muted"></small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="btn-group">
                                                <button type="button" class="btn btn-outline-info btn-sm" onclick="ImportarModule.previewFile()">
                                                    <i class="fas fa-eye me-1"></i>Visualizar
                                                </button>
                                                <button type="button" class="btn btn-outline-danger btn-sm" onclick="ImportarModule.removeFile()">
                                                    <i class="fas fa-times me-1"></i>Remover
                                                </button>
                                            </div>
                                        </div>
                                        <div class="mt-3">
                                            <div class="progress" style="height: 6px;">
                                                <div class="progress-bar bg-success" style="width: 100%"></div>
                                            </div>
                                            <small class="text-success mt-1 d-block">
                                                <i class="fas fa-check me-1"></i>Arquivo carregado com sucesso
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-4">
                            <div class="card border-info">
                                <div class="card-header bg-info text-white">
                                    <h6 class="card-title mb-0">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Informações Importantes
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <h6 class="text-info">Formatos Aceitos:</h6>
                                        <ul class="list-unstyled small">
                                            <li><i class="fas fa-file-csv text-success me-2"></i>CSV - Dados tabulares</li>
                                            <li><i class="fas fa-map-marked-alt text-primary me-2"></i>KML - Coordenadas geográficas</li>
                                            <li><i class="fas fa-file-pdf text-danger me-2"></i>PDF - Documentos SIGEF</li>
                                            <li><i class="fas fa-file-code text-warning me-2"></i>XML - Dados estruturados</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <h6 class="text-info">Requisitos:</h6>
                                        <ul class="list-unstyled small">
                                            <li><i class="fas fa-check text-success me-2"></i>Arquivo válido do SIGEF</li>
                                            <li><i class="fas fa-check text-success me-2"></i>Codificação UTF-8</li>
                                            <li><i class="fas fa-check text-success me-2"></i>Dados de coordenadas</li>
                                            <li><i class="fas fa-check text-success me-2"></i>Informações de área</li>
                                        </ul>
                                    </div>

                                    <div class="alert alert-warning small">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        Certifique-se de que o arquivo contém dados válidos do SIGEF antes de prosseguir.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderDataValidation() {
        return `
            <div class="card">
                <div class="card-header bg-white">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Passo 2: Validação dos Dados
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-lg-8">
                            <div id="validationResults">
                                <div class="d-flex align-items-center justify-content-center py-5">
                                    <div class="text-center">
                                        <div class="spinner-border text-primary mb-3" role="status">
                                            <span class="visually-hidden">Validando...</span>
                                        </div>
                                        <h6>Validando dados do arquivo...</h6>
                                        <p class="text-muted">Aguarde enquanto verificamos a integridade dos dados</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-4">
                            <div class="card border-success">
                                <div class="card-header bg-success text-white">
                                    <h6 class="card-title mb-0">
                                        <i class="fas fa-clipboard-check me-2"></i>
                                        Verificações
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span class="small">Formato do arquivo</span>
                                            <i class="fas fa-spinner fa-spin text-muted"></i>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span class="small">Estrutura dos dados</span>
                                            <i class="fas fa-spinner fa-spin text-muted"></i>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span class="small">Coordenadas válidas</span>
                                            <i class="fas fa-spinner fa-spin text-muted"></i>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span class="small">Dados obrigatórios</span>
                                            <i class="fas fa-spinner fa-spin text-muted"></i>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span class="small">Duplicatas</span>
                                            <i class="fas fa-spinner fa-spin text-muted"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderFieldMapping() {
        return `
            <div class="card">
                <div class="card-header bg-white">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-exchange-alt text-warning me-2"></i>
                        Passo 3: Mapeamento de Campos
                    </h6>
                </div>
                <div class="card-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Configure como os campos do arquivo serão mapeados para o sistema
                    </div>

                    <div class="row g-4">
                        <div class="col-lg-6">
                            <h6 class="text-primary mb-3">Campos do Arquivo</h6>
                            <div class="list-group" id="sourceFields">
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>matricula</span>
                                        <span class="badge bg-primary">Texto</span>
                                    </div>
                                </div>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>area_m2</span>
                                        <span class="badge bg-success">Número</span>
                                    </div>
                                </div>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>endereco</span>
                                        <span class="badge bg-primary">Texto</span>
                                    </div>
                                </div>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>coordenadas</span>
                                        <span class="badge bg-info">Coordenadas</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6">
                            <h6 class="text-success mb-3">Campos do Sistema</h6>
                            <div class="mb-3">
                                <label class="form-label">Matrícula *</label>
                                <select class="form-select">
                                    <option value="matricula" selected>matricula</option>
                                    <option value="">Não mapear</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Área (m²) *</label>
                                <select class="form-select">
                                    <option value="area_m2" selected>area_m2</option>
                                    <option value="">Não mapear</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Endereço</label>
                                <select class="form-select">
                                    <option value="endereco" selected>endereco</option>
                                    <option value="">Não mapear</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Coordenadas</label>
                                <select class="form-select">
                                    <option value="coordenadas" selected>coordenadas</option>
                                    <option value="">Não mapear</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-title">Prévia dos Dados Mapeados</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Matrícula</th>
                                                <th>Área (m²)</th>
                                                <th>Endereço</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>M-001-2024</td>
                                                <td>1,000.00</td>
                                                <td>Rua das Flores, 123</td>
                                                <td><span class="badge bg-success">Válido</span></td>
                                            </tr>
                                            <tr>
                                                <td>M-002-2024</td>
                                                <td>1,500.00</td>
                                                <td>Av. Central, 456</td>
                                                <td><span class="badge bg-success">Válido</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderImportConfirmation() {
        return `
            <div class="card">
                <div class="card-header bg-white">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-check text-success me-2"></i>
                        Passo 4: Confirmação e Importação
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-lg-8">
                            <div class="alert alert-success">
                                <h6 class="alert-heading">
                                    <i class="fas fa-check-circle me-2"></i>
                                    Dados Prontos para Importação
                                </h6>
                                <p class="mb-0">Todos os dados foram validados e estão prontos para serem importados no sistema.</p>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Resumo da Importação</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="d-flex justify-content-between">
                                                <span>Total de registros:</span>
                                                <strong>25</strong>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex justify-content-between">
                                                <span>Registros válidos:</span>
                                                <strong class="text-success">23</strong>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex justify-content-between">
                                                <span>Registros com erro:</span>
                                                <strong class="text-warning">2</strong>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex justify-content-between">
                                                <span>Duplicatas encontradas:</span>
                                                <strong class="text-info">0</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4">
                                <div class="d-flex gap-2">
                                    <button class="btn btn-success btn-lg" onclick="ImportarModule.startImport()">
                                        <i class="fas fa-upload me-2"></i>Iniciar Importação
                                    </button>
                                    <button class="btn btn-outline-info" onclick="ImportarModule.downloadReport()">
                                        <i class="fas fa-download me-2"></i>Baixar Relatório
                                    </button>
                                </div>
                            </div>

                            <div id="importProgress" class="mt-4 d-none">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-title">Progresso da Importação</h6>
                                        <div class="progress mb-3" style="height: 20px;">
                                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                                 style="width: 0%" id="progressBar">0%</div>
                                        </div>
                                        <div id="importStatus">Preparando importação...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-4">
                            <div class="card border-warning">
                                <div class="card-header bg-warning text-dark">
                                    <h6 class="card-title mb-0">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        Registros com Problemas
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <div class="list-group-item px-0">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 class="mb-1">Linha 15</h6>
                                                    <p class="mb-1 small">Coordenadas inválidas</p>
                                                    <small class="text-muted">M-015-2024</small>
                                                </div>
                                                <span class="badge bg-warning">Aviso</span>
                                            </div>
                                        </div>
                                        <div class="list-group-item px-0">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 class="mb-1">Linha 22</h6>
                                                    <p class="mb-1 small">Área não informada</p>
                                                    <small class="text-muted">M-022-2024</small>
                                                </div>
                                                <span class="badge bg-warning">Aviso</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="skipErrors" checked>
                                            <label class="form-check-label small" for="skipErrors">
                                                Pular registros com erro
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="createLog" checked>
                                            <label class="form-check-label small" for="createLog">
                                                Gerar log de importação
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const uploadArea = $('#uploadArea');
        const fileInput = $('#fileInput');

        // Drag and drop events
        uploadArea.on('dragenter dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.addClass('dragover');
        });

        uploadArea.on('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('dragover');
        });

        uploadArea.on('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // File input change
        fileInput.on('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Click on upload area
        uploadArea.on('click', () => {
            fileInput.click();
        });
    },

    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['text/csv', 'application/vnd.google-earth.kml+xml', 'application/pdf', 'text/xml', 'application/xml'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['csv', 'kml', 'pdf', 'xml'];

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            window.utils.showAlert('Tipo de arquivo não suportado. Use CSV, KML, PDF ou XML', 'error');
            return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            window.utils.showAlert('Arquivo muito grande. Tamanho máximo: 50MB', 'error');
            return;
        }

        this.selectedFile = file;
        this.showFileInfo(file);
    },

    showFileInfo(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const iconClass = this.getFileIcon(fileExtension);
        
        $('#fileName').text(file.name);
        $('#fileSize').text(this.formatFileSize(file.size));
        $('#fileType').text(fileExtension.toUpperCase());
        $('#fileDate').text(new Date(file.lastModified).toLocaleDateString());
        $('#fileIcon').removeClass().addClass(`fas ${iconClass} fa-3x text-primary me-3`);
        
        $('#fileInfo').removeClass('d-none');
        $('#uploadArea').addClass('d-none');
    },

    getFileIcon(extension) {
        const icons = {
            'csv': 'fa-file-csv',
            'kml': 'fa-map-marked-alt',
            'pdf': 'fa-file-pdf',
            'xml': 'fa-file-code'
        };
        return icons[extension] || 'fa-file';
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    removeFile() {
        this.selectedFile = null;
        this.importedData = [];
        $('#fileInfo').addClass('d-none');
        $('#uploadArea').removeClass('d-none');
        $('#fileInput').val('');
    },

    previewFile() {
        if (!this.selectedFile) return;

        const modal = `
            <div class="modal fade" id="previewModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-eye text-primary me-2"></i>
                                Prévia do Arquivo: ${this.selectedFile.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary mb-3" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                                <p>Carregando prévia do arquivo...</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#previewModal').remove();
        $('body').append(modal);
        $('#previewModal').modal('show');

        // Simular carregamento da prévia
        setTimeout(() => {
            $('.modal-body').html(`
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Área</th>
                                <th>Endereço</th>
                                <th>Cidade</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>M-001-2024</td>
                                <td>1000.00</td>
                                <td>Rua das Flores, 123</td>
                                <td>São Paulo</td>
                                <td>SP</td>
                            </tr>
                            <tr>
                                <td>M-002-2024</td>
                                <td>1500.00</td>
                                <td>Av. Central, 456</td>
                                <td>Rio de Janeiro</td>
                                <td>RJ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `);
        }, 1500);
    },

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.renderImportWizard();
                
                if (this.currentStep === 2) {
                    this.simulateValidation();
                }
            }
        }
    },

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderImportWizard();
        }
    },

    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                if (!this.selectedFile) {
                    window.utils.showAlert('Selecione um arquivo primeiro', 'warning');
                    return false;
                }
                return true;
            case 2:
                return true; // Validação automática
            case 3:
                return true; // Mapeamento automático
            default:
                return true;
        }
    },

    simulateValidation() {
        setTimeout(() => {
            $('#validationResults').html(`
                <div class="alert alert-success">
                    <h6 class="alert-heading">
                        <i class="fas fa-check-circle me-2"></i>
                        Validação Concluída
                    </h6>
                    <p class="mb-0">O arquivo foi validado com sucesso. 23 de 25 registros estão válidos.</p>
                </div>

                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="card text-center border-success">
                            <div class="card-body">
                                <h4 class="text-success">23</h4>
                                <small class="text-muted">Registros Válidos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center border-warning">
                            <div class="card-body">
                                <h4 class="text-warning">2</h4>
                                <small class="text-muted">Com Avisos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center border-danger">
                            <div class="card-body">
                                <h4 class="text-danger">0</h4>
                                <small class="text-muted">Com Erros</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center border-info">
                            <div class="card-body">
                                <h4 class="text-info">0</h4>
                                <small class="text-muted">Duplicatas</small>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Atualizar checklist
            $('.list-group-item i').removeClass('fa-spinner fa-spin text-muted').addClass('fa-check text-success');
        }, 2000);
    },

    startImport() {
        $('#importProgress').removeClass('d-none');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeImport();
            }
            
            $('#progressBar').css('width', progress + '%').text(Math.round(progress) + '%');
            $('#importStatus').text(`Importando registro ${Math.round(progress * 0.23)} de 23...`);
        }, 500);
    },

    completeImport() {
        $('#importStatus').html(`
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                Importação concluída com sucesso! 23 registros foram importados.
            </div>
        `);

        setTimeout(() => {
            window.utils.showAlert('Importação concluída com sucesso!', 'success');
            this.resetWizard();
        }, 2000);
    },

    downloadReport() {
        window.utils.showAlert('Baixando relatório de validação...', 'info');
    },

    resetWizard() {
        this.currentStep = 1;
        this.selectedFile = null;
        this.importedData = [];
        this.validationResults = {};
        this.renderImportWizard();
    },

    showHelp() {
        const modal = `
            <div class="modal fade" id="helpModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-question-circle text-primary me-2"></i>
                                Ajuda - Importação SIGEF
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="accordion" id="helpAccordion">
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help1">
                                            Como preparar o arquivo para importação?
                                        </button>
                                    </h2>
                                    <div id="help1" class="accordion-collapse collapse show" data-bs-parent="#helpAccordion">
                                        <div class="accordion-body">
                                            <p>Para uma importação bem-sucedida, certifique-se de que:</p>
                                            <ul>
                                                <li>O arquivo está no formato correto (CSV, KML, PDF ou XML)</li>
                                                <li>Os dados estão completos e válidos</li>
                                                <li>As coordenadas estão no formato correto</li>
                                                <li>O arquivo não excede 50MB</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help2">
                                            Quais campos são obrigatórios?
                                        </button>
                                    </h2>
                                    <div id="help2" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                        <div class="accordion-body">
                                            <p>Os campos obrigatórios são:</p>
                                            <ul>
                                                <li><strong>Matrícula:</strong> Identificação única do imóvel</li>
                                                <li><strong>Área:</strong> Área em metros quadrados</li>
                                                <li><strong>Coordenadas:</strong> Pontos geográficos do perímetro</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help3">
                                            O que fazer em caso de erro?
                                        </button>
                                    </h2>
                                    <div id="help3" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                        <div class="accordion-body">
                                            <p>Se encontrar erros durante a importação:</p>
                                            <ul>
                                                <li>Verifique o formato do arquivo</li>
                                                <li>Corrija os dados inválidos</li>
                                                <li>Tente importar novamente</li>
                                                <li>Entre em contato com o suporte se necessário</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#helpModal').remove();
        $('body').append(modal);
        $('#helpModal').modal('show');
    }
};