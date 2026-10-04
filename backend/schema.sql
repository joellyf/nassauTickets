CREATE DATABASE IF NOT EXISTS nassauTickets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE nassauTickets;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('ATENDENTE', 'GESTOR') NOT NULL DEFAULT 'ATENDENTE',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guiches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identificacao VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_senha VARCHAR(20) NOT NULL UNIQUE,
  tipo ENUM('SP', 'SG', 'SE') NOT NULL,
  sequencial INT NOT NULL,
  data_emissao DATE NOT NULL,
  status ENUM(
    'EMITIDA',
    'AGUARDANDO',
    'CHAMADA',
    'CHAMADA_NOVAMENTE',
    'EM_ATENDIMENTO',
    'ATENDIDA',
    'NAO_COMPARECEU',
    'DESCARTADA'
  ) NOT NULL DEFAULT 'AGUARDANDO',
  data_hora_emissao DATETIME NOT NULL,
  primeira_chamada_em DATETIME NULL,
  segunda_chamada_em DATETIME NULL,
  inicio_atendimento_em DATETIME NULL,
  fim_atendimento_em DATETIME NULL,
  guiche_id INT NULL,
  atendente_id INT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_ticket_tipo_data_seq UNIQUE (data_emissao, tipo, sequencial),
  CONSTRAINT fk_ticket_guiche FOREIGN KEY (guiche_id) REFERENCES guiches(id),
  CONSTRAINT fk_ticket_atendente FOREIGN KEY (atendente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS logs_auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL UNIQUE,
  atendente_id INT NULL,
  guiche_id INT NULL,
  horario_primeira_chamada DATETIME NULL,
  horario_segunda_chamada DATETIME NULL,
  horario_inicio DATETIME NULL,
  horario_fim DATETIME NULL,
  status_final VARCHAR(30) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_log_atendente FOREIGN KEY (atendente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_log_guiche FOREIGN KEY (guiche_id) REFERENCES guiches(id)
);

CREATE TABLE IF NOT EXISTS eventos_atendimento (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  atendente_id INT NULL,
  guiche_id INT NULL,
  acao ENUM(
    'EMISSAO',
    'CHAMADA',
    'SEGUNDA_CHAMADA',
    'INICIO',
    'FIM',
    'AUSENCIA',
    'DESCARTE'
  ) NOT NULL,
  ocorrido_em DATETIME NOT NULL,
  UNIQUE KEY uq_evento_ticket_acao_hora (ticket_id, acao, ocorrido_em),
  CONSTRAINT fk_evento_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_evento_atendente FOREIGN KEY (atendente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_evento_guiche FOREIGN KEY (guiche_id) REFERENCES guiches(id)
);

CREATE TABLE IF NOT EXISTS sequencias_diarias (
  data_emissao DATE NOT NULL,
  tipo ENUM('SP', 'SG', 'SE') NOT NULL,
  ultimo_numero INT NOT NULL DEFAULT 0,
  PRIMARY KEY (data_emissao, tipo)
);

CREATE TABLE IF NOT EXISTS controle_fila (
  data_emissao DATE PRIMARY KEY,
  ultima_fila ENUM('SP', 'NAO_SP') NULL
);

CREATE INDEX idx_ticket_fila
  ON tickets (data_emissao, status, tipo, sequencial);

CREATE INDEX idx_ticket_chamadas
  ON tickets (status, primeira_chamada_em);

CREATE INDEX idx_eventos_periodo
  ON eventos_atendimento (ocorrido_em, acao);

INSERT INTO guiches (id, identificacao, ativo) VALUES
  (1, '01', TRUE), (2, '02', TRUE), (3, '03', TRUE)
ON DUPLICATE KEY UPDATE identificacao = VALUES(identificacao);

-- Senha inicial para ambiente acadêmico. Troque a senha em produção.
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo)
VALUES (
  1,
  'Atendente Padrão',
  'atendente@nassau.com',
  '$2b$10$e0N9gQm8hQJ1c9zJgq4v9u6sR8j9q2cW7o0W2uYqV8Q2lQj0H6f5m',
  'ATENDENTE',
  TRUE
)
ON DUPLICATE KEY UPDATE id = id;

-- Gestor de demonstração. A senha real é criada/atualizada pelo script seed.
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo)
VALUES (
  2,
  'Gestor Padrão',
  'gestor@nassau.com',
  '$2b$10$e0N9gQm8hQJ1c9zJgq4v9u6sR8j9q2cW7o0W2uYqV8Q2lQj0H6f5m',
  'GESTOR',
  TRUE
)
ON DUPLICATE KEY UPDATE id = id;
