const pool = require("../config/db");

const LIMITE_ALERTA_MINUTOS = 400;

async function getAlertas(centro) {
  const where = [
    "a.tempo_parada > 0",
    "a.chave_parada IS NOT NULL",
    "a.chave_parada <> ''",
  ];
  const params = [];

  if (centro) {
    where.push("a.centro = ?");
    params.push(centro);
  }

  const [rows] = await pool.query(
    `SELECT
       a.linha,
       a.chave_parada AS equipamento,
       COUNT(*) AS qtd_falhas,
       SUM(a.tempo_parada) AS tempo_total,
       pa.status AS plano_status,
       pa.updated_at AS plano_atualizado_em
     FROM apontamentos a
     LEFT JOIN planos_acao pa
       ON pa.centro = a.centro AND pa.linha = a.linha AND pa.equipamento = a.chave_parada
     WHERE ${where.join(" AND ")}
     GROUP BY a.linha, a.chave_parada, pa.status, pa.updated_at
     HAVING tempo_total >= ?
     ORDER BY tempo_total DESC`,
    [...params, LIMITE_ALERTA_MINUTOS]
  );

  return rows.map((r) => ({
    linha: r.linha,
    equipamento: r.equipamento,
    qtd_falhas: Number(r.qtd_falhas),
    tempo_total: Math.round(Number(r.tempo_total) * 100) / 100,
    plano_status: r.plano_status || "sem_plano",
    plano_atualizado_em: r.plano_atualizado_em,
  }));
}

async function getSugestao(centro, linha, equipamento) {
  const where = ["a.linha = ?", "a.chave_parada = ?"];
  const params = [linha, equipamento];

  if (centro) {
    where.splice(0, 0, "a.centro = ?");
    params.unshift(centro);
  }

  const [modos] = await pool.query(
    `SELECT mf.nome_padrao, COUNT(*) AS qtd, SUM(a.tempo_parada) AS tempo
     FROM apontamentos a
     JOIN modos_falha_padrao mf ON mf.id = a.modo_falha_id
     WHERE ${where.join(" AND ")}
     GROUP BY mf.id, mf.nome_padrao
     ORDER BY tempo DESC
     LIMIT 3`,
    params
  );

  const [amostras] = await pool.query(
    `SELECT observacoes FROM apontamentos a
     WHERE ${where.join(" AND ")}
       AND observacoes IS NOT NULL AND observacoes <> ''
     ORDER BY tempo_parada DESC
     LIMIT 5`,
    params
  );

  return {
    modos_falha_predominantes: modos.map((m) => ({
      nome: m.nome_padrao,
      ocorrencias: Number(m.qtd),
      tempo_total: Math.round(Number(m.tempo) * 100) / 100,
    })),
    observacoes_amostra: amostras.map((a) => a.observacoes),
  };
}

module.exports = { getAlertas, getSugestao, LIMITE_ALERTA_MINUTOS };
