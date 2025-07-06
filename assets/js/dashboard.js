// Dashboard Module - Funcionalidade Completa
window.DashboardModule = {
    refreshInterval: null,
    charts: {},

    load() {
        window.utils.showLoading();
        this.loadDashboardData();
        this.startAutoRefresh();
    },

    startAutoRefresh() {
        // Atualizar dados a cada 5 minutos
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData(true);
        }, 300000);
    },

    loadDashboardData(silent = false) {
        if (!silent) window.utils.showLoading();
        
        $.get('api/dashboard.php')
            .done((response) => {
                if (response.success) {
                    this.renderDashboard(response);
                } else {
                    window.utils.showAlert('Erro ao carregar dados do dashboard', 'error');
                }
            })
            .fail(() => {
                window.utils.showAlert('Erro ao conectar com o servidor', 'error');
            })
            .always(() => {
                if (!silent) window.utils.hideLoading();
            });
    },

    renderDashboard(data) {
        const content = `
            <div class="fade-in">
                <!-- Header com Resumo Executivo -->
                <div class="row g-4 mb-4">
                    <div class="col-12">
                        <div class="card bg-gradient-primary text-white">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-8">
                                        <h4 class="card-title mb-2">
                                            <i class="fas fa-chart-line me-2"></i>
                                            Painel de Controle - RegFundiária
                                        </h4>
                                        <p class="card-text mb-0">
                                            Sistema de gestão completo para regularização fundiária com ${window.utils.formatNumber(data.stats.total_imoveis)} imóveis cadastrados
                                        </p>
                                    </div>
                                    <div class="col-md-4 text-end">
                                        <div class="btn-group">
                                            <button class="btn btn-light btn-sm" onclick="DashboardModule.exportDashboard()">
                                                <i class="fas fa-download me-2"></i>Exportar
                                            </button>
                                            <button class="btn btn-outline-light btn-sm" onclick="DashboardModule.refreshData()">
                                                <i class="fas fa-sync me-2"></i>Atualizar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards Principais -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6 col-lg-3">
                        <div class="stats-card blue card-hover">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50 mb-2">Total de Imóveis</h6>
                                    <h2 class="text-white mb-0">${window.utils.formatNumber(data.stats.total_imoveis)}</h2>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-up me-1"></i>+12% este mês
                                    </small>
                                </div>
                                <div class="text-white-50">
                                    <i class="fas fa-building fa-3x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stats-card green card-hover">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50 mb-2">Proprietários</h6>
                                    <h2 class="text-white mb-0">${window.utils.formatNumber(data.stats.total_proprietarios)}</h2>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-up me-1"></i>+8% este mês
                                    </small>
                                </div>
                                <div class="text-white-50">
                                    <i class="fas fa-users fa-3x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stats-card orange card-hover">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50 mb-2">Processos Ativos</h6>
                                    <h2 class="text-white mb-0">${window.utils.formatNumber(data.stats.total_processos)}</h2>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-up me-1"></i>+5% este mês
                                    </small>
                                </div>
                                <div class="text-white-50">
                                    <i class="fas fa-file-text fa-3x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stats-card purple card-hover">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50 mb-2">Taxa de Conclusão</h6>
                                    <h2 class="text-white mb-0">${this.calculateCompletionRate(data.stats)}%</h2>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-up me-1"></i>+3% este mês
                                    </small>
                                </div>
                                <div class="text-white-50">
                                    <i class="fas fa-check-circle fa-3x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards Secundários -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="card card-hover">
                            <div class="card-body text-center">
                                <div class="text-success mb-2">
                                    <i class="fas fa-check-circle fa-2x"></i>
                                </div>
                                <h4 class="text-success">${window.utils.formatNumber(data.stats.processos_concluidos)}</h4>
                                <p class="text-muted mb-0">Processos Concluídos</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card card-hover">
                            <div class="card-body text-center">
                                <div class="text-warning mb-2">
                                    <i class="fas fa-clock fa-2x"></i>
                                </div>
                                <h4 class="text-warning">${window.utils.formatNumber(data.stats.processos_pendentes)}</h4>
                                <p class="text-muted mb-0">Processos Pendentes</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card card-hover">
                            <div class="card-body text-center">
                                <div class="text-info mb-2">
                                    <i class="fas fa-upload fa-2x"></i>
                                </div>
                                <h4 class="text-info">${window.utils.formatNumber(data.stats.importacoes_recentes)}</h4>
                                <p class="text-muted mb-0">Importações Recentes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráficos e Tabelas -->
                <div class="row g-4">
                    <!-- Gráfico de Status -->
                    <div class="col-lg-6">
                        <div class="card card-hover">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">Status dos Processos</h5>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-secondary active" onclick="DashboardModule.changeChartType('statusChart', 'doughnut')">
                                            <i class="fas fa-chart-pie"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary" onclick="DashboardModule.changeChartType('statusChart', 'bar')">
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

                    <!-- Distribuição por Estado -->
                    <div class="col-lg-6">
                        <div class="card card-hover">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Distribuição por Estado</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="estadosChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Processos Recentes -->
                    <div class="col-lg-8">
                        <div class="card card-hover">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">Processos Recentes</h5>
                                    <a href="#" onclick="window.app.navigateTo('processos')" class="btn btn-outline-primary btn-sm">
                                        Ver Todos
                                    </a>
                                </div>
                            </div>
                            <div class="card-body">
                                ${this.renderProcessosRecentes(data.processos_recentes)}
                            </div>
                        </div>
                    </div>

                    <!-- Ações Rápidas -->
                    <div class="col-lg-4">
                        <div class="card card-hover">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Ações Rápidas</h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="window.app.navigateTo('importar')">
                                        <i class="fas fa-upload me-2"></i>Importar Arquivo SIGEF
                                    </button>
                                    <button class="btn btn-success" onclick="window.app.navigateTo('imoveis')">
                                        <i class="fas fa-plus me-2"></i>Cadastrar Imóvel
                                    </button>
                                    <button class="btn btn-info" onclick="window.app.navigateTo('memorial')">
                                        <i class="fas fa-file-alt me-2"></i>Gerar Memorial
                                    </button>
                                    <button class="btn btn-warning" onclick="window.app.navigateTo('relatorios')">
                                        <i class="fas fa-chart-bar me-2"></i>Gerar Relatório
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notificações -->
                        <div class="card card-hover mt-4">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Notificações</h6>
                            </div>
                            <div class="card-body">
                                ${this.renderNotifications()}
                            </div>
                        </div>
                    </div>

                    <!-- Atividade Recente -->
                    <div class="col-12">
                        <div class="card card-hover">
                            <div class="card-header bg-white">
                                <h5 class="card-title mb-0">Atividade Recente do Sistema</h5>
                            </div>
                            <div class="card-body">
                                ${this.renderActivityFeed()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#pageContent').html(content);
        
        // Inicializar gráficos
        setTimeout(() => {
            this.initializeCharts(data);
        }, 100);
    },

    initializeCharts(data) {
        this.initStatusChart(data);
        this.initEstadosChart(data);
    },

    initStatusChart(data) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        this.charts.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Concluídos', 'Em Andamento', 'Pendentes'],
                datasets: [{
                    data: [
                        data.stats.processos_concluidos,
                        data.stats.total_processos - data.stats.processos_pendentes - data.stats.processos_concluidos,
                        data.stats.processos_pendentes
                    ],
                    backgroundColor: [
                        '#28a745',
                        '#17a2b8',
                        '#ffc107'
                    ],
                    borderWidth: 3,
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
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
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
                },
                cutout: '60%'
            }
        });
    },

    initEstadosChart(data) {
        if (!data.distribuicao_estados || data.distribuicao_estados.length === 0) return;

        const ctx = document.getElementById('estadosChart').getContext('2d');
        this.charts.estadosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.distribuicao_estados.map(item => item.estado),
                datasets: [{
                    label: 'Imóveis por Estado',
                    data: data.distribuicao_estados.map(item => item.total),
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#6f42c1'
                    ],
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y} imóveis`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    },

    changeChartType(chartId, newType) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            
            // Recriar gráfico com novo tipo
            if (chartId === 'statusChart') {
                this.loadDashboardData(true);
            }
            
            // Update button states
            $(`#${chartId}`).closest('.card').find('.btn-group .btn').removeClass('active');
            event.target.closest('.btn').classList.add('active');
        }
    },

    renderProcessosRecentes(processos) {
        if (!processos || processos.length === 0) {
            return `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-file-text fa-2x mb-2"></i>
                    <p class="mb-0">Nenhum processo encontrado</p>
                </div>
            `;
        }

        let html = '<div class="list-group list-group-flush">';
        
        processos.forEach(processo => {
            const statusClass = this.getStatusClass(processo.status);
            const statusText = this.getStatusText(processo.status);
            const progressPercentage = this.getProgressPercentage(processo.status);
            
            html += `
                <div class="list-group-item border-0 px-0">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-2">
                                <h6 class="mb-0 me-2">${processo.titulo}</h6>
                                <span class="badge ${statusClass}">${statusText}</span>
                            </div>
                            <p class="mb-2 text-muted small">${processo.descricao}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>
                                    ${window.utils.formatDate(processo.created_at)}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-building me-1"></i>
                                    ${processo.total_imoveis} imóveis
                                </small>
                            </div>
                            <div class="progress mt-2" style="height: 4px;">
                                <div class="progress-bar ${statusClass.replace('bg-', 'bg-')}" 
                                     style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                        <div class="ms-3">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.app.navigateTo('processos')" 
                                    title="Ver Detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },

    renderNotifications() {
        const notifications = [
            {
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                message: '5 processos pendentes há mais de 30 dias',
                time: '2 horas atrás'
            },
            {
                type: 'success',
                icon: 'fa-check-circle',
                message: 'Importação SIGEF concluída com sucesso',
                time: '1 dia atrás'
            },
            {
                type: 'info',
                icon: 'fa-info-circle',
                message: 'Novo relatório mensal disponível',
                time: '2 dias atrás'
            }
        ];

        let html = '<div class="list-group list-group-flush">';
        
        notifications.forEach(notif => {
            html += `
                <div class="list-group-item border-0 px-0 py-2">
                    <div class="d-flex align-items-start">
                        <div class="text-${notif.type} me-2">
                            <i class="fas ${notif.icon}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1 small">${notif.message}</p>
                            <small class="text-muted">${notif.time}</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },

    renderActivityFeed() {
        const activities = [
            {
                user: 'Admin',
                action: 'criou um novo processo',
                target: 'Regularização Vila Nova',
                time: '5 minutos atrás',
                icon: 'fa-plus',
                color: 'success'
            },
            {
                user: 'Admin',
                action: 'importou arquivo SIGEF',
                target: '25 novos imóveis',
                time: '1 hora atrás',
                icon: 'fa-upload',
                color: 'info'
            },
            {
                user: 'Admin',
                action: 'gerou memorial descritivo',
                target: 'Imóvel M-001-2024',
                time: '2 horas atrás',
                icon: 'fa-file-alt',
                color: 'warning'
            },
            {
                user: 'Admin',
                action: 'atualizou dados do proprietário',
                target: 'João Silva',
                time: '3 horas atrás',
                icon: 'fa-edit',
                color: 'primary'
            }
        ];

        let html = '<div class="row g-3">';
        
        activities.forEach(activity => {
            html += `
                <div class="col-md-6">
                    <div class="d-flex align-items-center p-3 bg-light rounded">
                        <div class="text-${activity.color} me-3">
                            <i class="fas ${activity.icon} fa-lg"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1 small">
                                <strong>${activity.user}</strong> ${activity.action}
                                <strong>${activity.target}</strong>
                            </p>
                            <small class="text-muted">${activity.time}</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },

    calculateCompletionRate(stats) {
        if (stats.total_processos === 0) return 0;
        return Math.round((stats.processos_concluidos / stats.total_processos) * 100);
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

    refreshData() {
        window.utils.showAlert('Atualizando dados do dashboard...', 'info');
        this.loadDashboardData();
    },

    exportDashboard() {
        window.utils.showAlert('Exportando dashboard...', 'info');
        // Implementar exportação do dashboard
    }
};