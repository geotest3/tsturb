<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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
        if (isset($_GET['id'])) {
            getProcesso($db, $_GET['id']);
        } else {
            getProcessos($db);
        }
        break;
    case 'POST':
        createProcesso($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateProcesso($db, $_GET['id'], $input);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteProcesso($db, $_GET['id']);
        }
        break;
}

function getProcessos($db) {
    try {
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        $params = [];
        $conditions = [];
        
        if (!empty($search)) {
            $conditions[] = "(titulo LIKE :search OR descricao LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        if (!empty($status)) {
            $conditions[] = "status = :status";
            $params[':status'] = $status;
        }
        
        if (!empty($conditions)) {
            $whereClause = "WHERE " . implode(" AND ", $conditions);
        }
        
        $query = "SELECT p.*,
                         (SELECT COUNT(*) FROM imoveis WHERE processo_id = p.id) as total_imoveis,
                         (SELECT COUNT(*) FROM documentos WHERE processo_id = p.id) as total_documentos
                  FROM processos p
                  $whereClause
                  ORDER BY p.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $processos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Contar total para paginação
        $countQuery = "SELECT COUNT(*) as total FROM processos $whereClause";
        $countStmt = $db->prepare($countQuery);
        
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $processos,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total,
                'per_page' => $limit
            ]
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar processos: ' . $e->getMessage()]);
    }
}

function getProcesso($db, $id) {
    try {
        $query = "SELECT p.*,
                         (SELECT COUNT(*) FROM imoveis WHERE processo_id = p.id) as total_imoveis,
                         (SELECT COUNT(*) FROM documentos WHERE processo_id = p.id) as total_documentos
                  FROM processos p
                  WHERE p.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $processo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Buscar imóveis do processo
            $imoveisQuery = "SELECT i.*, prop.nome as proprietario_nome 
                            FROM imoveis i 
                            LEFT JOIN proprietarios prop ON i.proprietario_id = prop.id 
                            WHERE i.processo_id = :id";
            $imoveisStmt = $db->prepare($imoveisQuery);
            $imoveisStmt->bindParam(':id', $id);
            $imoveisStmt->execute();
            $processo['imoveis'] = $imoveisStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Buscar documentos do processo
            $docsQuery = "SELECT * FROM documentos WHERE processo_id = :id ORDER BY created_at DESC";
            $docsStmt = $db->prepare($docsQuery);
            $docsStmt->bindParam(':id', $id);
            $docsStmt->execute();
            $processo['documentos'] = $docsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $processo]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Processo não encontrado']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar processo: ' . $e->getMessage()]);
    }
}

function createProcesso($db, $data) {
    try {
        $query = "INSERT INTO processos (titulo, descricao, status, prioridade) 
                  VALUES (:titulo, :descricao, :status, :prioridade)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':titulo', $data['titulo']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':prioridade', $data['prioridade']);
        
        if ($stmt->execute()) {
            $id = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Processo criado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar processo']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar processo: ' . $e->getMessage()]);
    }
}

function updateProcesso($db, $id, $data) {
    try {
        $query = "UPDATE processos SET 
                  titulo = :titulo,
                  descricao = :descricao,
                  status = :status,
                  prioridade = :prioridade,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':titulo', $data['titulo']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':prioridade', $data['prioridade']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Processo atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar processo']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar processo: ' . $e->getMessage()]);
    }
}

function deleteProcesso($db, $id) {
    try {
        $query = "DELETE FROM processos WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Processo excluído com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir processo']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao excluir processo: ' . $e->getMessage()]);
    }
}
?>