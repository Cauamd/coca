const pool = require("../config/db");
const { getAlertas, getSugestao, LIMITE_ALERTA_MINUTOS } = require("../services/alerts.service");

async function listAlertas(req, res) {
  const centro = req.user?.centro || null;

  try {
    const alertas = await getAlertas(centro);
    res.json({ limite_minutos: LIMITE_ALERTA_MINUTOS, alertas });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao buscar alertas: ${err.message}` });
  }
}

async function getPlano(req, res) {
  const { linha, equipamento } = req.params;
  const centro = req.user?.centro || null;

  try {
    let rows;
    if (centro) {
      [rows] = await pool.query(
        "SELECT * FROM planos_acao WHERE centro = ? AND linha = ? AND equipamento = ?",
        [centro, linha, equipamento]
      );
    } else {
      [rows] = await pool.query(
        "SELECT * FROM planos_acao WHERE linha = ? AND equipamento = ? LIMIT 1",
        [linha, equipamento]
      );
    }

    const sugestao = await getSugestao(centro, linha, equipamento);

    res.json({
      plano: rows[0] || null,
      sugestao,
    });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao buscar plano: ${err.message}` });
  }
}

async function savePlano(req, res) {
  const { linha, equipamento } = req.params;
  const centro = req.user?.centro || req.body.centro || null;
  const {
    status,
    descricao_problema,
    ishikawa,
    brainstorming,
    cinco_porques,
    cinco_w2h,
  } = req.body;

  if (!centro) {
    return res.status(400).json({ detail: "Não foi possível identificar o centro. Faça login novamente ou informe o centro." });
  }

  try {
    await pool.query(
      `INSERT INTO planos_acao
         (centro, linha, equipamento, status, descricao_problema, ishikawa, brainstorming, cinco_porques, cinco_w2h)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         descricao_problema = VALUES(descricao_problema),
         ishikawa = VALUES(ishikawa),
         brainstorming = VALUES(brainstorming),
         cinco_porques = VALUES(cinco_porques),
         cinco_w2h = VALUES(cinco_w2h)`,
      [
        centro, linha, equipamento,
        status || "aberto",
        descricao_problema || null,
        JSON.stringify(ishikawa || {}),
        JSON.stringify(brainstorming || []),
        JSON.stringify(cinco_porques || []),
        JSON.stringify(cinco_w2h || []),
      ]
    );

    res.json({ status: "sucesso" });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao salvar plano: ${err.message}` });
  }
}

module.exports = { listAlertas, getPlano, savePlano };
