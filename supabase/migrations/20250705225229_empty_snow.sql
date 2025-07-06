-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS regularizacao_fundiaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE regularizacao_fundiaria;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de proprietários
CREATE TABLE IF NOT EXISTS proprietarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de processos
CREATE TABLE IF NOT EXISTS processos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status ENUM('pendente', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'pendente',
    prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de imóveis
CREATE TABLE IF NOT EXISTS imoveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    area DECIMAL(15,2) NOT NULL,
    perimetro DECIMAL(15,2),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    proprietario_id INT,
    processo_id INT,
    coordenadas JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proprietario_id) REFERENCES proprietarios(id) ON DELETE SET NULL,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('csv', 'kml', 'pdf', 'memorial', 'outro') NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tamanho INT,
    processo_id INT,
    imovel_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

-- Tabela de memoriais descritivos
CREATE TABLE IF NOT EXISTS memoriais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imovel_id INT NOT NULL,
    conteudo LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

-- Tabela de importações
CREATE TABLE IF NOT EXISTS importacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    arquivo_nome VARCHAR(255) NOT NULL,
    tipo_arquivo ENUM('csv', 'kml', 'pdf') NOT NULL,
    status ENUM('processando', 'concluido', 'erro') DEFAULT 'processando',
    registros_importados INT DEFAULT 0,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('Administrador', 'admin@rf.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Inserir dados de exemplo
INSERT INTO proprietarios (nome, documento, email, telefone, endereco, cidade, estado) VALUES 
('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua das Flores, 123', 'São Paulo', 'SP'),
('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 88888-8888', 'Av. Central, 456', 'Rio de Janeiro', 'RJ'),
('Carlos Oliveira', '456.789.123-00', 'carlos@email.com', '(11) 77777-7777', 'Rua Nova, 789', 'Belo Horizonte', 'MG');

INSERT INTO processos (titulo, descricao, status, prioridade) VALUES 
('Regularização Loteamento Vila Nova', 'Processo de regularização fundiária do loteamento Vila Nova', 'em_andamento', 'alta'),
('Regularização Sítio Bela Vista', 'Regularização de área rural no município', 'pendente', 'media'),
('Loteamento Jardim das Flores', 'Processo de aprovação de novo loteamento', 'concluido', 'baixa');

INSERT INTO imoveis (matricula, area, perimetro, endereco, cidade, estado, proprietario_id, processo_id, coordenadas) VALUES 
('M-001-2024', 1000.00, 120.00, 'Rua das Flores, 123', 'São Paulo', 'SP', 1, 1, 
'[{"latitude": -23.550520, "longitude": -46.633309, "point": "P1"}, {"latitude": -23.550620, "longitude": -46.633409, "point": "P2"}, {"latitude": -23.550720, "longitude": -46.633509, "point": "P3"}, {"latitude": -23.550820, "longitude": -46.633609, "point": "P4"}]'),
('M-002-2024', 1500.00, 150.00, 'Av. Central, 456', 'Rio de Janeiro', 'RJ', 2, 2,
'[{"latitude": -22.906847, "longitude": -43.172896, "point": "P1"}, {"latitude": -22.906947, "longitude": -43.172996, "point": "P2"}, {"latitude": -22.907047, "longitude": -43.173096, "point": "P3"}, {"latitude": -22.907147, "longitude": -43.173196, "point": "P4"}]');