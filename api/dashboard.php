<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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

try {
    // Estatísticas gerais
    $stats = [];
    
    // Total de imóveis
    $query = "SELECT COUNT(*) as total FROM imoveis";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_imoveis'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total de proprietários
    $query = "SELECT COUNT(*) as total FROM proprietarios";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_proprietarios'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total de processos
    $query = "SELECT COUNT(*) as total FROM processos";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_processos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Processos concluídos
    $query = "SELECT COUNT(*) as total FROM processos WHERE status = 'concluido'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['processos_concluidos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Processos pendentes
    $query = "SELECT COUNT(*) as total FROM processos WHERE status = 'pendente'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['processos_pendentes'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Importações recentes (últimos 30 dias)
    $query = "SELECT COUNT(*) as total FROM importacoes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['importacoes_recentes'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Processos recentes
    $query = "SELECT p.*, 
                     (SELECT COUNT(*) FROM imoveis WHERE processo_id = p.id) as total_imoveis
              FROM processos p 
              ORDER BY p.created_at DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $processos_recentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Distribuição por estado
    $query = "SELECT estado, COUNT(*) as total 
              FROM imoveis 
              WHERE estado IS NOT NULL 
              GROUP BY estado 
              ORDER BY total DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $distribuicao_estados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'processos_recentes' => $processos_recentes,
        'distribuicao_estados' => $distribuicao_estados
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>