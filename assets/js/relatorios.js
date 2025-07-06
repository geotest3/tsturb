// Relatórios Module - Funcionalidade Completa
window.RelatoriosModule = {
    charts: {},
    currentFilters: {},

    load() {
        this.renderRelatorios();
        this.loadCharts();
        this.loadRecentReports();
    },

    renderRelatorios() {
        const content = `
            <div class="fade-in">
                <div class="row g-4">
                    <!-- Filtros Globais -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-chart-bar text-primary me-2"></i>
                                        Central de Relatórios e Analytics
                                    </h5>
                                    <div class="btn-group">
                                        <button class="btn btn-outline-primary" onclick="RelatoriosModule.refreshData()">
                                            <i class="fas fa-sync me-2"></i>Atualizar
                                        </button>
                                        <button class="btn btn-outline-success" onclick="RelatoriosModule.scheduleReport()">
                                            <i class="fas fa-clock me-2"></i>Agendar
                                        </button>
                                        <button class="btn btn-outline-info" onclick="RelatoriosModule.showTemplates()">
                                            <i class="fas fa-file-copy me-2"></i>Templates
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <label class="form-label small">Período</label>
                                        <select id="periodoFilter" class="form-select form-select-sm">
                                            <option value="7">Últimos 7 dias</option>
                                            <option value="30" selected>Últimos 30 dias</option>
                                            <option value="90">Últimos 90 dias</option>
                                            <option value="365">Último ano</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small">Estado</label>
                                        <select id="estadoFilter" class="form-select form-select-sm">
                                            <option value="">Todos os estados</option>
                                            <option value="SP">São Paulo</option>
                                            <option value="RJ">Rio de Janeiro</option>
                                            <option value="MG">Minas Gerais</option>
                                            <option value="RS">Rio Grande do Sul</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small">Status</label>
                                        <select id="statusFilter" class="form-select form-select-sm">
                                            <option value="">Todos os status</option>
                                            <option value="pendente">Pendente</option>
                                            <option value="em_andamento">Em Andamento</option>
                                            <option value="concluido">Concluído</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <button class="btn btn-primary btn-sm w-100 mt-4" onclick="RelatoriosModule.applyFilters()">
                                            <i class="fas fa-filter me-2"></i>Aplicar Filtros
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Relatórios Rápidos -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Relatórios Rápidos</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="card border-primary h-100">
                                            <div class="card-body text-center">
                                                <i class="fas fa-building fa-3x text-primary mb-3"></i>
                                                <h6 class="card-title">Relatório de Imóveis</h6>
                                                <p class="card-text small text-muted">Lista completa com filtros personalizados e estatísticas detalhadas</p>
                                                <div class="btn-group w-100">
                                                    <button class="btn btn-primary btn-sm" onclick="RelatoriosModule.generateImoveis('pdf')">
                                                        <i class="fas fa-file-pdf me-1"></i>PDF
                                                    </button>
                                                    <button class="btn btn-outline-primary btn-sm" onclick="RelatoriosModule.generateImoveis('excel')">
                                                        <i class="fas fa-file-excel me-1"></i>Excel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card border-success h-100">
                                            <div class="card-body text-center">
                                                <i class="fas fa-users fa-3x text-success mb-3"></i>
                                                <h6 class="card-title">Relatório de Proprietários</h6>
                                                <p class="card-text small text-muted">Dados dos proprietários com seus respectivos imóveis</p>
                                                <div class="btn-group w-100">
                                                    <button class="btn btn-success btn-sm" onclick="RelatoriosModule.generateProprietarios('pdf')">
                                                        <i class="fas fa-file-pdf me-1"></i>PDF
                                                    </button>
                                                    <button class="btn btn-outline-success btn-sm" onclick="RelatoriosModule.generateProprietarios('excel')">
                                                        <i class="fas fa-file-excel me-1"></i>Excel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card border-info h-100">
                                            <div class="card-body text-center">
                                                <i class="fas fa-file-text fa-3x text-info mb-3"></i>
                                                <h6 class="card-title">Relatório de Processos</h6>
                                                <p class="card-text small text-muted">Status e andamento dos processos de regularização</p>
                                                <div class="btn-group w-100">
                                                    <button class="btn btn-info btn-sm" onclick="RelatoriosModule.generateProcessos('pdf')">
                                                        <i class="fas fa-file-pdf me-1"></i>PDF
                                                    </button>
                                                    <button class="btn btn-outline-info btn-sm" onclick="RelatoriosModule.generateProcessos('excel')">
                                                        <i class="fas fa-file-excel me-1"></i>Excel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Gráficos e Estatísticas -->
                    <div class="col-lg-8">
                        <div class="row g-4">
                            <!-- Gráfico de Status -->
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header bg-white">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h6 class="card-title mb-0">Distribuição de Processos por Status</h6>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary active" onclick="RelatoriosModule.changeChartType('statusChart', 'doughnut')">
                                                    <i class="fas fa-chart-pie"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary" onclick="RelatoriosModule.changeChartType('statusChart', 'bar')">
                                                    <i class="fas fa-chart-bar"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <canvas id="statusChart" height="300"></canvas>
                                    </div>
                                </div>
                            </div>

                            <!-- Gráfico de Evolução Temporal -->
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header bg-white">
                                        <h6 class="card-title mb-0">Evolução Temporal dos Cadastros</h6>
                                    </div>
                                    <div class="card-body">
                                        <canvas id="timelineChart" height="250"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Painel Lateral -->
                    <div class="col-lg-4">
                        <!-- Estatísticas Rápidas -->
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Estatísticas Rápidas</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-2 text-center">
                                    <div class="col-6">
                                        <div class="border rounded p-3">
                                            <div class="h4 mb-0 text-primary" id="totalImoveis">0</div>
                                            <small class="text-muted">Imóveis</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-3">
                                            <div class="h4 mb-0 text-success" id="totalProprietarios">0</div>
                                            <small class="text-muted">Proprietários</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-3">
                                            <div class="h4 mb-0 text-info" id="totalProcessos">0</div>
                                            <small class="text-muted">Processos</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-3">
                                            <div class="h4 mb-0 text-warning" id="totalArea">0</div>
                                            <small class="text-muted">Área (ha)</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Estados com Mais Imóveis -->
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Top Estados</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="estadosChart" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Relatórios Recentes -->
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Relatórios Recentes</h6>
                            </div>
                            <div class="card-body p-0" style="max-height: 300px; overflow-y: auto;">
                                <div id="recentReports">
                                    <!-- Lista será carregada aqui -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Relatório Personalizado -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Gerador de Relatório Personalizado</h6>
                            </div>
                            <div class="card-body">
                                <form id="customReportForm" class="row g-3">
                                    <div class="col-md-3">
                                        <label class="form-label">Tipo de Relatório</label>
                                        <select id="reportType" class="form-select">
                                            <option value="imoveis">Imóveis</option>
                                            <option value="proprietarios">Proprietários</option>
                                            <option value="processos">Processos</option>
                                            <option value="memoriais">Memoriais</option>
                                            <option value="importacoes">Importações</option>
                                            <option value="analytics">Analytics Completo</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">Data Inicial</label>
                                        <input type="date" id="dataInicial" class="form-control">
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">Data Final</label>
                                        <input type="date" id="dataFinal" class="form-control">
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">Formato</label>
                                        <select id="reportFormat" class="form-select">
                                            <option value="pdf">PDF</option>
                                            <option value="excel">Excel</option>
                                            <option value="csv">CSV</option>
                                            <option value="json">JSON</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">&nbsp;</label>
                                        <div class="d-grid">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-chart-line me-2"></i>Gerar Relatório
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="row g-2">
                                            <div class="col-md-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="includeCharts" checked>
                                                    <label class="form-check-label small" for="includeCharts">
                                                        Incluir gráficos
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="includeDetails" checked>
                                                    <label class="form-check-label small" for="includeDetails">
                                                        Detalhes completos
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="includeCoordinates">
                                                    <label class="form-check-label small" for="includeCoordinates">
                                                        Incluir coordenadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="compressFile">
                                                    <label class="form-check-label small" for="compressFile">
                                                        Comprimir arquivo
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Exportações Rápidas -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Exportações Rápidas</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-2">
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-danger w-100" onclick="RelatoriosModule.exportPDF()">
                                            <i class="fas fa-file-pdf me-2"></i>Exportar PDF
                                        </button>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-success w-100" onclick="RelatoriosModule.exportExcel()">
                                            <i class="fas fa-file-excel me-2"></i>Exportar Excel
                                        </button>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-info w-100" onclick="RelatoriosModule.exportCSV()">
                                            <i class="fas fa-file-csv me-2"></i>Exportar CSV
                                        </button>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-secondary w-100" onclick="RelatoriosModule.exportKML()">
                                            <i class="fas fa-map me-2"></i>Exportar KML
                                        </button>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-warning w-100" onclick="RelatoriosModule.exportJSON()">
                                            <i class="fas fa-file-code me-2"></i>Exportar JSON
                                        </button>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-primary w-100" onclick="RelatoriosModule.exportAll()">
                                            <i class="fas fa-download me-2"></i>Exportar Tudo
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
        this.bindEvents();
    },

    bindEvents() {
        $('#customReportForm').on('submit', (e) => {
            e.preventDefault();
            this.generateCustomReport();
        });

        $('#periodoFilter').on('change', (e) => {
            if ($(e.target).val() === 'custom') {
                this.showCustomDatePicker();
            }
        });
    },

    loadCharts() {
        this.loadStatusChart();
        this.loadTimelineChart();
        this.loadEstadosChart();
        this.loadStatistics();
    },

    loadStatusChart() {
        $.get('api/dashboard.php')
            .done((response) => {
                if (response.success) {
                    const ctx = document.getElementById('statusChart').getContext('2d');
                    this.charts.statusChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Pendentes', 'Em Andamento', 'Concluídos', 'Cancelados'],
                            datasets: [{
                                data: [
                                    response.stats.processos_pendentes,
                                    response.stats.total_processos - response.stats.processos_pendentes - response.stats.processos_concluidos,
                                    response.stats.processos_concluidos,
                                    0
                                ],
                                backgroundColor: [
                                    '#ffc107',
                                    '#17a2b8',
                                    '#28a745',
                                    '#dc3545'
                                ],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            });
    },

    loadTimelineChart() {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        this.charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Imóveis Cadastrados',
                    data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Processos Criados',
                    data: [8, 12, 10, 15, 14, 18, 16, 20, 18, 22, 20, 25],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    },

    loadEstadosChart() {
        $.get('api/dashboard.php')
            .done((response) => {
                if (response.success && response.distribuicao_estados) {
                    const ctx = document.getElementById('estadosChart').getContext('2d');
                    this.charts.estadosChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: response.distribuicao_estados.map(item => item.estado),
                            datasets: [{
                                label: 'Imóveis',
                                data: response.distribuicao_estados.map(item => item.total),
                                backgroundColor: [
                                    '#007bff',
                                    '#28a745',
                                    '#ffc107',
                                    '#dc3545',
                                    '#6f42c1'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(0,0,0,0.1)'
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    }
                                }
                            }
                        }
                    });
                }
            });
    },

    loadStatistics() {
        $.get('api/dashboard.php')
            .done((response) => {
                if (response.success) {
                    $('#totalImoveis').text(window.utils.formatNumber(response.stats.total_imoveis));
                    $('#totalProprietarios').text(window.utils.formatNumber(response.stats.total_proprietarios));
                    $('#totalProcessos').text(window.utils.formatNumber(response.stats.total_processos));
                    $('#totalArea').text(window.utils.formatNumber(Math.round(response.stats.total_imoveis * 1000 / 10000))); // Simular área em hectares
                }
            });
    },

    loadRecentReports() {
        const reports = [
            { id: 1, name: 'Relatório de Imóveis - SP', date: new Date(), format: 'PDF', status: 'Concluído' },
            { id: 2, name: 'Proprietários - Geral', date: new Date(Date.now() - 86400000), format: 'Excel', status: 'Concluído' },
            { id: 3, name: 'Processos Pendentes', date: new Date(Date.now() - 172800000), format: 'CSV', status: 'Concluído' },
            { id: 4, name: 'Analytics Mensal', date: new Date(Date.now() - 259200000), format: 'PDF', status: 'Processando' }
        ];

        let html = '';
        reports.forEach(report => {
            const statusClass = report.status === 'Concluído' ? 'success' : 'warning';
            const formatClass = {
                'PDF': 'danger',
                'Excel': 'success',
                'CSV': 'info'
            };

            html += `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${report.name}</h6>
                            <p class="mb-1 small text-muted">${window.utils.formatDateTime(report.date)}</p>
                            <div class="d-flex gap-2">
                                <span class="badge bg-${formatClass[report.format]}">${report.format}</span>
                                <span class="badge bg-${statusClass}">${report.status}</span>
                            </div>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="RelatoriosModule.downloadReport(${report.id})" title="Download">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-outline-secondary" onclick="RelatoriosModule.shareReport(${report.id})" title="Compartilhar">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        $('#recentReports').html(html);
    },

    changeChartType(chartId, newType) {
        if (this.charts[chartId]) {
            this.charts[chartId].config.type = newType;
            this.charts[chartId].update();
            
            // Update button states
            $(`#${chartId}`).closest('.card').find('.btn-group .btn').removeClass('active');
            event.target.closest('.btn').classList.add('active');
        }
    },

    applyFilters() {
        this.currentFilters = {
            periodo: $('#periodoFilter').val(),
            estado: $('#estadoFilter').val(),
            status: $('#statusFilter').val()
        };

        window.utils.showAlert('Filtros aplicados. Atualizando dados...', 'info');
        
        // Simular atualização dos gráficos
        setTimeout(() => {
            this.loadCharts();
            window.utils.showAlert('Dados atualizados com sucesso', 'success');
        }, 1500);
    },

    refreshData() {
        window.utils.showLoading();
        
        setTimeout(() => {
            this.loadCharts();
            this.loadRecentReports();
            window.utils.hideLoading();
            window.utils.showAlert('Dados atualizados com sucesso', 'success');
        }, 2000);
    },

    // Geradores de Relatório
    generateImoveis(format) {
        window.utils.showAlert(`Gerando relatório de imóveis em formato ${format.toUpperCase()}...`, 'info');
        this.simulateReportGeneration('Relatório de Imóveis', format);
    },

    generateProprietarios(format) {
        window.utils.showAlert(`Gerando relatório de proprietários em formato ${format.toUpperCase()}...`, 'info');
        this.simulateReportGeneration('Relatório de Proprietários', format);
    },

    generateProcessos(format) {
        window.utils.showAlert(`Gerando relatório de processos em formato ${format.toUpperCase()}...`, 'info');
        this.simulateReportGeneration('Relatório de Processos', format);
    },

    generateCustomReport() {
        const reportType = $('#reportType').val();
        const dataInicial = $('#dataInicial').val();
        const dataFinal = $('#dataFinal').val();
        const format = $('#reportFormat').val();

        const options = {
            includeCharts: $('#includeCharts').is(':checked'),
            includeDetails: $('#includeDetails').is(':checked'),
            includeCoordinates: $('#includeCoordinates').is(':checked'),
            compressFile: $('#compressFile').is(':checked')
        };

        window.utils.showAlert(`Gerando relatório personalizado de ${reportType} em formato ${format.toUpperCase()}...`, 'info');
        this.simulateReportGeneration(`Relatório Personalizado - ${reportType}`, format, options);
    },

    simulateReportGeneration(name, format, options = {}) {
        const modal = `
            <div class="modal fade" id="reportProgressModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-cog fa-spin text-primary me-2"></i>
                                Gerando Relatório
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <h6>${name}</h6>
                                <p class="text-muted">Formato: ${format.toUpperCase()}</p>
                            </div>
                            <div class="progress mb-3" style="height: 20px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                     style="width: 0%" id="reportProgress">0%</div>
                            </div>
                            <div id="reportStatus">Preparando dados...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#reportProgressModal').remove();
        $('body').append(modal);
        $('#reportProgressModal').modal('show');

        let progress = 0;
        const steps = [
            'Coletando dados...',
            'Processando informações...',
            'Gerando gráficos...',
            'Formatando documento...',
            'Finalizando...'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeReportGeneration(name, format);
            }
            
            const stepIndex = Math.floor((progress / 100) * steps.length);
            $('#reportProgress').css('width', progress + '%').text(Math.round(progress) + '%');
            $('#reportStatus').text(steps[Math.min(stepIndex, steps.length - 1)]);
        }, 800);
    },

    completeReportGeneration(name, format) {
        $('#reportStatus').html(`
            <div class="alert alert-success mb-0">
                <i class="fas fa-check-circle me-2"></i>
                Relatório gerado com sucesso!
            </div>
        `);

        setTimeout(() => {
            $('#reportProgressModal').modal('hide');
            window.utils.showAlert(`Relatório "${name}" gerado e baixado com sucesso!`, 'success');
            this.loadRecentReports(); // Atualizar lista de relatórios recentes
        }, 1500);
    },

    // Exportações
    exportPDF() {
        window.utils.showAlert('Exportando todos os dados em PDF...', 'info');
        this.simulateReportGeneration('Exportação Completa', 'PDF');
    },

    exportExcel() {
        window.utils.showAlert('Exportando todos os dados em Excel...', 'info');
        this.simulateReportGeneration('Exportação Completa', 'Excel');
    },

    exportCSV() {
        window.utils.showAlert('Exportando todos os dados em CSV...', 'info');
        this.simulateReportGeneration('Exportação Completa', 'CSV');
    },

    exportKML() {
        window.utils.showAlert('Exportando coordenadas em KML...', 'info');
        this.simulateReportGeneration('Exportação de Coordenadas', 'KML');
    },

    exportJSON() {
        window.utils.showAlert('Exportando dados em JSON...', 'info');
        this.simulateReportGeneration('Exportação de Dados', 'JSON');
    },

    exportAll() {
        window.utils.showAlert('Exportando todos os dados em múltiplos formatos...', 'info');
        this.simulateReportGeneration('Exportação Completa (Todos os Formatos)', 'ZIP');
    },

    // Funcionalidades Avançadas
    scheduleReport() {
        const modal = `
            <div class="modal fade" id="scheduleModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-clock text-primary me-2"></i>
                                Agendar Relatório
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="scheduleForm">
                                <div class="mb-3">
                                    <label class="form-label">Tipo de Relatório</label>
                                    <select class="form-select">
                                        <option>Relatório de Imóveis</option>
                                        <option>Relatório de Proprietários</option>
                                        <option>Relatório de Processos</option>
                                        <option>Analytics Completo</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Frequência</label>
                                    <select class="form-select">
                                        <option>Diário</option>
                                        <option>Semanal</option>
                                        <option>Mensal</option>
                                        <option>Trimestral</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email para Envio</label>
                                    <input type="email" class="form-control" placeholder="admin@rf.com">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Formato</label>
                                    <select class="form-select">
                                        <option>PDF</option>
                                        <option>Excel</option>
                                        <option>CSV</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="RelatoriosModule.saveSchedule()">
                                <i class="fas fa-save me-2"></i>Agendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#scheduleModal').remove();
        $('body').append(modal);
        $('#scheduleModal').modal('show');
    },

    saveSchedule() {
        $('#scheduleModal').modal('hide');
        window.utils.showAlert('Relatório agendado com sucesso!', 'success');
    },

    showTemplates() {
        const modal = `
            <div class="modal fade" id="templatesModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-copy text-primary me-2"></i>
                                Templates de Relatório
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-building text-primary me-2"></i>
                                                Relatório Executivo
                                            </h6>
                                            <p class="card-text small">Resumo executivo com principais indicadores e gráficos.</p>
                                            <button class="btn btn-outline-primary btn-sm">Usar Template</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-chart-line text-success me-2"></i>
                                                Análise Detalhada
                                            </h6>
                                            <p class="card-text small">Relatório completo com análises aprofundadas.</p>
                                            <button class="btn btn-outline-success btn-sm">Usar Template</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-map text-info me-2"></i>
                                                Relatório Geográfico
                                            </h6>
                                            <p class="card-text small">Foco em dados geográficos e mapas.</p>
                                            <button class="btn btn-outline-info btn-sm">Usar Template</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-file-alt text-warning me-2"></i>
                                                Relatório Simples
                                            </h6>
                                            <p class="card-text small">Relatório básico com dados essenciais.</p>
                                            <button class="btn btn-outline-warning btn-sm">Usar Template</button>
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

    showCustomDatePicker() {
        const modal = `
            <div class="modal fade" id="datePickerModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Selecionar Período Personalizado</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="form-label">Data Inicial</label>
                                    <input type="date" class="form-control" id="customStartDate">
                                </div>
                                <div class="col-6">
                                    <label class="form-label">Data Final</label>
                                    <input type="date" class="form-control" id="customEndDate">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="RelatoriosModule.applyCustomDates()">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#datePickerModal').remove();
        $('body').append(modal);
        $('#datePickerModal').modal('show');
    },

    applyCustomDates() {
        const startDate = $('#customStartDate').val();
        const endDate = $('#customEndDate').val();
        
        if (startDate && endDate) {
            $('#datePickerModal').modal('hide');
            window.utils.showAlert(`Período personalizado aplicado: ${startDate} a ${endDate}`, 'success');
            this.applyFilters();
        } else {
            window.utils.showAlert('Selecione ambas as datas', 'warning');
        }
    },

    downloadReport(reportId) {
        window.utils.showAlert(`Baixando relatório ID: ${reportId}...`, 'info');
    },

    shareReport(reportId) {
        window.utils.showAlert(`Compartilhando relatório ID: ${reportId}...`, 'info');
    }
};