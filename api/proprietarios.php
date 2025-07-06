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
            getProprietario($db, $_GET['id']);
        } else {
            getProprietarios($db);
        }
        break;
    case 'POST':
        createProprietario($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateProprietario($db, $_GET['id'], $input);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteProprietario($db, $_GET['id']);
        }
        break;
}

function getProprietarios($db) {
    try {
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE nome LIKE :search OR documento LIKE :search OR email LIKE :search";
            $params[':search'] = "%$search%";
        }
        
        $query = "SELECT p.*,
                         (SELECT COUNT(*) FROM imoveis WHERE proprietario_id = p.id) as total_imoveis
                  FROM proprietarios p
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
        
        $proprietarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Contar total para paginação
        $countQuery = "SELECT COUNT(*) as total FROM proprietarios $whereClause";
        $countStmt = $db->prepare($countQuery);
        
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $proprietarios,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total,
                'per_page' => $limit
            ]
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar proprietários: ' . $e->getMessage()]);
    }
}

function getProprietario($db, $id) {
    try {
        $query = "SELECT p.*,
                         (SELECT COUNT(*) FROM imoveis WHERE proprietario_id = p.id) as total_imoveis
                  FROM proprietarios p
                  WHERE p.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $proprietario = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $proprietario]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Proprietário não encontrado']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar proprietário: ' . $e->getMessage()]);
    }
}

function createProprietario($db, $data) {
    try {
        $query = "INSERT INTO proprietarios (nome, documento, email, telefone, endereco, cidade, estado) 
                  VALUES (:nome, :documento, :email, :telefone, :endereco, :cidade, :estado)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':documento', $data['documento']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':telefone', $data['telefone']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':cidade', $data['cidade']);
        $stmt->bindParam(':estado', $data['estado']);
        
        if ($stmt->execute()) {
            $id = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Proprietário criado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar proprietário']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar proprietário: ' . $e->getMessage()]);
    }
}

function updateProprietario($db, $id, $data) {
    try {
        $query = "UPDATE proprietarios SET 
                  nome = :nome,
                  documento = :documento,
                  email = :email,
                  telefone = :telefone,
                  endereco = :endereco,
                  cidade = :cidade,
                  estado = :estado,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':documento', $data['documento']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':telefone', $data['telefone']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':cidade', $data['cidade']);
        $stmt->bindParam(':estado', $data['estado']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Proprietário atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar proprietário']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar proprietário: ' . $e->getMessage()]);
    }
}

function deleteProprietario($db, $id) {
    try {
        // Verificar se há imóveis associados
        $checkQuery = "SELECT COUNT(*) as total FROM imoveis WHERE proprietario_id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        $count = $checkStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        if ($count > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Não é possível excluir proprietário com imóveis associados']);
            return;
        }
        
        $query = "DELETE FROM proprietarios WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Proprietário excluído com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir proprietário']);
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao excluir proprietário: ' . $e->getMessage()]);
    }
}
?>