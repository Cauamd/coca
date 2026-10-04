use coca;

CREATE TABLE apontamentos (
    id                      INT AUTO_INCREMENT PRIMARY KEY,

    -- Identificação
    centro                  CHAR(4) NOT NULL,
    linha                   VARCHAR(20) NOT NULL,
    ordem                   VARCHAR(20) NOT NULL,
    material                VARCHAR(20) NOT NULL,
    descricao_material      VARCHAR(100),

    -- Tempo do apontamento
    data_inicio             DATETIME NOT NULL,
    turno                   TINYINT UNSIGNED,
    intervalo               VARCHAR(20),

    -- Classificação da parada
    tipo_parada             VARCHAR(30),
    chave_parada            VARCHAR(50),
    subchave_parada         VARCHAR(50),
    chave1_parada           VARCHAR(50),
    observacoes             VARCHAR(255),

    -- Indicadores numéricos
    perc_eficiencia_perdida DECIMAL(10,6) DEFAULT 0,
    pontos_acumulados       DECIMAL(10,6) DEFAULT 0,
    caixas_produzidas       INT UNSIGNED DEFAULT 0,
    total_minutos           DECIMAL(10,2) DEFAULT 0,
    tempo_parada            DECIMAL(10,2) NOT NULL DEFAULT 0,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_centro (centro),
    INDEX idx_linha (linha),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_tipo_parada (tipo_parada),
    INDEX idx_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE centros (
    cod_centro   CHAR(4) PRIMARY KEY,
    unidade      VARCHAR(50) NOT NULL,
    cod_sap      VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE criticidade_equipamentos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    planta              VARCHAR(50),
    localizacao_tecnica VARCHAR(50),
    equipo_padre        VARCHAR(50),
    tag                 VARCHAR(50),
    descricao_equipo    VARCHAR(150),
    criticidade         CHAR(1),  -- 'A', 'B' ou 'C'
    INDEX idx_tag (tag),
    INDEX idx_criticidade (criticidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Modos de falha padronizados (o "resultado final" do funil, ex: FALHA DE ROLAMENTO)
CREATE TABLE modos_falha_padrao (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome_padrao     VARCHAR(80) NOT NULL UNIQUE,   -- "FALHA DE ROLAMENTO"
    categoria       VARCHAR(50),                   -- "MECÂNICA", "ELÉTRICA", "PNEUMÁTICA"...
    ativo           BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Palavras-chave que apontam para um modo de falha padrão
-- Várias linhas de texto diferentes -> mesma modo_falha_id
CREATE TABLE palavras_chave_classificacao (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    modo_falha_id   INT NOT NULL,
    palavra_chave   VARCHAR(60) NOT NULL,   -- "ROLAMENTO", "ROLAMENTO QUEBRADO", etc.
    prioridade      INT DEFAULT 0,          -- maior = checado primeiro (para termos mais específicos)
    FOREIGN KEY (modo_falha_id) REFERENCES modos_falha_padrao(id) ON DELETE CASCADE,
    INDEX idx_palavra_chave (palavra_chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Coluna nova na tabela de apontamentos para guardar o resultado da classificação
ALTER TABLE apontamentos
    ADD COLUMN modo_falha_id INT NULL,
    ADD FOREIGN KEY (modo_falha_id) REFERENCES modos_falha_padrao(id) ON DELETE SET NULL,
    ADD INDEX idx_modo_falha (modo_falha_id);
    
    CREATE TABLE planos_acao (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    centro              CHAR(4) NOT NULL,
    linha               VARCHAR(20) NOT NULL,
    equipamento         VARCHAR(50) NOT NULL,

    status              ENUM('aberto', 'em_andamento', 'concluido') DEFAULT 'aberto',

    descricao_problema  TEXT,

    -- Ishikawa (6M) — cada chave é um dos 6M, valor é texto livre
    ishikawa            JSON,

    -- Brainstorming — lista livre de ideias (array de strings)
    brainstorming       JSON,

    -- 5 Porquês — array de 5 strings, cada um aprofundando o anterior
    cinco_porques       JSON,

    -- 5W2H — array de linhas { what, why, where, when, who, how, how_much }
    cinco_w2h           JSON,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_plano (centro, linha, equipamento),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE historico_classificacoes (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    observacao_normalizada  VARCHAR(500) NOT NULL,
    modo_falha_id           INT NOT NULL,
    FOREIGN KEY (modo_falha_id) REFERENCES modos_falha_padrao(id) ON DELETE CASCADE,
    UNIQUE KEY uq_obs_normalizada (observacao_normalizada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE feedback_classificacoes_manuais (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    centro                  CHAR(4) NOT NULL,
    texto_original          TEXT NOT NULL,
    observacao_normalizada  VARCHAR(500) NOT NULL,
    modo_falha_id           INT NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (modo_falha_id) REFERENCES modos_falha_padrao(id) ON DELETE CASCADE,
    UNIQUE KEY uq_centro_obs (centro, observacao_normalizada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE apontamentos
  ADD COLUMN origem_classificacao ENUM('historico_exato', 'palavra_chave', 'ia', 'manual') NULL
  AFTER modo_falha_id;