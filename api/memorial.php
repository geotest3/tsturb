<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        if (isset($_GET['imovel_id'])) {
            getMemorial($db, $_GET['imovel_id']);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'gerar' && isset($_GET['imovel_id'])) {
            gerarMemorial($db, $_GET['imovel_id'], $_GET['template'] ?? 'padrao');
        }
        break;
    case 'POST':
        createMemorial($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateMemorial($db, $_GET['id'], $input);
        }
        break;
}

function getMemorial($db, $imovelId) {
    try {
        $query = "SELECT * FROM memoriais WHERE imovel_id = :imovel_id ORDER BY created_at DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':imovel_id', $imovelId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $memorial = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $memorial]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Memorial não encontrado']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar memorial: ' . $e->getMessage()]);
    }
}

function gerarMemorial($db, $imovelId, $template = 'padrao') {
    try {
        // Buscar dados do imóvel
        $query = "SELECT i.*, p.nome as proprietario_nome, p.documento as proprietario_documento, 
                         p.endereco as proprietario_endereco, pr.titulo as processo_titulo
                  FROM imoveis i
                  LEFT JOIN proprietarios p ON i.proprietario_id = p.id
                  LEFT JOIN processos pr ON i.processo_id = pr.id
                  WHERE i.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $imovelId);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Imóvel não encontrado']);
            return;
        }
        
        $imovel = $stmt->fetch(PDO::FETCH_ASSOC);
        $coordenadas = json_decode($imovel['coordenadas'], true);
        
        // Gerar conteúdo do memorial baseado no template
        $conteudo = gerarConteudoMemorial($imovel, $coordenadas, $template);
        
        echo json_encode(['success' => true, 'conteudo' => $conteudo]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao gerar memorial: ' . $e->getMessage()]);
    }
}

function createMemorial($db, $data) {
    try {
        $query = "INSERT INTO memoriais (imovel_id, conteudo) VALUES (:imovel_id, :conteudo)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':imovel_id', $data['imovel_id']);
        $stmt->bindParam(':conteudo', $data['conteudo']);
        
        if ($stmt->execute()) {
            $id = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Memorial criado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar memorial']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar memorial: ' . $e->getMessage()]);
    }
}

function updateMemorial($db, $id, $data) {
    try {
        $query = "UPDATE memoriais SET conteudo = :conteudo, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':conteudo', $data['conteudo']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Memorial atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar memorial']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar memorial: ' . $e->getMessage()]);
    }
}

function gerarConteudoMemorial($imovel, $coordenadas, $template) {
    switch($template) {
        case 'urbano':
            return gerarMemorialUrbano($imovel, $coordenadas);
        case 'rural':
            return gerarMemorialRural($imovel, $coordenadas);
        case 'loteamento':
            return gerarMemorialLoteamento($imovel, $coordenadas);
        default:
            return gerarMemorialPadrao($imovel, $coordenadas);
    }
}

function gerarMemorialPadrao($imovel, $coordenadas) {
    $conteudo = "MEMORIAL DESCRITIVO\n";
    $conteudo .= "PADRÃO INCRA\n\n";
    
    $conteudo .= "IDENTIFICAÇÃO DO IMÓVEL:\n";
    $conteudo .= "Matrícula: {$imovel['matricula']}\n";
    $conteudo .= "Localização: {$imovel['endereco']}, {$imovel['cidade']}/{$imovel['estado']}\n";
    $conteudo .= "Área Total: " . number_format($imovel['area'], 2, ',', '.') . " m²\n";
    $conteudo .= "Perímetro: " . number_format($imovel['perimetro'], 2, ',', '.') . " m\n\n";
    
    if (!empty($imovel['processo_titulo'])) {
        $conteudo .= "PROCESSO: {$imovel['processo_titulo']}\n\n";
    }
    
    $conteudo .= "DESCRIÇÃO PERIMETRAL:\n\n";
    
    if (!empty($coordenadas)) {
        for ($i = 0; $i < count($coordenadas); $i++) {
            $pontoAtual = $coordenadas[$i];
            $proximoPonto = $coordenadas[($i + 1) % count($coordenadas)];
            
            $distancia = calcularDistancia(
                $pontoAtual['latitude'], $pontoAtual['longitude'],
                $proximoPonto['latitude'], $proximoPonto['longitude']
            );
            
            if ($i === 0) {
                $conteudo .= "Inicia-se a descrição deste perímetro no vértice {$pontoAtual['point']}, ";
                $conteudo .= "de coordenadas geográficas Latitude {$pontoAtual['latitude']}° e ";
                $conteudo .= "Longitude {$pontoAtual['longitude']}°; deste, segue em linha reta ";
                $conteudo .= "até o vértice {$proximoPonto['point']}, de coordenadas geográficas ";
                $conteudo .= "Latitude {$proximoPonto['latitude']}° e Longitude {$proximoPonto['longitude']}°, ";
                $conteudo .= "percorrendo a distância de " . number_format($distancia, 2, ',', '.') . " metros;\n\n";
            } elseif ($i === count($coordenadas) - 1) {
                $conteudo .= "Do vértice {$pontoAtual['point']}, retorna ao vértice {$proximoPonto['point']}, ";
                $conteudo .= "percorrendo a distância de " . number_format($distancia, 2, ',', '.') . " metros, ";
                $conteudo .= "fechando assim o perímetro descrito e encerrando uma área de ";
                $conteudo .= number_format($imovel['area'], 2, ',', '.') . " metros quadrados.\n\n";
            } else {
                $conteudo .= "Do vértice {$pontoAtual['point']}, segue em linha reta até o vértice ";
                $conteudo .= "{$proximoPonto['point']}, de coordenadas geográficas ";
                $conteudo .= "Latitude {$proximoPonto['latitude']}° e Longitude {$proximoPonto['longitude']}°, ";
                $conteudo .= "percorrendo a distância de " . number_format($distancia, 2, ',', '.') . " metros;\n\n";
            }
        }
    }
    
    $conteudo .= "CONFRONTAÇÕES:\n";
    $conteudo .= "Norte: [a definir conforme levantamento]\n";
    $conteudo .= "Sul: [a definir conforme levantamento]\n";
    $conteudo .= "Leste: [a definir conforme levantamento]\n";
    $conteudo .= "Oeste: [a definir conforme levantamento]\n\n";
    
    if (!empty($imovel['proprietario_nome'])) {
        $conteudo .= "PROPRIETÁRIO:\n";
        $conteudo .= "Nome: {$imovel['proprietario_nome']}\n";
        $conteudo .= "CPF/CNPJ: {$imovel['proprietario_documento']}\n";
        if (!empty($imovel['proprietario_endereco'])) {
            $conteudo .= "Endereço: {$imovel['proprietario_endereco']}\n";
        }
        $conteudo .= "\n";
    }
    
    $conteudo .= "OBSERVAÇÕES:\n";
    $conteudo .= "Este memorial descritivo foi elaborado de acordo com as normas técnicas ";
    $conteudo .= "vigentes do INCRA e baseado nos dados fornecidos pelo Sistema de Gestão ";
    $conteudo .= "Fundiária (SIGEF).\n\n";
    
    $conteudo .= "As coordenadas estão referenciadas ao Sistema Geodésico Brasileiro (SIRGAS2000).\n\n";
    
    $conteudo .= "Data de elaboração: " . date('d/m/Y') . "\n";
    $conteudo .= "Responsável técnico: [a definir]\n";
    $conteudo .= "CREA/CAU: [a definir]\n";
    
    return $conteudo;
}

function gerarMemorialUrbano($imovel, $coordenadas) {
    $conteudo = "MEMORIAL DESCRITIVO - IMÓVEL URBANO\n\n";
    
    $conteudo .= "DADOS DO IMÓVEL:\n";
    $conteudo .= "Matrícula: {$imovel['matricula']}\n";
    $conteudo .= "Endereço: {$imovel['endereco']}\n";
    $conteudo .= "Município: {$imovel['cidade']}\n";
    $conteudo .= "Estado: {$imovel['estado']}\n";
    $conteudo .= "Área do Terreno: " . number_format($imovel['area'], 2, ',', '.') . " m²\n";
    $conteudo .= "Perímetro: " . number_format($imovel['perimetro'], 2, ',', '.') . " m\n\n";
    
    $conteudo .= "DESCRIÇÃO DO PERÍMETRO:\n\n";
    $conteudo .= "O imóvel urbano em questão possui formato [regular/irregular] e ";
    $conteudo .= "encontra-se situado na zona urbana do município.\n\n";
    
    // Adicionar descrição das coordenadas para imóvel urbano
    if (!empty($coordenadas)) {
        $conteudo .= "COORDENADAS DOS VÉRTICES:\n\n";
        foreach ($coordenadas as $coord) {
            $conteudo .= "Vértice {$coord['point']}: Lat {$coord['latitude']}°, Long {$coord['longitude']}°\n";
        }
        $conteudo .= "\n";
    }
    
    $conteudo .= "CONFRONTAÇÕES URBANAS:\n";
    $conteudo .= "Frente: [definir logradouro]\n";
    $conteudo .= "Fundos: [definir confrontante]\n";
    $conteudo .= "Lado Direito: [definir confrontante]\n";
    $conteudo .= "Lado Esquerdo: [definir confrontante]\n\n";
    
    $conteudo .= "CARACTERÍSTICAS URBANÍSTICAS:\n";
    $conteudo .= "Zona: [definir zoneamento]\n";
    $conteudo .= "Uso Permitido: [definir conforme legislação municipal]\n";
    $conteudo .= "Coeficiente de Aproveitamento: [definir]\n";
    $conteudo .= "Taxa de Ocupação: [definir]\n\n";
    
    if (!empty($imovel['proprietario_nome'])) {
        $conteudo .= "PROPRIETÁRIO:\n";
        $conteudo .= "Nome: {$imovel['proprietario_nome']}\n";
        $conteudo .= "CPF/CNPJ: {$imovel['proprietario_documento']}\n\n";
    }
    
    $conteudo .= "Este memorial foi elaborado para fins de regularização fundiária urbana, ";
    $conteudo .= "conforme Lei Federal nº 13.465/2017.\n\n";
    
    $conteudo .= "Data: " . date('d/m/Y') . "\n";
    
    return $conteudo;
}

function gerarMemorialRural($imovel, $coordenadas) {
    $conteudo = "MEMORIAL DESCRITIVO - IMÓVEL RURAL\n\n";
    
    $conteudo .= "IDENTIFICAÇÃO DA PROPRIEDADE RURAL:\n";
    $conteudo .= "Denominação: [Nome da propriedade]\n";
    $conteudo .= "Matrícula: {$imovel['matricula']}\n";
    $conteudo .= "Município: {$imovel['cidade']}\n";
    $conteudo .= "Estado: {$imovel['estado']}\n";
    $conteudo .= "Área Total: " . number_format($imovel['area'], 2, ',', '.') . " m² (" . number_format($imovel['area']/10000, 4, ',', '.') . " ha)\n";
    $conteudo .= "Perímetro: " . number_format($imovel['perimetro'], 2, ',', '.') . " m\n\n";
    
    $conteudo .= "LOCALIZAÇÃO E ACESSO:\n";
    $conteudo .= "A propriedade situa-se na zona rural do município de {$imovel['cidade']}, ";
    $conteudo .= "com acesso pela [definir estrada/rodovia].\n\n";
    
    $conteudo .= "DESCRIÇÃO PERIMETRAL:\n\n";
    
    if (!empty($coordenadas)) {
        for ($i = 0; $i < count($coordenadas); $i++) {
            $pontoAtual = $coordenadas[$i];
            $proximoPonto = $coordenadas[($i + 1) % count($coordenadas)];
            
            $distancia = calcularDistancia(
                $pontoAtual['latitude'], $pontoAtual['longitude'],
                $proximoPonto['latitude'], $proximoPonto['longitude']
            );
            
            $azimute = calcularAzimute(
                $pontoAtual['latitude'], $pontoAtual['longitude'],
                $proximoPonto['latitude'], $proximoPonto['longitude']
            );
            
            if ($i === 0) {
                $conteudo .= "Tem início no marco {$pontoAtual['point']}, cravado no terreno, ";
                $conteudo .= "de coordenadas geográficas Latitude {$pontoAtual['latitude']}° e ";
                $conteudo .= "Longitude {$pontoAtual['longitude']}°; deste ponto, segue com ";
                $conteudo .= "azimute de {$azimute}° e distância de " . number_format($distancia, 2, ',', '.') . " metros ";
                $conteudo .= "até o marco {$proximoPonto['point']};\n\n";
            } elseif ($i === count($coordenadas) - 1) {
                $conteudo .= "Do marco {$pontoAtual['point']}, retorna ao marco inicial {$proximoPonto['point']}, ";
                $conteudo .= "com azimute de {$azimute}° e distância de " . number_format($distancia, 2, ',', '.') . " metros, ";
                $conteudo .= "fechando o perímetro e encerrando uma área de ";
                $conteudo .= number_format($imovel['area']/10000, 4, ',', '.') . " hectares.\n\n";
            } else {
                $conteudo .= "Do marco {$pontoAtual['point']}, segue com azimute de {$azimute}° ";
                $conteudo .= "e distância de " . number_format($distancia, 2, ',', '.') . " metros ";
                $conteudo .= "até o marco {$proximoPonto['point']};\n\n";
            }
        }
    }
    
    $conteudo .= "CONFRONTAÇÕES RURAIS:\n";
    $conteudo .= "Norte: [definir confrontante]\n";
    $conteudo .= "Sul: [definir confrontante]\n";
    $conteudo .= "Leste: [definir confrontante]\n";
    $conteudo .= "Oeste: [definir confrontante]\n\n";
    
    $conteudo .= "CARACTERÍSTICAS DA PROPRIEDADE:\n";
    $conteudo .= "Uso Atual: [definir uso da terra]\n";
    $conteudo .= "Benfeitorias: [listar benfeitorias existentes]\n";
    $conteudo .= "Recursos Hídricos: [definir se há rios, nascentes, etc.]\n";
    $conteudo .= "Vegetação: [caracterizar vegetação]\n\n";
    
    if (!empty($imovel['proprietario_nome'])) {
        $conteudo .= "PROPRIETÁRIO:\n";
        $conteudo .= "Nome: {$imovel['proprietario_nome']}\n";
        $conteudo .= "CPF/CNPJ: {$imovel['proprietario_documento']}\n\n";
    }
    
    $conteudo .= "OBSERVAÇÕES TÉCNICAS:\n";
    $conteudo .= "- Coordenadas referenciadas ao SIRGAS2000\n";
    $conteudo .= "- Levantamento realizado com equipamento GPS\n";
    $conteudo .= "- Memorial elaborado conforme normas do INCRA\n\n";
    
    $conteudo .= "Data: " . date('d/m/Y') . "\n";
    $conteudo .= "Responsável Técnico: [nome do responsável]\n";
    $conteudo .= "CREA: [número do CREA]\n";
    
    return $conteudo;
}

function gerarMemorialLoteamento($imovel, $coordenadas) {
    $conteudo = "MEMORIAL DESCRITIVO - LOTEAMENTO\n\n";
    
    $conteudo .= "IDENTIFICAÇÃO DO LOTEAMENTO:\n";
    $conteudo .= "Denominação: [Nome do Loteamento]\n";
    $conteudo .= "Quadra: [número da quadra]\n";
    $conteudo .= "Lote: [número do lote]\n";
    $conteudo .= "Matrícula: {$imovel['matricula']}\n";
    $conteudo .= "Município: {$imovel['cidade']}\n";
    $conteudo .= "Estado: {$imovel['estado']}\n";
    $conteudo .= "Área do Lote: " . number_format($imovel['area'], 2, ',', '.') . " m²\n";
    $conteudo .= "Perímetro: " . number_format($imovel['perimetro'], 2, ',', '.') . " m\n\n";
    
    $conteudo .= "APROVAÇÃO DO LOTEAMENTO:\n";
    $conteudo .= "Lei de Aprovação: [número da lei]\n";
    $conteudo .= "Data de Aprovação: [data]\n";
    $conteudo .= "Registro no Cartório: [dados do registro]\n\n";
    
    $conteudo .= "DESCRIÇÃO DO LOTE:\n\n";
    
    if (!empty($coordenadas)) {
        $conteudo .= "O lote possui formato [regular/irregular] e suas divisas são assim descritas:\n\n";
        
        for ($i = 0; $i < count($coordenadas); $i++) {
            $pontoAtual = $coordenadas[$i];
            $proximoPonto = $coordenadas[($i + 1) % count($coordenadas)];
            
            $distancia = calcularDistancia(
                $pontoAtual['latitude'], $pontoAtual['longitude'],
                $proximoPonto['latitude'], $proximoPonto['longitude']
            );
            
            $lado = ['Frente', 'Lado Direito', 'Fundos', 'Lado Esquerdo'][$i % 4];
            
            $conteudo .= "{$lado}: Do vértice {$pontoAtual['point']} ao vértice {$proximoPonto['point']}, ";
            $conteudo .= "medindo " . number_format($distancia, 2, ',', '.') . " metros;\n";
        }
        $conteudo .= "\n";
    }
    
    $conteudo .= "CONFRONTAÇÕES:\n";
    $conteudo .= "Frente: [rua/avenida]\n";
    $conteudo .= "Fundos: [confrontante dos fundos]\n";
    $conteudo .= "Lado Direito: [lote vizinho ou logradouro]\n";
    $conteudo .= "Lado Esquerdo: [lote vizinho ou logradouro]\n\n";
    
    $conteudo .= "INFRAESTRUTURA DISPONÍVEL:\n";
    $conteudo .= "- Energia Elétrica: [disponível/não disponível]\n";
    $conteudo .= "- Água Potável: [disponível/não disponível]\n";
    $conteudo .= "- Esgoto Sanitário: [disponível/não disponível]\n";
    $conteudo .= "- Pavimentação: [tipo de pavimentação]\n";
    $conteudo .= "- Iluminação Pública: [disponível/não disponível]\n\n";
    
    if (!empty($imovel['proprietario_nome'])) {
        $conteudo .= "PROPRIETÁRIO:\n";
        $conteudo .= "Nome: {$imovel['proprietario_nome']}\n";
        $conteudo .= "CPF/CNPJ: {$imovel['proprietario_documento']}\n\n";
    }
    
    $conteudo .= "RESTRIÇÕES E OBSERVAÇÕES:\n";
    $conteudo .= "- Observar recuos obrigatórios conforme legislação municipal\n";
    $conteudo .= "- Respeitar coeficiente de aproveitamento do loteamento\n";
    $conteudo .= "- Cumprir as normas do memorial de incorporação\n\n";
    
    $conteudo .= "Este memorial foi elaborado com base no projeto aprovado do loteamento ";
    $conteudo .= "e nas normas municipais vigentes.\n\n";
    
    $conteudo .= "Data: " . date('d/m/Y') . "\n";
    
    return $conteudo;
}

function calcularDistancia($lat1, $lng1, $lat2, $lng2) {
    $earthRadius = 6371000; // metros
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLng/2) * sin($dLng/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}

function calcularAzimute($lat1, $lng1, $lat2, $lng2) {
    $dLng = deg2rad($lng2 - $lng1);
    $lat1 = deg2rad($lat1);
    $lat2 = deg2rad($lat2);
    
    $y = sin($dLng) * cos($lat2);
    $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLng);
    
    $azimute = atan2($y, $x);
    $azimute = rad2deg($azimute);
    $azimute = ($azimute + 360) % 360;
    
    return number_format($azimute, 2, ',', '.');
}
?>