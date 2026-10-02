const pool = require("../config/db");
const { classifyAllPending } = require("../services/classification.service");
const { normalizeText } = require("../services/classification.service");
const { suggestKeywords } = require("../services/suggestion.service");
const { getReport } = require("../services/ai-classification.service");
const { executarRetreinoNoturno } = require("../jobs/retrainScheduler");

async function reclassifyAll(req, res) {
  try {
    const result = await classifyAllPending({ forceAll: true });
    res.json({ status: "sucesso", ...result });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function getModosFalha(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome_padrao, categoria FROM modos_falha_padrao WHERE ativo = TRUE ORDER BY nome_padrao"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function addPalavraChave(req, res) {
  const { modo_falha_id, palavra_chave, prioridade = 0 } = req.body;

  if (!modo_falha_id || !palavra_chave) {
    return res.status(400).json({ detail: "modo_falha_id e palavra_chave são obrigatórios." });
  }

  try {
    await pool.query(
      "INSERT INTO palavras_chave_classificacao (modo_falha_id, palavra_chave, prioridade) VALUES (?, ?, ?)",
      [modo_falha_id, palavra_chave.toUpperCase().trim(), prioridade]
    );
    res.json({ status: "sucesso" });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateClassificacaoManual(req, res) {
  const { id } = req.params;
  const { modo_falha_id } = req.body;

  if (modo_falha_id === undefined) {
    return res.status(400).json({ detail: "modo_falha_id é obrigatório (use null para remover a classificação)." });
  }

  try {
    if (modo_falha_id !== null) {
      const [check] = await pool.query(
        "SELECT id FROM modos_falha_padrao WHERE id = ? AND ativo = TRUE",
        [modo_falha_id]
      );
      if (check.length === 0) {
        return res.status(400).json({ detail: "modo_falha_id inválido ou inativo." });
      }
    }

    const [apontamentoRows] = await pool.query(
      "SELECT centro, observacoes FROM apontamentos WHERE id = ?",
      [id]
    );
    if (apontamentoRows.length === 0) {
      return res.status(404).json({ detail: "Apontamento não encontrado." });
    }
    const { centro, observacoes } = apontamentoRows[0];
    const origem = modo_falha_id !== null ? "manual" : null;

    const [result] = await pool.query(
      "UPDATE apontamentos SET modo_falha_id = ?, origem_classificacao = ? WHERE id = ?",
      [modo_falha_id, origem, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: "Apontamento não encontrado." });
    }

    if (modo_falha_id !== null && observacoes) {
      const normalized = normalizeText(observacoes);
      if (normalized && centro) {
        await pool.query(
          `INSERT INTO historico_classificacoes (observacao_normalizada, modo_falha_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE modo_falha_id = VALUES(modo_falha_id)`,
          [normalized, modo_falha_id]
        );

        await pool.query(
          `INSERT INTO feedback_classificacoes_manuais
             (centro, texto_original, observacao_normalizada, modo_falha_id)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE modo_falha_id = VALUES(modo_falha_id), texto_original = VALUES(texto_original)`,
          [centro, observacoes, normalized, modo_falha_id]
        );
      }
    }

    const [rows] = await pool.query(
      `SELECT a.id, mf.nome_padrao AS modo_falha_padrao
       FROM apontamentos a
       LEFT JOIN modos_falha_padrao mf ON mf.id = a.modo_falha_id
       WHERE a.id = ?`,
      [id]
    );

    res.json({ status: "sucesso", apontamento: rows[0] });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao classificar apontamento: ${err.message}` });
  }
}

async function getSuggestions(req, res) {
  const minOccurrences = req.query.min ? parseInt(req.query.min, 10) : 5;
  try {
    const result = await suggestKeywords({ minOccurrences });
    res.json(result);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function getModelReport(req, res) {
  res.json(getReport());
}

async function getFeedbackContagem(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT centro, COUNT(*) AS total, MAX(updated_at) AS ultima_correcao
       FROM feedback_classificacoes_manuais
       GROUP BY centro
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function forcarRetreino(req, res) {
  executarRetreinoNoturno();
  res.json({ status: "iniciado", mensagem: "Retreino disparado em segundo plano. Acompanhe os logs do servidor." });
}

module.exports = {
  reclassifyAll,
  getModosFalha,
  addPalavraChave,
  updateClassificacaoManual,
  getSuggestions,
  getModelReport,
  getFeedbackContagem,
  forcarRetreino,
};