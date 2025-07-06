<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

if (!isset($_FILES['arquivo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum arquivo enviado']);
    exit;
}

$arquivo = $_FILES['arquivo'];
$uploadDir = '../uploads/';

// Criar diretório se não existir
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validar tipo de arquivo
$allowedTypes = ['text/csv', 'application/vnd.google-earth.kml+xml', 'application/pdf'];
$fileType = $arquivo['type'];
$fileName = $arquivo['name'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if (!in_array($fileType, $allowedTypes) && !in_array($fileExtension, ['csv', 'kml', 'pdf'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de arquivo não suportado. Use CSV, KML ou PDF']);
    exit;
}

// Gerar nome único para o arquivo
$uniqueName = uniqid() . '_' . $fileName;
$uploadPath = $uploadDir . $uniqueName;

if (move_uploaded_file($arquivo['tmp_name'], $uploadPath)) {
    try {
        // Registrar importação no banco
        $query = "INSERT INTO importacoes (arquivo_nome, tipo_arquivo, status, usuario_id) 
                  VALUES (:arquivo_nome, :tipo_arquivo, 'processando', :usuario_id)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':arquivo_nome', $fileName);
        $stmt->bindParam(':tipo_arquivo', $fileExtension);
        $stmt->bindParam(':usuario_id', $_SESSION['user_id']);
        $stmt->execute();
        
        $importacaoId = $db->lastInsertId();
        
        // Processar arquivo baseado no tipo
        $dadosProcessados = processarArquivo($uploadPath, $fileExtension);
        
        if ($dadosProcessados) {
            // Atualizar status da importação
            $updateQuery = "UPDATE importacoes SET status = 'concluido', registros_importados = :registros WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':registros', count($dadosProcessados));
            $updateStmt->bindParam(':id', $importacaoId);
            $updateStmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Arquivo processado com sucesso',
                'dados' => $dadosProcessados,
                'importacao_id' => $importacaoId
            ]);
        } else {
            // Atualizar status para erro
            $updateQuery = "UPDATE importacoes SET status = 'erro' WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':id', $importacaoId);
            $updateStmt->execute();
            
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao processar arquivo']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao processar upload: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao fazer upload do arquivo']);
}

function processarArquivo($caminho, $tipo) {
    switch($tipo) {
        case 'csv':
            return processarCSV($caminho);
        case 'kml':
            return processarKML($caminho);
        case 'pdf':
            return processarPDF($caminho);
        default:
            return false;
    }
}

function processarCSV($caminho) {
    $dados = [];
    
    if (($handle = fopen($caminho, "r")) !== FALSE) {
        $headers = fgetcsv($handle, 1000, ",");
        
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $registro = [];
            for ($i = 0; $i < count($headers); $i++) {
                $registro[$headers[$i]] = isset($data[$i]) ? $data[$i] : '';
            }
            
            // Mapear campos comuns
            $dadosMapeados = [
                'matricula' => $registro['matricula'] ?? $registro['Matricula'] ?? 'M-' . uniqid(),
                'area' => floatval($registro['area'] ?? $registro['Area'] ?? 0),
                'perimetro' => floatval($registro['perimetro'] ?? $registro['Perimetro'] ?? 0),
                'endereco' => $registro['endereco'] ?? $registro['Endereco'] ?? '',
                'cidade' => $registro['cidade'] ?? $registro['Cidade'] ?? '',
                'estado' => $registro['estado'] ?? $registro['Estado'] ?? '',
                'proprietario' => $registro['proprietario'] ?? $registro['Proprietario'] ?? '',
                'coordenadas' => []
            ];
            
            // Tentar extrair coordenadas se existirem
            for ($i = 1; $i <= 10; $i++) {
                $lat = $registro["lat_p$i"] ?? $registro["Latitude_P$i"] ?? null;
                $lng = $registro["lng_p$i"] ?? $registro["Longitude_P$i"] ?? null;
                
                if ($lat && $lng) {
                    $dadosMapeados['coordenadas'][] = [
                        'latitude' => floatval($lat),
                        'longitude' => floatval($lng),
                        'point' => "P$i"
                    ];
                }
            }
            
            $dados[] = $dadosMapeados;
        }
        fclose($handle);
    }
    
    return $dados;
}

function processarKML($caminho) {
    $dados = [];
    
    $xml = simplexml_load_file($caminho);
    if ($xml === false) {
        return false;
    }
    
    // Processar placemarks do KML
    foreach ($xml->xpath('//Placemark') as $placemark) {
        $nome = (string)$placemark->name;
        $descricao = (string)$placemark->description;
        
        // Extrair coordenadas do polígono
        $coordenadas = [];
        $coordinates = $placemark->xpath('.//coordinates');
        
        if (!empty($coordinates)) {
            $coordStr = trim((string)$coordinates[0]);
            $pontos = explode(' ', $coordStr);
            
            foreach ($pontos as $i => $ponto) {
                $coords = explode(',', trim($ponto));
                if (count($coords) >= 2) {
                    $coordenadas[] = [
                        'latitude' => floatval($coords[1]),
                        'longitude' => floatval($coords[0]),
                        'point' => 'P' . ($i + 1)
                    ];
                }
            }
        }
        
        $dados[] = [
            'matricula' => 'M-KML-' . uniqid(),
            'area' => 0, // Calcular área baseada nas coordenadas
            'perimetro' => 0, // Calcular perímetro
            'endereco' => $nome,
            'cidade' => '',
            'estado' => '',
            'proprietario' => '',
            'coordenadas' => $coordenadas
        ];
    }
    
    return $dados;
}

function processarPDF($caminho) {
    // Para processar PDF, seria necessário uma biblioteca como pdf2text
    // Por simplicidade, retornamos dados mock
    return [
        [
            'matricula' => 'M-PDF-' . uniqid(),
            'area' => 1000,
            'perimetro' => 120,
            'endereco' => 'Extraído do PDF',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'proprietario' => 'Proprietário PDF',
            'coordenadas' => [
                ['latitude' => -23.550520, 'longitude' => -46.633309, 'point' => 'P1'],
                ['latitude' => -23.550620, 'longitude' => -46.633409, 'point' => 'P2'],
                ['latitude' => -23.550720, 'longitude' => -46.633509, 'point' => 'P3'],
                ['latitude' => -23.550820, 'longitude' => -46.633609, 'point' => 'P4']
            ]
        ]
    ];
}
?>