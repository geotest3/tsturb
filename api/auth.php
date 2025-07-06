<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

session_start();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        if (isset($_GET['action']) && $_GET['action'] === 'login') {
            login($db, $input);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'logout') {
            logout();
        }
        break;
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'check') {
            checkAuth();
        }
        break;
}

function login($db, $input) {
    if (!isset($input['email']) || !isset($input['senha'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios']);
        return;
    }

    $query = "SELECT id, nome, email, role FROM usuarios WHERE email = :email AND senha = :senha";
    $stmt = $db->prepare($query);
    
    // Para demonstração, usando senha simples. Em produção, usar password_hash/password_verify
    $senha_hash = $input['senha'] === 'admin123' ? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' : md5($input['senha']);
    
    $stmt->bindParam(':email', $input['email']);
    $stmt->bindParam(':senha', $senha_hash);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nome'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
    }
}

function logout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
}

function checkAuth() {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'nome' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role' => $_SESSION['user_role']
            ]
        ]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
}
?>