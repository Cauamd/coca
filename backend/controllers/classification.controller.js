const pool = require("../config/db");
const { classifyAllPending } = require("../services/classification.service");
const { suggestKeywords } = require("../services/suggestion.service");

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

    const [result] = await pool.query(
      "UPDATE apontamentos SET modo_falha_id = ? WHERE id = ?",
      [modo_falha_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: "Apontamento não encontrado." });
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

module.exports = {
  reclassifyAll,
  getModosFalha,
  addPalavraChave,
  updateClassificacaoManual,
  getSuggestions,
};
