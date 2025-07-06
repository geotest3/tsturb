// Proprietários Module - Versão Completa
window.ProprietariosModule = {
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',

    load() {
        window.utils.showLoading();
        this.loadProprietarios();
    },

    loadProprietarios() {
        const params = {
            page: this.currentPage,
            limit: this.itemsPerPage,
            search: this.searchTerm
        };

        $.get('api/proprietarios.php', params)
            .done((response) => {
                if (response.success) {
                    this.renderProprietarios(response.data, response.pagination);
                } else {
                    window.utils.showAlert('Erro ao carregar proprietários', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    renderProprietarios(proprietarios, pagination) {
        const content = `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-users text-primary me-2"></i>
                                Proprietários Cadastrados
                            </h5>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="ProprietariosModule.showCreateModal()">
                                    <i class="fas fa-plus me-2"></i>Novo Proprietário
                                </button>
                                <button class="btn btn-outline-success" onclick="ProprietariosModule.exportData()">
                                    <i class="fas fa-download me-2"></i>Exportar
                                </button>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-search"></i>
                                        </span>
                                        <input type="text" id="searchInput" class="form-control" 
                                               placeholder="Pesquisar por nome, documento ou email..."
                                               value="${this.searchTerm}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <button class="btn btn-outline-secondary w-100" onclick="ProprietariosModule.clearFilters()">
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
                                        <th>Nome</th>
                                        <th>Documento</th>
                                        <th>Contato</th>
                                        <th>Localização</th>
                                        <th>Imóveis</th>
                                        <th>Data Cadastro</th>
                                        <th width="150">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderProprietariosRows(proprietarios)}
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

    renderProprietariosRows(proprietarios) {
        if (!proprietarios || proprietarios.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-users fa-3x mb-3 d-block"></i>
                            <h5>Nenhum proprietário encontrado</h5>
                            <p>Comece adicionando um novo proprietário ao sistema</p>
                            <button class="btn btn-primary mt-2" onclick="ProprietariosModule.showCreateModal()">
                                <i class="fas fa-plus me-2"></i>Adicionar Proprietário
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return proprietarios.map(proprietario => `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input proprietario-checkbox" value="${proprietario.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-3" 
                             style="width: 40px; height: 40px; font-size: 14px; font-weight: 600;">
                            ${proprietario.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-medium">${proprietario.nome}</div>
                            ${proprietario.email ? `<small class="text-muted">${proprietario.email}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${this.formatDocument(proprietario.documento)}</span>
                </td>
                <td>
                    <div>
                        ${proprietario.email ? `<div><i class="fas fa-envelope text-muted me-1"></i>${proprietario.email}</div>` : ''}
                        ${proprietario.telefone ? `<div><i class="fas fa-phone text-muted me-1"></i>${proprietario.telefone}</div>` : ''}
                        ${!proprietario.email && !proprietario.telefone ? '<span class="text-muted">Não informado</span>' : ''}
                    </div>
                </td>
                <td>
                    <div>
                        <div>${proprietario.cidade}, ${proprietario.estado}</div>
                        ${proprietario.endereco ? `<small class="text-muted">${proprietario.endereco}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge ${proprietario.total_imoveis > 0 ? 'bg-info' : 'bg-light text-dark'}">
                        ${proprietario.total_imoveis} imóveis
                    </span>
                </td>
                <td>
                    <small class="text-muted">${window.utils.formatDate(proprietario.created_at)}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="ProprietariosModule.viewProprietario(${proprietario.id})" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="ProprietariosModule.viewImoveis(${proprietario.id})" title="Ver Imóveis">
                            <i class="fas fa-building"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="ProprietariosModule.editProprietario(${proprietario.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="ProprietariosModule.deleteProprietario(${proprietario.id})" title="Excluir">
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
                    <a class="page-link" href="#" onclick="ProprietariosModule.goToPage(${pagination.current_page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        for (let i = Math.max(1, pagination.current_page - 2); i <= Math.min(pagination.total_pages, pagination.current_page + 2); i++) {
            if (i === pagination.current_page) {
                paginationHtml += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" onclick="ProprietariosModule.goToPage(${i})">${i}</a></li>`;
            }
        }

        if (pagination.current_page < pagination.total_pages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="ProprietariosModule.goToPage(${pagination.current_page + 1})">
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
                this.loadProprietarios();
            }, 500);
        });

        // Select all checkbox
        $('#selectAll').on('change', (e) => {
            $('.proprietario-checkbox').prop('checked', $(e.target).is(':checked'));
        });
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadProprietarios();
    },

    clearFilters() {
        $('#searchInput').val('');
        this.searchTerm = '';
        this.currentPage = 1;
        this.loadProprietarios();
    },

    formatDocument(documento) {
        if (!documento) return 'Não informado';
        
        // CPF format
        if (documento.length === 11) {
            return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        // CNPJ format
        if (documento.length === 14) {
            return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        return documento;
    },

    showCreateModal() {
        this.renderProprietarioModal();
    },

    renderProprietarioModal(proprietario = null) {
        const isEdit = !!proprietario;
        const modalTitle = isEdit ? 'Editar Proprietário' : 'Novo Proprietário';

        const modal = `
            <div class="modal fade" id="proprietarioModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user text-primary me-2"></i>
                                ${modalTitle}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="proprietarioForm">
                            <div class="modal-body">
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <label class="form-label">Nome Completo *</label>
                                        <input type="text" id="nome" class="form-control" 
                                               value="${proprietario ? proprietario.nome : ''}" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">CPF/CNPJ *</label>
                                        <input type="text" id="documento" class="form-control" 
                                               value="${proprietario ? proprietario.documento : ''}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Email</label>
                                        <input type="email" id="email" class="form-control" 
                                               value="${proprietario ? proprietario.email : ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Telefone</label>
                                        <input type="tel" id="telefone" class="form-control" 
                                               value="${proprietario ? proprietario.telefone : ''}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Endereço</label>
                                        <textarea id="endereco" class="form-control" rows="2">${proprietario ? proprietario.endereco : ''}</textarea>
                                    </div>
                                    <div class="col-md-8">
                                        <label class="form-label">Cidade *</label>
                                        <input type="text" id="cidade" class="form-control" 
                                               value="${proprietario ? proprietario.cidade : ''}" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Estado *</label>
                                        <select id="estado" class="form-select" required>
                                            <option value="">Selecione...</option>
                                            <option value="AC" ${proprietario && proprietario.estado === 'AC' ? 'selected' : ''}>Acre</option>
                                            <option value="AL" ${proprietario && proprietario.estado === 'AL' ? 'selected' : ''}>Alagoas</option>
                                            <option value="AP" ${proprietario && proprietario.estado === 'AP' ? 'selected' : ''}>Amapá</option>
                                            <option value="AM" ${proprietario && proprietario.estado === 'AM' ? 'selected' : ''}>Amazonas</option>
                                            <option value="BA" ${proprietario && proprietario.estado === 'BA' ? 'selected' : ''}>Bahia</option>
                                            <option value="CE" ${proprietario && proprietario.estado === 'CE' ? 'selected' : ''}>Ceará</option>
                                            <option value="DF" ${proprietario && proprietario.estado === 'DF' ? 'selected' : ''}>Distrito Federal</option>
                                            <option value="ES" ${proprietario && proprietario.estado === 'ES' ? 'selected' : ''}>Espírito Santo</option>
                                            <option value="GO" ${proprietario && proprietario.estado === 'GO' ? 'selected' : ''}>Goiás</option>
                                            <option value="MA" ${proprietario && proprietario.estado === 'MA' ? 'selected' : ''}>Maranhão</option>
                                            <option value="MT" ${proprietario && proprietario.estado === 'MT' ? 'selected' : ''}>Mato Grosso</option>
                                            <option value="MS" ${proprietario && proprietario.estado === 'MS' ? 'selected' : ''}>Mato Grosso do Sul</option>
                                            <option value="MG" ${proprietario && proprietario.estado === 'MG' ? 'selected' : ''}>Minas Gerais</option>
                                            <option value="PA" ${proprietario && proprietario.estado === 'PA' ? 'selected' : ''}>Pará</option>
                                            <option value="PB" ${proprietario && proprietario.estado === 'PB' ? 'selected' : ''}>Paraíba</option>
                                            <option value="PR" ${proprietario && proprietario.estado === 'PR' ? 'selected' : ''}>Paraná</option>
                                            <option value="PE" ${proprietario && proprietario.estado === 'PE' ? 'selected' : ''}>Pernambuco</option>
                                            <option value="PI" ${proprietario && proprietario.estado === 'PI' ? 'selected' : ''}>Piauí</option>
                                            <option value="RJ" ${proprietario && proprietario.estado === 'RJ' ? 'selected' : ''}>Rio de Janeiro</option>
                                            <option value="RN" ${proprietario && proprietario.estado === 'RN' ? 'selected' : ''}>Rio Grande do Norte</option>
                                            <option value="RS" ${proprietario && proprietario.estado === 'RS' ? 'selected' : ''}>Rio Grande do Sul</option>
                                            <option value="RO" ${proprietario && proprietario.estado === 'RO' ? 'selected' : ''}>Rondônia</option>
                                            <option value="RR" ${proprietario && proprietario.estado === 'RR' ? 'selected' : ''}>Roraima</option>
                                            <option value="SC" ${proprietario && proprietario.estado === 'SC' ? 'selected' : ''}>Santa Catarina</option>
                                            <option value="SP" ${proprietario && proprietario.estado === 'SP' ? 'selected' : ''}>São Paulo</option>
                                            <option value="SE" ${proprietario && proprietario.estado === 'SE' ? 'selected' : ''}>Sergipe</option>
                                            <option value="TO" ${proprietario && proprietario.estado === 'TO' ? 'selected' : ''}>Tocantins</option>
                                        </select>
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

        $('#proprietarioModal').remove();
        $('body').append(modal);
        $('#proprietarioModal').modal('show');

        // Mask for document input
        $('#documento').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            if (value.length <= 11) {
                // CPF mask
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // CNPJ mask
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
            $(this).val(value);
        });

        // Phone mask
        $('#telefone').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            value = value.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
            $(this).val(value);
        });

        $('#proprietarioForm').on('submit', (e) => {
            e.preventDefault();
            this.saveProprietario(isEdit ? proprietario.id : null);
        });
    },

    saveProprietario(id = null) {
        const formData = {
            nome: $('#nome').val(),
            documento: $('#documento').val().replace(/\D/g, ''),
            email: $('#email').val() || null,
            telefone: $('#telefone').val() || null,
            endereco: $('#endereco').val() || null,
            cidade: $('#cidade').val(),
            estado: $('#estado').val()
        };

        // Validate document
        if (formData.documento.length !== 11 && formData.documento.length !== 14) {
            window.utils.showAlert('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos', 'error');
            return;
        }

        window.utils.showLoading();

        const url = id ? `api/proprietarios.php?id=${id}` : 'api/proprietarios.php';
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(formData),
            contentType: 'application/json'
        })
        .done((response) => {
            if (response.success) {
                $('#proprietarioModal').modal('hide');
                window.utils.showAlert(id ? 'Proprietário atualizado com sucesso' : 'Proprietário criado com sucesso', 'success');
                this.loadProprietarios();
            } else {
                window.utils.showAlert(response.error || 'Erro ao salvar proprietário', 'error');
            }
        })
        .fail(() => {
            window.utils.showAlert('Erro ao conectar com o servidor', 'error');
        })
        .always(() => {
            window.utils.hideLoading();
        });
    },

    viewProprietario(id) {
        window.utils.showLoading();
        
        $.get(`api/proprietarios.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.showProprietarioDetails(response.data);
                } else {
                    window.utils.showAlert('Erro ao carregar proprietário', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    showProprietarioDetails(proprietario) {
        const modal = `
            <div class="modal fade" id="viewProprietarioModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user text-primary me-2"></i>
                                Detalhes do Proprietário
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-12 text-center mb-3">
                                    <div class="bg-primary rounded-circle text-white d-inline-flex align-items-center justify-content-center" 
                                         style="width: 80px; height: 80px; font-size: 32px; font-weight: 600;">
                                        ${proprietario.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 class="mt-2 mb-0">${proprietario.nome}</h4>
                                    <span class="badge bg-secondary">${this.formatDocument(proprietario.documento)}</span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Email:</strong><br>
                                    ${proprietario.email ? `<a href="mailto:${proprietario.email}">${proprietario.email}</a>` : 'Não informado'}
                                </div>
                                <div class="col-md-6">
                                    <strong>Telefone:</strong><br>
                                    ${proprietario.telefone ? `<a href="tel:${proprietario.telefone}">${proprietario.telefone}</a>` : 'Não informado'}
                                </div>
                                <div class="col-12">
                                    <strong>Endereço:</strong><br>
                                    ${proprietario.endereco || 'Não informado'}
                                </div>
                                <div class="col-md-6">
                                    <strong>Cidade:</strong><br>
                                    ${proprietario.cidade}
                                </div>
                                <div class="col-md-6">
                                    <strong>Estado:</strong><br>
                                    ${proprietario.estado}
                                </div>
                                <div class="col-md-6">
                                    <strong>Total de Imóveis:</strong><br>
                                    <span class="badge bg-info">${proprietario.total_imoveis} imóveis</span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Data de Cadastro:</strong><br>
                                    ${window.utils.formatDate(proprietario.created_at)}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-info" onclick="ProprietariosModule.viewImoveis(${proprietario.id})">
                                <i class="fas fa-building me-2"></i>Ver Imóveis
                            </button>
                            <button type="button" class="btn btn-primary" onclick="ProprietariosModule.editProprietario(${proprietario.id})">
                                <i class="fas fa-edit me-2"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#viewProprietarioModal').remove();
        $('body').append(modal);
        $('#viewProprietarioModal').modal('show');
    },

    editProprietario(id) {
        $('#viewProprietarioModal').modal('hide');
        
        window.utils.showLoading();
        
        $.get(`api/proprietarios.php?id=${id}`)
            .done((response) => {
                if (response.success) {
                    this.renderProprietarioModal(response.data);
                } else {
                    window.utils.showAlert('Erro ao carregar proprietário', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                window.utils.hideLoading();
            });
    },

    deleteProprietario(id) {
        if (confirm('Tem certeza que deseja excluir este proprietário? Esta ação não pode ser desfeita.')) {
            window.utils.showLoading();
            
            $.ajax({
                url: `api/proprietarios.php?id=${id}`,
                method: 'DELETE'
            })
            .done((response) => {
                if (response.success) {
                    window.utils.showAlert('Proprietário excluído com sucesso', 'success');
                    this.loadProprietarios();
                } else {
                    window.utils.showAlert(response.error || 'Erro ao excluir proprietário', 'error');
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

    viewImoveis(proprietarioId) {
        $('#viewProprietarioModal').modal('hide');
        
        // Navigate to imoveis page with filter
        window.app.navigateTo('imoveis');
        setTimeout(() => {
            if (window.ImoveisModule) {
                // Filter by proprietario - this would need to be implemented in the imoveis module
                window.utils.showAlert('Filtro por proprietário será implementado', 'info');
            }
        }, 500);
    },

    exportData() {
        const selectedIds = $('.proprietario-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            window.utils.showAlert('Selecione pelo menos um proprietário para exportar', 'warning');
            return;
        }

        window.utils.showAlert(`Exportando ${selectedIds.length} proprietários...`, 'info');
        // Implementar exportação
    }
};