// Imóveis Module - Versão Completa
window.ImoveisModule = {
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    currentImovel: null,

    load() {
        window.utils.showLoading();
        this.loadImoveis();
    },

    loadImoveis() {
        const params = {
            page: this.currentPage,
            limit: this.itemsPerPage,
            search: this.searchTerm
        };

        $.get('api/imoveis.php', params)
            .done((response) => {
                if (response.success) {
                    this.renderImoveis(response.data, response.pagination);
                } else {
                    window.utils.showAlert('Erro ao carregar imóveis', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    renderImoveis(imoveis, pagination) {
        const content = `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-building text-primary me-2"></i>
                                Imóveis Cadastrados
                            </h5>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="ImoveisModule.showCreateModal()">
                                    <i class="fas fa-plus me-2"></i>Novo Imóvel
                                </button>
                                <button class="btn btn-outline-success" onclick="ImoveisModule.exportData()">
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
                                               placeholder="Pesquisar por matrícula, endereço ou cidade..."
                                               value="${this.searchTerm}">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select id="estadoFilter" class="form-select">
                                        <option value="">Todos os estados</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-outline-secondary w-100" onclick="ImoveisModule.clearFilters()">
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
                                        <th>Matrícula</th>
                                        <th>Proprietário</th>
                                        <th>Endereço</th>
                                        <th>Área (m²)</th>
                                        <th>Cidade/Estado</th>
                                        <th>Status</th>
                                        <th>Data</th>
                                        <th width="150">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderImoveisRows(imoveis)}
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

    renderImoveisRows(imoveis) {
        if (!imoveis || imoveis.length === 0) {
            return `
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-building fa-3x mb-3 d-block"></i>
                            <h5>Nenhum imóvel encontrado</h5>
                            <p>Comece adicionando um novo imóvel ao sistema</p>
                            <button class="btn btn-primary mt-2" onclick="ImoveisModule.showCreateModal()">
                                <i class="fas fa-plus me-2"></i>Adicionar Imóvel
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return imoveis.map(imovel => `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input imovel-checkbox" value="${imovel.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-success rounded-circle me-2" style="width: 8px; height: 8px;"></div>
                        <div>
                            <span class="fw-medium">${imovel.matricula}</span>
                            ${imovel.processo_titulo ? `<br><small class="text-muted">${imovel.processo_titulo}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" 
                             style="width: 32px; height: 32px; font-size: 12px;">
                            ${imovel.proprietario_nome ? imovel.proprietario_nome.charAt(0).toUpperCase() : 'N'}
                        </div>
                        <span>${imovel.proprietario_nome || 'Não informado'}</span>
                    </div>
                </td>
                <td>
                    <div>
                        <div>${imovel.endereco}</div>
                        ${imovel.coordenadas ? '<small class="text-success"><i class="fas fa-map-marker-alt me-1"></i>Coordenadas disponíveis</small>' : ''}
                    </div>
                </td>
                <td>
                    <span class="badge bg-info">${window.utils.formatNumber(imovel.area)} m²</span>
                    ${imovel.perimetro ? `<br><small class="text-muted">${window.utils.formatNumber(imovel.perimetro)}m perímetro</small>` : ''}
                </td>
                <td>${imovel.cidade}, ${imovel.estado}</td>
                <td>
                    <span class="badge ${this.getStatusBadge(imovel.processo_status)}">
                        ${this.getStatusText(imovel.processo_status)}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${window.utils.formatDate(imovel.created_at)}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="ImoveisModule.viewImovel(${imovel.id})" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="ImoveisModule.showMap(${imovel.id})" title="Mapa">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="ImoveisModule.generateMemorial(${imovel.id})" title="Memorial">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="ImoveisModule.editImovel(${imovel.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="ImoveisModule.deleteImovel(${imovel.id})" title="Excluir">
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
                    <a class="page-link" href="#" onclick="ImoveisModule.goToPage(${pagination.current_page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        for (let i = Math.max(1, pagination.current_page - 2); i <= Math.min(pagination.total_pages, pagination.current_page + 2); i++) {
            if (i === pagination.current_page) {
                paginationHtml += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="ImoveisModule.goToPage(${i})">${i}</a></li>`;
            }
        }

        if (pagination.current_page < pagination.total_pages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ImoveisModule.goToPage(${pagination.current_page + 1})">
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
                this.loadImoveis();
            }, 500);
        });

        // Estado filter
        $('#estadoFilter').on('change', () => {
            this.currentPage = 1;
            this.loadImoveis();
        });

        // Select all checkbox
        $('#selectAll').on('change', (e) => {
            $('.imovel-checkbox').prop('checked', $(e.target).is(':checked'));
        });
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadImoveis();
    },

    clearFilters() {
        $('#searchInput').val('');
        $('#estadoFilter').val('');
        this.searchTerm = '';
        this.currentPage = 1;
        this.loadImoveis();
    },

    getStatusBadge(status) {
        const badges = {
            'pendente': 'bg-warning',
            'em_andamento': 'bg-info',
            'concluido': 'bg-success',
            'cancelado': 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    },

    getStatusText(status) {
        const texts = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };
        return texts[status] || 'Sem processo';
    },

    showCreateModal() {
        this.loadProprietarios(() => {
            this.loadProcessos(() => {
                this.renderImovelModal();
            });
        });
    },

    loadProprietarios(callback) {
        $.get('api/proprietarios.php', { limit: 100 })
            .done((response) => {
                if (response.success) {
                    this.proprietarios = response.data;
                    if (callback) callback();
                }
            });
    },

    loadProcessos(callback) {
        $.get('api/processos.php', { limit: 100 })
            .done((response) => {
                if (response.success) {
                    this.processos = response.data;
                    if (callback) callback();
                }
            });
    },

    renderImovelModal(imovel = null) {
        const isEdit = !!imovel;
        const modalTitle = isEdit ? 'Editar Imóvel' : 'Novo Imóvel';
        
        const proprietariosOptions = this.proprietarios.map(prop => 
            `<option value="${prop.id}" ${imovel && imovel.proprietario_id == prop.id ? 'selected' : ''}>${prop.nome}</option>`
        ).join('');

        const processosOptions = this.processos.map(proc => 
            `<option value="${proc.id}" ${imovel && imovel.processo_id == proc.id ? 'selected' : ''}>${proc.titulo}</option>`
        ).join('');

        const modal = `
            <div class="modal fade" id="imovelModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-building text-primary me-2"></i>
                                ${modalTitle}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="imovelForm">
                            <div class="modal-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Matrícula *</label>
                                        <input type="text" id="matricula" class="form-control" 
                                               value="${imovel ? imovel.matricula : ''}" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Área (m²) *</label>
                                        <input type="number" id="area" class="form-control" step="0.01"
                                               value="${imovel ? imovel.area : ''}" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Perímetro (m)</label>
                                        <input type="number" id="perimetro" class="form-control" step="0.01"
                                               value="${imovel ? imovel.perimetro : ''}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Endereço *</label>
                                        <textarea id="endereco" class="form-control" rows="2" required>${imovel ? imovel.endereco : ''}</textarea>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Cidade *</label>
                                        <input type="text" id="cidade" class="form-control" 
                                               value="${imovel ? imovel.cidade : ''}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Estado *</label>
                                        <select id="estado" class="form-select" required>
                                            <option value="">Selecione...</option>
                                            <option value="SP" ${imovel && imovel.estado === 'SP' ? 'selected' : ''}>São Paulo</option>
                                            <option value="RJ" ${imovel && imovel.estado === 'RJ' ? 'selected' : ''}>Rio de Janeiro</option>
                                            <option value="MG" ${imovel && imovel.estado === 'MG' ? 'selected' : ''}>Minas Gerais</option>
                                            <option value="RS" ${imovel && imovel.estado === 'RS' ? 'selected' : ''}>Rio Grande do Sul</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Proprietário</label>
                                        <select id="proprietario_id" class="form-select">
                                            <option value="">Selecione...</option>
                                            ${proprietariosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Processo</label>
                                        <select id="processo_id" class="form-select">
                                            <option value="">Selecione...</option>
                                            ${processosOptions}
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Coordenadas (JSON)</label>
                                        <textarea id="coordenadas" class="form-control" rows="4" 
                                                  placeholder='[{"latitude": -23.550520, "longitude": -46.633309, "point": "P1"}]'>${imovel && imovel.coordenadas ? JSON.stringify(imovel.coordenadas, null, 2) : ''}</textarea>
                                        <small class="text-muted">Formato JSON com array de coordenadas</small>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>
                                    ${isEdit ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        $('#imovelModal').remove();
        $('body').append(modal);
        $('#imovelModal').modal('show');

        $('#imovelForm').on('submit', (e) => {
            e.preventDefault();
            this.saveImovel(isEdit ? imovel.id : null);
        });
    },

    saveImovel(id = null) {
        const formData = {
            matricula: $('#matricula').val(),
            area: parseFloat($('#area').val()),
            perimetro: parseFloat($('#perimetro').val()) || null,
            endereco: $('#endereco').val(),
            cidade: $('#cidade').val(),
            estado: $('#estado').val(),
            proprietario_id: $('#proprietario_id').val() || null,
            processo_id: $('#processo_id').val() || null
        };

        // Parse coordenadas JSON
        const coordenadasText = $('#coordenadas').val().trim();
        if (coordenadasText) {
            try {
                formData.coordenadas = JSON.parse(coordenadasText);
            } catch (e) {
                window.utils.showAlert('Formato de coordenadas inválido', 'error');
                return;
            }
        }

        window.utils.showLoading();

        const url = id ? `api/imoveis.php?id=${id}` : 'api/imoveis.php';
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(formData),
            contentType: 'application/json'
        })
        .done((response) => {
            if (response.success) {
                $('#imovelModal').modal('hide');
                window.utils.showAlert(id ? 'Imóvel atualizado com sucesso' : 'Imóvel criado com sucesso', 'success');
                this.loadImoveis();
            } else {
                window.utils.showAlert(response.error || 'Erro ao salvar imóvel', 'error');
            }
        })
        .fail(() => {
            window.utils.showAlert('Erro ao conectar com o servidor', 'error');
        })
        .always(() => {
            window.utils.hideLoading();
        });
    },

    viewImovel(id) {
        window.utils.showLoading();
        
        $.get(`api/imoveis.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.showImovelDetails(response.data);
                } else {
                    window.utils.showAlert('Erro ao carregar imóvel', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    showImovelDetails(imovel) {
        const modal = `
            <div class="modal fade" id="viewImovelModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-building text-primary me-2"></i>
                                Detalhes do Imóvel
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <strong>Matrícula:</strong><br>
                                    <span class="badge bg-primary">${imovel.matricula}</span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Área:</strong><br>
                                    ${window.utils.formatNumber(imovel.area)} m²
                                </div>
                                <div class="col-md-6">
                                    <strong>Perímetro:</strong><br>
                                    ${imovel.perimetro ? window.utils.formatNumber(imovel.perimetro) + ' m' : 'Não informado'}
                                </div>
                                <div class="col-md-6">
                                    <strong>Proprietário:</strong><br>
                                    ${imovel.proprietario_nome || 'Não informado'}
                                </div>
                                <div class="col-12">
                                    <strong>Endereço:</strong><br>
                                    ${imovel.endereco}
                                </div>
                                <div class="col-md-6">
                                    <strong>Cidade/Estado:</strong><br>
                                    ${imovel.cidade}, ${imovel.estado}
                                </div>
                                <div class="col-md-6">
                                    <strong>Processo:</strong><br>
                                    ${imovel.processo_titulo || 'Não vinculado'}
                                </div>
                                ${imovel.coordenadas ? `
                                <div class="col-12">
                                    <strong>Coordenadas:</strong><br>
                                    <div class="bg-light p-3 rounded">
                                        <pre class="mb-0" style="font-size: 12px;">${JSON.stringify(imovel.coordenadas, null, 2)}</pre>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary" onclick="ImoveisModule.editImovel(${imovel.id})">
                                <i class="fas fa-edit me-2"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#viewImovelModal').remove();
        $('body').append(modal);
        $('#viewImovelModal').modal('show');
    },

    editImovel(id) {
        $('#viewImovelModal').modal('hide');
        
        window.utils.showLoading();
        
        $.get(`api/imoveis.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.loadProprietarios(() => {
                        this.loadProcessos(() => {
                            this.renderImovelModal(response.data);
                        });
                    });
                } else {
                    window.utils.showAlert('Erro ao carregar imóvel', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    deleteImovel(id) {
        if (confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
            window.utils.showLoading();
            
            $.ajax({
                url: `api/imoveis.php?id=${id}`,
                method: 'DELETE'
            })
            .done((response) => {
                if (response.success) {
                    window.utils.showAlert('Imóvel excluído com sucesso', 'success');
                    this.loadImoveis();
                } else {
                    window.utils.showAlert('Erro ao excluir imóvel', 'error');
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

    showMap(id) {
        window.utils.showLoading();
        
        $.get(`api/imoveis.php?id=${id}`)
            .done((response) => {
                if (response.success && response.data.coordenadas) {
                    this.renderMapModal(response.data);
                } else {
                    window.utils.showAlert('Este imóvel não possui coordenadas cadastradas', 'warning');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao carregar dados do imóvel', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    renderMapModal(imovel) {
        const modal = `
            <div class="modal fade" id="mapModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-map text-success me-2"></i>
                                Visualização no Mapa - ${imovel.matricula}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <div id="mapContainer" style="height: 400px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.375rem;">
                                        <div class="d-flex align-items-center justify-content-center h-100">
                                            <div class="text-center text-muted">
                                                <i class="fas fa-map fa-3x mb-3"></i>
                                                <h5>Mapa Interativo</h5>
                                                <p>Integração com Google Maps ou Leaflet<br>será implementada aqui</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <h6>Informações do Imóvel</h6>
                                    <div class="card">
                                        <div class="card-body">
                                            <p><strong>Matrícula:</strong> ${imovel.matricula}</p>
                                            <p><strong>Área:</strong> ${window.utils.formatNumber(imovel.area)} m²</p>
                                            <p><strong>Endereço:</strong> ${imovel.endereco}</p>
                                            <hr>
                                            <h6>Coordenadas</h6>
                                            <div class="table-responsive">
                                                <table class="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Ponto</th>
                                                            <th>Latitude</th>
                                                            <th>Longitude</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${imovel.coordenadas.map(coord => `
                                                            <tr>
                                                                <td>${coord.point}</td>
                                                                <td>${coord.latitude}</td>
                                                                <td>${coord.longitude}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-success" onclick="ImoveisModule.exportKML(${imovel.id})">
                                <i class="fas fa-download me-2"></i>Exportar KML
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#mapModal').remove();
        $('body').append(modal);
        $('#mapModal').modal('show');
    },

    generateMemorial(id) {
        window.app.navigateTo('memorial');
        setTimeout(() => {
            if (window.MemorialModule) {
                $('#imovelSelect').val(id).trigger('change');
            }
        }, 500);
    },

    exportData() {
        const selectedIds = $('.imovel-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            window.utils.showAlert('Selecione pelo menos um imóvel para exportar', 'warning');
            return;
        }

        window.utils.showAlert(`Exportando ${selectedIds.length} imóveis...`, 'info');
        // Implementar exportação
    },

    exportKML(id) {
        window.utils.showAlert('Funcionalidade de exportação KML em desenvolvimento', 'info');
    }
};