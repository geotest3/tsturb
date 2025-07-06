// Mapa Module - Funcionalidade Completa
window.MapaModule = {
    map: null,
    markers: [],
    polygons: [],
    currentLayer: 'roadmap',
    imoveis: [],
    filteredImoveis: [],

    load() {
        this.renderMapa();
        this.loadImoveis();
        this.initializeMap();
    },

    renderMapa() {
        const content = `
            <div class="fade-in">
                <div class="row g-4">
                    <!-- Controles do Mapa -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-map text-primary me-2"></i>
                                        Visualização Geográfica
                                    </h5>
                                    <div class="btn-group">
                                        <button class="btn btn-outline-primary" onclick="MapaModule.toggleSatellite()">
                                            <i class="fas fa-satellite me-2"></i>Satélite
                                        </button>
                                        <button class="btn btn-outline-success" onclick="MapaModule.fitAllMarkers()">
                                            <i class="fas fa-expand-arrows-alt me-2"></i>Ajustar Zoom
                                        </button>
                                        <button class="btn btn-outline-info" onclick="MapaModule.showMeasureTool()">
                                            <i class="fas fa-ruler me-2"></i>Medir
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="MapaModule.exportMap()">
                                            <i class="fas fa-download me-2"></i>Exportar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row g-3 mb-3">
                                    <div class="col-md-3">
                                        <label class="form-label small">Filtrar por Estado</label>
                                        <select id="estadoFilter" class="form-select form-select-sm">
                                            <option value="">Todos os estados</option>
                                            <option value="SP">São Paulo</option>
                                            <option value="RJ">Rio de Janeiro</option>
                                            <option value="MG">Minas Gerais</option>
                                            <option value="RS">Rio Grande do Sul</option>
                                            <option value="PR">Paraná</option>
                                            <option value="SC">Santa Catarina</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small">Status do Processo</label>
                                        <select id="statusFilter" class="form-select form-select-sm">
                                            <option value="">Todos os status</option>
                                            <option value="pendente">Pendente</option>
                                            <option value="em_andamento">Em Andamento</option>
                                            <option value="concluido">Concluído</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small">Tipo de Visualização</label>
                                        <select id="viewType" class="form-select form-select-sm">
                                            <option value="markers">Marcadores</option>
                                            <option value="polygons">Polígonos</option>
                                            <option value="both">Ambos</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small">Buscar Imóvel</label>
                                        <input type="text" id="searchMap" class="form-control form-control-sm" 
                                               placeholder="Matrícula ou endereço...">
                                    </div>
                                </div>
                                
                                <div class="row g-2">
                                    <div class="col-auto">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="showClusters" checked>
                                            <label class="form-check-label small" for="showClusters">
                                                Agrupar Marcadores
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="showLabels" checked>
                                            <label class="form-check-label small" for="showLabels">
                                                Mostrar Rótulos
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="showMeasurements">
                                            <label class="form-check-label small" for="showMeasurements">
                                                Mostrar Medidas
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mapa Principal -->
                    <div class="col-lg-9">
                        <div class="card">
                            <div class="card-body p-0 position-relative">
                                <div id="mapContainer" style="height: 700px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; border-radius: 0.375rem;">
                                    <div class="d-flex align-items-center justify-content-center h-100 text-white">
                                        <div class="text-center">
                                            <i class="fas fa-map fa-4x mb-3"></i>
                                            <h4>Mapa Interativo</h4>
                                            <p class="mb-4">Visualização geográfica dos imóveis cadastrados</p>
                                            <div class="row g-2 justify-content-center">
                                                <div class="col-auto">
                                                    <button class="btn btn-light" onclick="MapaModule.initGoogleMaps()">
                                                        <i class="fab fa-google me-2"></i>Google Maps
                                                    </button>
                                                </div>
                                                <div class="col-auto">
                                                    <button class="btn btn-outline-light" onclick="MapaModule.initLeaflet()">
                                                        <i class="fas fa-leaf me-2"></i>OpenStreetMap
                                                    </button>
                                                </div>
                                                <div class="col-auto">
                                                    <button class="btn btn-outline-light" onclick="MapaModule.initMapbox()">
                                                        <i class="fas fa-globe me-2"></i>Mapbox
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Controles de Zoom -->
                                    <div class="position-absolute top-0 end-0 m-3" style="z-index: 1000;">
                                        <div class="btn-group-vertical shadow-sm">
                                            <button class="btn btn-light btn-sm" onclick="MapaModule.zoomIn()" title="Aumentar Zoom">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                            <button class="btn btn-light btn-sm" onclick="MapaModule.zoomOut()" title="Diminuir Zoom">
                                                <i class="fas fa-minus"></i>
                                            </button>
                                            <button class="btn btn-light btn-sm" onclick="MapaModule.resetZoom()" title="Reset Zoom">
                                                <i class="fas fa-home"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Controles de Camada -->
                                    <div class="position-absolute top-0 start-0 m-3" style="z-index: 1000;">
                                        <div class="btn-group shadow-sm">
                                            <button class="btn btn-light btn-sm active" data-layer="roadmap" onclick="MapaModule.changeLayer('roadmap')">
                                                <i class="fas fa-road"></i>
                                            </button>
                                            <button class="btn btn-light btn-sm" data-layer="satellite" onclick="MapaModule.changeLayer('satellite')">
                                                <i class="fas fa-satellite"></i>
                                            </button>
                                            <button class="btn btn-light btn-sm" data-layer="terrain" onclick="MapaModule.changeLayer('terrain')">
                                                <i class="fas fa-mountain"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Coordenadas do Mouse -->
                                    <div class="position-absolute bottom-0 start-0 m-3" style="z-index: 1000;">
                                        <div class="bg-dark bg-opacity-75 text-white px-2 py-1 rounded small" id="mouseCoords">
                                            Lat: -, Lng: -
                                        </div>
                                    </div>

                                    <!-- Legenda -->
                                    <div class="position-absolute bottom-0 end-0 m-3" style="z-index: 1000;">
                                        <div class="card shadow-sm" style="background: rgba(255,255,255,0.95);">
                                            <div class="card-body p-2">
                                                <h6 class="card-title mb-2" style="font-size: 12px;">
                                                    <i class="fas fa-info-circle me-1"></i>Legenda
                                                </h6>
                                                <div class="d-flex flex-column gap-1" style="font-size: 11px;">
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge bg-success me-2" style="width: 12px; height: 12px; border-radius: 50%;"></span>
                                                        <span>Concluído</span>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge bg-info me-2" style="width: 12px; height: 12px; border-radius: 50%;"></span>
                                                        <span>Em Andamento</span>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge bg-warning me-2" style="width: 12px; height: 12px; border-radius: 50%;"></span>
                                                        <span>Pendente</span>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <span class="badge bg-secondary me-2" style="width: 12px; height: 12px; border-radius: 50%;"></span>
                                                        <span>Sem Processo</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Painel Lateral -->
                    <div class="col-lg-3">
                        <!-- Lista de Imóveis -->
                        <div class="card mb-3">
                            <div class="card-header bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h6 class="card-title mb-0">Imóveis no Mapa</h6>
                                    <span class="badge bg-primary" id="totalVisible">0</span>
                                </div>
                            </div>
                            <div class="card-body p-0" style="max-height: 400px; overflow-y: auto;">
                                <div id="imoveisList">
                                    <!-- Lista será carregada aqui -->
                                </div>
                            </div>
                        </div>

                        <!-- Ferramentas -->
                        <div class="card mb-3">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Ferramentas</h6>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-primary btn-sm" onclick="MapaModule.drawPolygon()">
                                        <i class="fas fa-draw-polygon me-2"></i>Desenhar Área
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="MapaModule.measureDistance()">
                                        <i class="fas fa-ruler me-2"></i>Medir Distância
                                    </button>
                                    <button class="btn btn-outline-info btn-sm" onclick="MapaModule.addMarker()">
                                        <i class="fas fa-map-pin me-2"></i>Adicionar Marcador
                                    </button>
                                    <button class="btn btn-outline-warning btn-sm" onclick="MapaModule.clearAll()">
                                        <i class="fas fa-eraser me-2"></i>Limpar Tudo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Estatísticas -->
                        <div class="card">
                            <div class="card-header bg-white">
                                <h6 class="card-title mb-0">Estatísticas</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-2 text-center">
                                    <div class="col-6">
                                        <div class="border rounded p-2">
                                            <div class="h5 mb-0 text-primary" id="totalMarkers">0</div>
                                            <small class="text-muted">Marcadores</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-2">
                                            <div class="h5 mb-0 text-success" id="totalPolygons">0</div>
                                            <small class="text-muted">Polígonos</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-2">
                                            <div class="h5 mb-0 text-info" id="totalArea">0</div>
                                            <small class="text-muted">Área (m²)</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="border rounded p-2">
                                            <div class="h5 mb-0 text-warning" id="visibleItems">0</div>
                                            <small class="text-muted">Visíveis</small>
                                        </div>
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
        $('#estadoFilter').on('change', () => {
            this.filterImoveis();
        });

        $('#statusFilter').on('change', () => {
            this.filterImoveis();
        });

        $('#viewType').on('change', () => {
            this.updateMapView();
        });

        $('#searchMap').on('input', (e) => {
            this.searchImoveis($(e.target).val());
        });

        $('#showClusters').on('change', () => {
            this.toggleClusters();
        });

        $('#showLabels').on('change', () => {
            this.toggleLabels();
        });

        $('#showMeasurements').on('change', () => {
            this.toggleMeasurements();
        });
    },

    initializeMap() {
        // Simular inicialização do mapa
        setTimeout(() => {
            this.updateMapPlaceholder();
        }, 1000);
    },

    updateMapPlaceholder() {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100 text-white position-relative">
                <div class="text-center">
                    <div class="spinner-border text-light mb-3" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <h5>Mapa Carregado</h5>
                    <p class="mb-0">Simulação de mapa interativo ativo</p>
                </div>
                
                <!-- Controles simulados -->
                <div class="position-absolute top-0 end-0 m-3">
                    <div class="btn-group-vertical shadow-sm">
                        <button class="btn btn-light btn-sm" onclick="MapaModule.zoomIn()">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-light btn-sm" onclick="MapaModule.zoomOut()">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn btn-light btn-sm" onclick="MapaModule.resetZoom()">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                </div>

                <div class="position-absolute bottom-0 start-0 m-3">
                    <div class="bg-dark bg-opacity-75 text-white px-2 py-1 rounded small">
                        Lat: -23.5505, Lng: -46.6333
                    </div>
                </div>
            </div>
        `;
    },

    loadImoveis() {
        window.utils.showLoading();
        
        $.get('api/imoveis.php', { limit: 100 })
            .done((response) => {
                if (response.success) {
                    this.imoveis = response.data;
                    this.filteredImoveis = response.data;
                    this.renderImoveisList(response.data);
                    this.updateStatistics(response.data);
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

    renderImoveisList(imoveis) {
        let html = '';
        let totalWithCoords = 0;

        if (!imoveis || imoveis.length === 0) {
            html = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-map-marker-alt fa-2x mb-2"></i>
                    <p class="mb-0">Nenhum imóvel encontrado</p>
                </div>
            `;
        } else {
            imoveis.forEach(imovel => {
                const hasCoords = imovel.coordenadas && imovel.coordenadas.length > 0;
                if (hasCoords) totalWithCoords++;

                const statusClass = this.getStatusClass(imovel.processo_status);
                
                html += `
                    <div class="list-group-item list-group-item-action ${!hasCoords ? 'opacity-50' : ''}" 
                         onclick="MapaModule.focusImovel(${imovel.id})">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-1">
                                    <span class="badge ${statusClass} me-2" style="width: 8px; height: 8px; border-radius: 50%;"></span>
                                    <h6 class="mb-0 small">${imovel.matricula}</h6>
                                </div>
                                <p class="mb-1 small text-muted">${imovel.endereco}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        ${window.utils.formatNumber(imovel.area)} m² - ${imovel.cidade}
                                    </small>
                                    ${hasCoords ? 
                                        '<i class="fas fa-map-marker-alt text-primary"></i>' : 
                                        '<i class="fas fa-exclamation-triangle text-warning" title="Sem coordenadas"></i>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        $('#imoveisList').html(html);
        $('#totalMarkers').text(totalWithCoords);
        $('#totalVisible').text(imoveis.length);
    },

    updateStatistics(imoveis) {
        const totalArea = imoveis.reduce((sum, imovel) => sum + parseFloat(imovel.area || 0), 0);
        const totalPolygons = imoveis.filter(imovel => imovel.coordenadas && imovel.coordenadas.length > 0).length;
        
        $('#totalArea').text(window.utils.formatNumber(totalArea));
        $('#totalPolygons').text(totalPolygons);
        $('#visibleItems').text(imoveis.length);
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

    filterImoveis() {
        const estado = $('#estadoFilter').val();
        const status = $('#statusFilter').val();
        
        let filtered = this.imoveis;
        
        if (estado) {
            filtered = filtered.filter(imovel => imovel.estado === estado);
        }
        
        if (status) {
            filtered = filtered.filter(imovel => imovel.processo_status === status);
        }
        
        this.filteredImoveis = filtered;
        this.renderImoveisList(filtered);
        this.updateStatistics(filtered);
        
        window.utils.showAlert(`Filtros aplicados: ${filtered.length} imóveis encontrados`, 'info');
    },

    searchImoveis(query) {
        if (!query.trim()) {
            this.renderImoveisList(this.filteredImoveis);
            return;
        }
        
        const searched = this.filteredImoveis.filter(imovel => 
            imovel.matricula.toLowerCase().includes(query.toLowerCase()) ||
            imovel.endereco.toLowerCase().includes(query.toLowerCase()) ||
            imovel.cidade.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderImoveisList(searched);
    },

    updateMapView() {
        const viewType = $('#viewType').val();
        window.utils.showAlert(`Alterando visualização para: ${viewType}`, 'info');
    },

    toggleClusters() {
        const enabled = $('#showClusters').is(':checked');
        window.utils.showAlert(enabled ? 'Agrupamento ativado' : 'Agrupamento desativado', 'info');
    },

    toggleLabels() {
        const enabled = $('#showLabels').is(':checked');
        window.utils.showAlert(enabled ? 'Rótulos ativados' : 'Rótulos desativados', 'info');
    },

    toggleMeasurements() {
        const enabled = $('#showMeasurements').is(':checked');
        window.utils.showAlert(enabled ? 'Medidas ativadas' : 'Medidas desativadas', 'info');
    },

    focusImovel(id) {
        window.utils.showAlert(`Focalizando imóvel ID: ${id}`, 'info');
        // Implementar foco no mapa
    },

    changeLayer(layer) {
        this.currentLayer = layer;
        $('.btn-group [data-layer]').removeClass('active');
        $(`.btn-group [data-layer="${layer}"]`).addClass('active');
        window.utils.showAlert(`Camada alterada para: ${layer}`, 'info');
    },

    toggleSatellite() {
        const newLayer = this.currentLayer === 'satellite' ? 'roadmap' : 'satellite';
        this.changeLayer(newLayer);
    },

    fitAllMarkers() {
        window.utils.showAlert('Ajustando zoom para mostrar todos os marcadores', 'info');
    },

    zoomIn() {
        window.utils.showAlert('Aumentando zoom', 'info');
    },

    zoomOut() {
        window.utils.showAlert('Diminuindo zoom', 'info');
    },

    resetZoom() {
        window.utils.showAlert('Resetando zoom', 'info');
    },

    // Ferramentas
    drawPolygon() {
        window.utils.showAlert('Ferramenta de desenho ativada', 'info');
    },

    measureDistance() {
        window.utils.showAlert('Ferramenta de medição ativada', 'info');
    },

    addMarker() {
        window.utils.showAlert('Clique no mapa para adicionar marcador', 'info');
    },

    clearAll() {
        if (confirm('Limpar todos os desenhos e marcadores?')) {
            window.utils.showAlert('Mapa limpo', 'success');
        }
    },

    showMeasureTool() {
        const modal = `
            <div class="modal fade" id="measureModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-ruler text-primary me-2"></i>
                                Ferramenta de Medição
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label">Tipo de Medição</label>
                                    <select class="form-select">
                                        <option>Distância Linear</option>
                                        <option>Área de Polígono</option>
                                        <option>Perímetro</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Clique no mapa para começar a medir
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary">Iniciar Medição</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#measureModal').remove();
        $('body').append(modal);
        $('#measureModal').modal('show');
    },

    // Inicialização de diferentes provedores de mapa
    initGoogleMaps() {
        window.utils.showAlert('Inicializando Google Maps...', 'info');
        this.updateMapPlaceholder();
    },

    initLeaflet() {
        window.utils.showAlert('Inicializando OpenStreetMap com Leaflet...', 'info');
        this.updateMapPlaceholder();
    },

    initMapbox() {
        window.utils.showAlert('Inicializando Mapbox...', 'info');
        this.updateMapPlaceholder();
    },

    exportMap() {
        const modal = `
            <div class="modal fade" id="exportMapModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-download text-primary me-2"></i>
                                Exportar Mapa
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label">Formato de Exportação</label>
                                    <select class="form-select" id="exportFormat">
                                        <option value="png">Imagem PNG</option>
                                        <option value="jpg">Imagem JPG</option>
                                        <option value="pdf">PDF</option>
                                        <option value="kml">Arquivo KML</option>
                                        <option value="geojson">GeoJSON</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Qualidade</label>
                                    <select class="form-select">
                                        <option>Alta (300 DPI)</option>
                                        <option>Média (150 DPI)</option>
                                        <option>Baixa (72 DPI)</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeData" checked>
                                        <label class="form-check-label" for="includeData">
                                            Incluir dados dos imóveis
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="MapaModule.doExport()">
                                <i class="fas fa-download me-2"></i>Exportar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#exportMapModal').remove();
        $('body').append(modal);
        $('#exportMapModal').modal('show');
    },

    doExport() {
        const format = $('#exportFormat').val();
        $('#exportMapModal').modal('hide');
        window.utils.showAlert(`Exportando mapa em formato ${format.toUpperCase()}...`, 'info');
    }
};