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
            getImovel($db, $_GET['id']);
        } else {
            getImoveis($db);
        }
        break;
    case 'POST':
        createImovel($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateImovel($db, $_GET['id'], $input);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteImovel($db, $_GET['id']);
        }
        break;
}

function getImoveis($db) {
    try {
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE i.matricula LIKE :search OR i.endereco LIKE :search OR i.cidade LIKE :search";
            $params[':search'] = "%$search%";
        }
        
        $query = "SELECT i.*, 
                         p.nome as proprietario_nome,
                         pr.titulo as processo_titulo,
                         pr.status as processo_status
                  FROM imoveis i
                  LEFT JOIN proprietarios p ON i.proprietario_id = p.id
                  LEFT JOIN processos pr ON i.processo_id = pr.id
                  $whereClause
                  ORDER BY i.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $imoveis = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decodificar coordenadas JSON
        foreach ($imoveis as &$imovel) {
            if ($imovel['coordenadas']) {
                $imovel['coordenadas'] = json_decode($imovel['coordenadas'], true);
            }
        }
        
        // Contar total para paginação
        $countQuery = "SELECT COUNT(*) as total FROM imoveis i $whereClause";
        $countStmt = $db->prepare($countQuery);
        
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $imoveis,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total,
                'per_page' => $limit
            ]
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar imóveis: ' . $e->getMessage()]);
    }
}

function getImovel($db, $id) {
    try {
        $query = "SELECT i.*, 
                         p.nome as proprietario_nome,
                         pr.titulo as processo_titulo
                  FROM imoveis i
                  LEFT JOIN proprietarios p ON i.proprietario_id = p.id
                  LEFT JOIN processos pr ON i.processo_id = pr.id
                  WHERE i.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $imovel = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($imovel['coordenadas']) {
                $imovel['coordenadas'] = json_decode($imovel['coordenadas'], true);
            }
            echo json_encode(['success' => true, 'data' => $imovel]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Imóvel não encontrado']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar imóvel: ' . $e->getMessage()]);
    }
}

function createImovel($db, $data) {
    try {
        $query = "INSERT INTO imoveis (matricula, area, perimetro, endereco, cidade, estado, proprietario_id, processo_id, coordenadas) 
                  VALUES (:matricula, :area, :perimetro, :endereco, :cidade, :estado, :proprietario_id, :processo_id, :coordenadas)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':matricula', $data['matricula']);
        $stmt->bindParam(':area', $data['area']);
        $stmt->bindParam(':perimetro', $data['perimetro']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':cidade', $data['cidade']);
        $stmt->bindParam(':estado', $data['estado']);
        $stmt->bindParam(':proprietario_id', $data['proprietario_id']);
        $stmt->bindParam(':processo_id', $data['processo_id']);
        
        $coordenadas_json = isset($data['coordenadas']) ? json_encode($data['coordenadas']) : null;
        $stmt->bindParam(':coordenadas', $coordenadas_json);
        
        if ($stmt->execute()) {
            $id = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Imóvel criado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar imóvel']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar imóvel: ' . $e->getMessage()]);
    }
}

function updateImovel($db, $id, $data) {
    try {
        $query = "UPDATE imoveis SET 
                  matricula = :matricula,
                  area = :area,
                  perimetro = :perimetro,
                  endereco = :endereco,
                  cidade = :cidade,
                  estado = :estado,
                  proprietario_id = :proprietario_id,
                  processo_id = :processo_id,
                  coordenadas = :coordenadas,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':matricula', $data['matricula']);
        $stmt->bindParam(':area', $data['area']);
        $stmt->bindParam(':perimetro', $data['perimetro']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':cidade', $data['cidade']);
        $stmt->bindParam(':estado', $data['estado']);
        $stmt->bindParam(':proprietario_id', $data['proprietario_id']);
        $stmt->bindParam(':processo_id', $data['processo_id']);
        
        $coordenadas_json = isset($data['coordenadas']) ? json_encode($data['coordenadas']) : null;
        $stmt->bindParam(':coordenadas', $coordenadas_json);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Imóvel atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar imóvel']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar imóvel: ' . $e->getMessage()]);
    }
}

function deleteImovel($db, $id) {
    try {
        $query = "DELETE FROM imoveis WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Imóvel excluído com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir imóvel']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao excluir imóvel: ' . $e->getMessage()]);
    }
}
?>