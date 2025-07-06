// Processos Module - Versão Completa
window.ProcessosModule = {
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    statusFilter: '',

    load() {
        window.utils.showLoading();
        this.loadProcessos();
    },

    loadProcessos() {
        const params = {
            page: this.currentPage,
            limit: this.itemsPerPage,
            search: this.searchTerm,
            status: this.statusFilter
        };

        $.get('api/processos.php', params)
            .done((response) => {
                if (response.success) {
                    this.renderProcessos(response.data, response.pagination);
                } else {
                    window.utils.showAlert('Erro ao carregar processos', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    renderProcessos(processos, pagination) {
        const content = `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-file-text text-primary me-2"></i>
                                Processos de Regularização
                            </h5>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="ProcessosModule.showCreateModal()">
                                    <i class="fas fa-plus me-2"></i>Novo Processo
                                </button>
                                <button class="btn btn-outline-success" onclick="ProcessosModule.exportData()">
                                    <i class="fas fa-download me-2"></i>Exportar
                                </button>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-search"></i>
                                        </span>
                                        <input type="text" id="searchInput" class="form-control" 
                                               placeholder="Pesquisar por título ou descrição..."
                                               value="${this.searchTerm}">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select id="statusFilter" class="form-select">
                                        <option value="">Todos os status</option>
                                        <option value="pendente" ${this.statusFilter === 'pendente' ? 'selected' : ''}>Pendente</option>
                                        <option value="em_andamento" ${this.statusFilter === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                                        <option value="concluido" ${this.statusFilter === 'concluido' ? 'selected' : ''}>Concluído</option>
                                        <option value="cancelado" ${this.statusFilter === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-outline-secondary w-100" onclick="ProcessosModule.clearFilters()">
                                        <i class="fas fa-times me-2"></i>Limpar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>
                                            <input type="checkbox" id="selectAll" class="form-check-input">
                                        </th>
                                        <th>Processo</th>
                                        <th>Status</th>
                                        <th>Prioridade</th>
                                        <th>Progresso</th>
                                        <th>Recursos</th>
                                        <th>Data</th>
                                        <th width="150">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderProcessosRows(processos)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ${this.renderPagination(pagination)}
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        this.bindEvents();
    },

    renderProcessosRows(processos) {
        if (!processos || processos.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-file-text fa-3x mb-3 d-block"></i>
                            <h5>Nenhum processo encontrado</h5>
                            <p>Comece criando um novo processo de regularização</p>
                            <button class="btn btn-primary mt-2" onclick="ProcessosModule.showCreateModal()">
                                <i class="fas fa-plus me-2"></i>Criar Processo
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return processos.map(processo => `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input processo-checkbox" value="${processo.id}">
                </td>
                <td>
                    <div>
                        <div class="fw-medium">${processo.titulo}</div>
                        <small class="text-muted">${processo.descricao}</small>
                    </div>
                </td>
                <td>
                    <span class="badge ${this.getStatusClass(processo.status)}">
                        <i class="fas ${this.getStatusIcon(processo.status)} me-1"></i>
                        ${this.getStatusText(processo.status)}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getPriorityClass(processo.prioridade)}">
                        <i class="fas ${this.getPriorityIcon(processo.prioridade)} me-1"></i>
                        ${this.getPriorityText(processo.prioridade)}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress me-2" style="width: 60px; height: 8px;">
                            <div class="progress-bar ${this.getProgressColor(processo.status)}" 
                                 style="width: ${this.getProgressPercentage(processo.status)}%"></div>
                        </div>
                        <small class="text-muted">${this.getProgressPercentage(processo.status)}%</small>
                    </div>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <span class="badge bg-info" title="Imóveis">
                            <i class="fas fa-building me-1"></i>${processo.total_imoveis}
                        </span>
                        <span class="badge bg-secondary" title="Documentos">
                            <i class="fas fa-file me-1"></i>${processo.total_documentos}
                        </span>
                    </div>
                </td>
                <td>
                    <div>
                        <small class="text-muted">${window.utils.formatDate(processo.created_at)}</small>
                        ${processo.updated_at !== processo.created_at ? `<br><small class="text-success">Atualizado: ${window.utils.formatDate(processo.updated_at)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="ProcessosModule.viewProcesso(${processo.id})" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="ProcessosModule.manageDocuments(${processo.id})" title="Documentos">
                            <i class="fas fa-folder"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="ProcessosModule.editProcesso(${processo.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="ProcessosModule.deleteProcesso(${processo.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPagination(pagination) {
        if (!pagination || pagination.total_pages <= 1) {
            return '';
        }

        let paginationHtml = `
            <div class="card-footer bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                        Mostrando ${((pagination.current_page - 1) * pagination.per_page) + 1} a 
                        ${Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} 
                        de ${pagination.total_records} registros
                    </div>
                    <nav>
                        <ul class="pagination pagination-sm mb-0">
        `;

        if (pagination.current_page > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ProcessosModule.goToPage(${pagination.current_page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        for (let i = Math.max(1, pagination.current_page - 2); i <= Math.min(pagination.total_pages, pagination.current_page + 2); i++) {
            if (i === pagination.current_page) {
                paginationHtml += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="ProcessosModule.goToPage(${i})">${i}</a></li>`;
            }
        }

        if (pagination.current_page < pagination.total_pages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ProcessosModule.goToPage(${pagination.current_page + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        paginationHtml += `
                        </ul>
                    </nav>
                </div>
            </div>
        `;

        return paginationHtml;
    },

    bindEvents() {
        // Search input
        $('#searchInput').on('input', (e) => {
            this.searchTerm = $(e.target).val();
            this.currentPage = 1;
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadProcessos();
            }, 500);
        });

        // Status filter
        $('#statusFilter').on('change', (e) => {
            this.statusFilter = $(e.target).val();
            this.currentPage = 1;
            this.loadProcessos();
        });

        // Select all checkbox
        $('#selectAll').on('change', (e) => {
            $('.processo-checkbox').prop('checked', $(e.target).is(':checked'));
        });
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadProcessos();
    },

    clearFilters() {
        $('#searchInput').val('');
        $('#statusFilter').val('');
        this.searchTerm = '';
        this.statusFilter = '';
        this.currentPage = 1;
        this.loadProcessos();
    },

    getStatusClass(status) {
        const classes = {
            'pendente': 'bg-warning',
            'em_andamento': 'bg-info',
            'concluido': 'bg-success',
            'cancelado': 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    },

    getStatusText(status) {
        const texts = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };
        return texts[status] || 'Desconhecido';
    },

    getStatusIcon(status) {
        const icons = {
            'pendente': 'fa-clock',
            'em_andamento': 'fa-spinner',
            'concluido': 'fa-check-circle',
            'cancelado': 'fa-times-circle'
        };
        return icons[status] || 'fa-question-circle';
    },

    getPriorityClass(priority) {
        const classes = {
            'baixa': 'bg-success',
            'media': 'bg-warning',
            'alta': 'bg-danger'
        };
        return classes[priority] || 'bg-secondary';
    },

    getPriorityText(priority) {
        const texts = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        };
        return texts[priority] || 'Desconhecida';
    },

    getPriorityIcon(priority) {
        const icons = {
            'baixa': 'fa-arrow-down',
            'media': 'fa-minus',
            'alta': 'fa-arrow-up'
        };
        return icons[priority] || 'fa-question';
    },

    getProgressPercentage(status) {
        const percentages = {
            'pendente': 10,
            'em_andamento': 50,
            'concluido': 100,
            'cancelado': 0
        };
        return percentages[status] || 0;
    },

    getProgressColor(status) {
        const colors = {
            'pendente': 'bg-warning',
            'em_andamento': 'bg-info',
            'concluido': 'bg-success',
            'cancelado': 'bg-danger'
        };
        return colors[status] || 'bg-secondary';
    },

    showCreateModal() {
        this.renderProcessoModal();
    },

    renderProcessoModal(processo = null) {
        const isEdit = !!processo;
        const modalTitle = isEdit ? 'Editar Processo' : 'Novo Processo';

        const modal = `
            <div class="modal fade" id="processoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-text text-primary me-2"></i>
                                ${modalTitle}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="processoForm">
                            <div class="modal-body">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label">Título do Processo *</label>
                                        <input type="text" id="titulo" class="form-control" 
                                               value="${processo ? processo.titulo : ''}" required
                                               placeholder="Ex: Regularização Loteamento Vila Nova">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Descrição *</label>
                                        <textarea id="descricao" class="form-control" rows="3" required
                                                  placeholder="Descreva o processo de regularização...">${processo ? processo.descricao : ''}</textarea>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Status *</label>
                                        <select id="status" class="form-select" required>
                                            <option value="pendente" ${processo && processo.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                            <option value="em_andamento" ${processo && processo.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                                            <option value="concluido" ${processo && processo.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                                            <option value="cancelado" ${processo && processo.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Prioridade *</label>
                                        <select id="prioridade" class="form-select" required>
                                            <option value="baixa" ${processo && processo.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
                                            <option value="media" ${processo && processo.prioridade === 'media' ? 'selected' : ''}>Média</option>
                                            <option value="alta" ${processo && processo.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
                                        </select>
                                    </div>
                                    ${isEdit ? `
                                    <div class="col-12">
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i>
                                            <strong>Criado em:</strong> ${window.utils.formatDateTime(processo.created_at)}<br>
                                            <strong>Última atualização:</strong> ${window.utils.formatDateTime(processo.updated_at)}
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>
                                    ${isEdit ? 'Atualizar' : 'Criar Processo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        $('#processoModal').remove();
        $('body').append(modal);
        $('#processoModal').modal('show');

        $('#processoForm').on('submit', (e) => {
            e.preventDefault();
            this.saveProcesso(isEdit ? processo.id : null);
        });
    },

    saveProcesso(id = null) {
        const formData = {
            titulo: $('#titulo').val(),
            descricao: $('#descricao').val(),
            status: $('#status').val(),
            prioridade: $('#prioridade').val()
        };

        window.utils.showLoading();

        const url = id ? `api/processos.php?id=${id}` : 'api/processos.php';
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(formData),
            contentType: 'application/json'
        })
        .done((response) => {
            if (response.success) {
                $('#processoModal').modal('hide');
                window.utils.showAlert(id ? 'Processo atualizado com sucesso' : 'Processo criado com sucesso', 'success');
                this.loadProcessos();
            } else {
                window.utils.showAlert(response.error || 'Erro ao salvar processo', 'error');
            }
        })
        .fail(() => {
            window.utils.showAlert('Erro ao conectar com o servidor', 'error');
        })
        .always(() => {
            window.utils.hideLoading();
        });
    },

    viewProcesso(id) {
        window.utils.showLoading();
        
        $.get(`api/processos.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.showProcessoDetails(response.data);
                } else {
                    window.utils.showAlert('Erro ao carregar processo', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    showProcessoDetails(processo) {
        const modal = `
            <div class="modal fade" id="viewProcessoModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-text text-primary me-2"></i>
                                Detalhes do Processo
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-4">
                                <div class="col-md-8">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0">Informações Gerais</h6>
                                        </div>
                                        <div class="card-body">
                                            <h4>${processo.titulo}</h4>
                                            <p class="text-muted">${processo.descricao}</p>
                                            
                                            <div class="row g-3 mt-3">
                                                <div class="col-md-4">
                                                    <strong>Status:</strong><br>
                                                    <span class="badge ${this.getStatusClass(processo.status)}">
                                                        <i class="fas ${this.getStatusIcon(processo.status)} me-1"></i>
                                                        ${this.getStatusText(processo.status)}
                                                    </span>
                                                </div>
                                                <div class="col-md-4">
                                                    <strong>Prioridade:</strong><br>
                                                    <span class="badge ${this.getPriorityClass(processo.prioridade)}">
                                                        <i class="fas ${this.getPriorityIcon(processo.prioridade)} me-1"></i>
                                                        ${this.getPriorityText(processo.prioridade)}
                                                    </span>
                                                </div>
                                                <div class="col-md-4">
                                                    <strong>Progresso:</strong><br>
                                                    <div class="progress mt-1">
                                                        <div class="progress-bar ${this.getProgressColor(processo.status)}" 
                                                             style="width: ${this.getProgressPercentage(processo.status)}%">
                                                            ${this.getProgressPercentage(processo.status)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    ${processo.imoveis && processo.imoveis.length > 0 ? `
                                    <div class="card mt-3">
                                        <div class="card-header">
                                            <h6 class="mb-0">Imóveis Vinculados (${processo.imoveis.length})</h6>
                                        </div>
                                        <div class="card-body p-0">
                                            <div class="table-responsive">
                                                <table class="table table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Matrícula</th>
                                                            <th>Proprietário</th>
                                                            <th>Área</th>
                                                            <th>Cidade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${processo.imoveis.map(imovel => `
                                                            <tr>
                                                                <td>${imovel.matricula}</td>
                                                                <td>${imovel.proprietario_nome || 'Não informado'}</td>
                                                                <td>${window.utils.formatNumber(imovel.area)} m²</td>
                                                                <td>${imovel.cidade}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0">Estatísticas</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <span>Total de Imóveis:</span>
                                                <span class="badge bg-info">${processo.total_imoveis}</span>
                                            </div>
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <span>Documentos:</span>
                                                <span class="badge bg-secondary">${processo.total_documentos}</span>
                                            </div>
                                            <hr>
                                            <div class="mb-2">
                                                <strong>Criado em:</strong><br>
                                                <small class="text-muted">${window.utils.formatDateTime(processo.created_at)}</small>
                                            </div>
                                            <div>
                                                <strong>Última atualização:</strong><br>
                                                <small class="text-muted">${window.utils.formatDateTime(processo.updated_at)}</small>
                                            </div>
                                        </div>
                                    </div>

                                    ${processo.documentos && processo.documentos.length > 0 ? `
                                    <div class="card mt-3">
                                        <div class="card-header">
                                            <h6 class="mb-0">Documentos (${processo.documentos.length})</h6>
                                        </div>
                                        <div class="card-body">
                                            ${processo.documentos.map(doc => `
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fas fa-file text-muted me-2"></i>
                                                    <div class="flex-grow-1">
                                                        <div class="small">${doc.nome}</div>
                                                        <small class="text-muted">${doc.tipo.toUpperCase()}</small>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-info" onclick="ProcessosModule.manageDocuments(${processo.id})">
                                <i class="fas fa-folder me-2"></i>Gerenciar Documentos
                            </button>
                            <button type="button" class="btn btn-primary" onclick="ProcessosModule.editProcesso(${processo.id})">
                                <i class="fas fa-edit me-2"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#viewProcessoModal').remove();
        $('body').append(modal);
        $('#viewProcessoModal').modal('show');
    },

    editProcesso(id) {
        $('#viewProcessoModal').modal('hide');
        
        window.utils.showLoading();
        
        $.get(`api/processos.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.renderProcessoModal(response.data);
                } else {
                    window.utils.showAlert('Erro ao carregar processo', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    deleteProcesso(id) {
        if (confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.')) {
            window.utils.showLoading();
            
            $.ajax({
                url: `api/processos.php?id=${id}`,
                method: 'DELETE'
            })
            .done((response) => {
                if (response.success) {
                    window.utils.showAlert('Processo excluído com sucesso', 'success');
                    this.loadProcessos();
                } else {
                    window.utils.showAlert('Erro ao excluir processo', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
        }
    },

    manageDocuments(processoId) {
        $('#viewProcessoModal').modal('hide');
        window.utils.showAlert('Funcionalidade de gerenciamento de documentos em desenvolvimento', 'info');
    },

    exportData() {
        const selectedIds = $('.processo-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            window.utils.showAlert('Selecione pelo menos um processo para exportar', 'warning');
            return;
        }

        window.utils.showAlert(`Exportando ${selectedIds.length} processos...`, 'info');
        // Implementar exportação
    }
};