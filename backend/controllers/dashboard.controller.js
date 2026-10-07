const pool = require("../config/db")

const { predictEquipmentTrend } = require("../services/prediction.service");

// ============================================
// PARETO POR MODO DE FALHA
// ============================================

async function getParetoModoFalha(req, res) {
  const { linha, data_inicio, data_fim } = req.query;
  const centro = req.user?.centro;

  const where = ["a.tempo_parada > 0", "mf.id IS NOT NULL"];
  const params = [];

  if (centro) {
    where.push("a.centro = ?");
    params.push(centro);
  }
  if (linha) {
    where.push("a.linha = ?");
    params.push(linha);
  }
  if (data_inicio) {
    where.push("a.data_inicio >= ?");
    params.push(`${data_inicio} 00:00:00`);
  }
  if (data_fim) {
    where.push("a.data_inicio <= ?");
    params.push(`${data_fim} 23:59:59`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const [rows] = await pool.query(
      `SELECT
         mf.nome_padrao AS modo_falha,
         COUNT(*) AS qtd_falhas,
         SUM(a.tempo_parada) AS tempo_total
       FROM apontamentos a
       JOIN modos_falha_padrao mf ON mf.id = a.modo_falha_id
       ${whereClause}
       GROUP BY mf.id, mf.nome_padrao
       ORDER BY tempo_total DESC`,
      params
    );

    const [naoClassificadoRows] = await pool.query(
      `SELECT COUNT(*) AS qtd, COALESCE(SUM(a.tempo_parada), 0) AS tempo
       FROM apontamentos a
       WHERE a.modo_falha_id IS NULL AND a.tempo_parada > 0
       ${centro ? "AND a.centro = ?" : ""}
       ${linha ? "AND a.linha = ?" : ""}`,
      [...(centro ? [centro] : []), ...(linha ? [linha] : [])]
    );

    const totalGeral = rows.reduce((sum, r) => sum + Number(r.tempo_total), 0);

    let acumulado = 0;
    const pareto = rows.map((r) => {
      const tempo = Number(r.tempo_total);
      acumulado += tempo;
      return {
        modo_falha: r.modo_falha,
        qtd_falhas: Number(r.qtd_falhas),
        tempo_total: Math.round(tempo * 100) / 100,
        percentual: totalGeral ? Math.round((tempo / totalGeral) * 10000) / 100 : 0,
        percentual_acumulado: totalGeral ? Math.round((acumulado / totalGeral) * 10000) / 100 : 0,
      };
    });

    res.json({
      pareto,
      nao_classificados: {
        qtd_falhas: naoClassificadoRows[0].qtd,
        tempo_total: Number(naoClassificadoRows[0].tempo),
      },
      total_tempo_parada: Math.round(totalGeral * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao gerar Pareto: ${err.message}` });
  }
}

// ============================================
// JACK-KNIFE (CRÍTICO-CRÔNICO)
// ============================================

function calcularMediana(valores) {
  if (valores.length === 0) return 0;
  const sorted = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function categorizar(q, mttr, limiteQ, limiteMttr) {
  const altaFrequencia = q >= limiteQ;
  const altoImpacto = mttr >= limiteMttr;

  if (altaFrequencia && altoImpacto) return "CRÍTICO-CRÔNICO";
  if (!altaFrequencia && altoImpacto) return "CRÍTICO";
  if (altaFrequencia && !altoImpacto) return "CRÔNICO";
  return "CONFORTO";
}

async function getJackKnife(req, res) {
  const { linha, data_inicio, data_fim, limite_q, limite_mttr } = req.query;
  const centro = req.user?.centro;

  const where = ["a.tempo_parada > 0", "a.chave_parada IS NOT NULL", "a.chave_parada <> ''"];
  const params = [];

  if (centro) {
    where.push("a.centro = ?");
    params.push(centro);
  }
  if (linha) {
    where.push("a.linha = ?");
    params.push(linha);
  }
  if (data_inicio) {
    where.push("a.data_inicio >= ?");
    params.push(`${data_inicio} 00:00:00`);
  }
  if (data_fim) {
    where.push("a.data_inicio <= ?");
    params.push(`${data_fim} 23:59:59`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const [rows] = await pool.query(
      `SELECT
         a.linha,
         a.chave_parada AS equipamento,
         COUNT(*) AS q,
         SUM(a.tempo_parada) AS tempo_total
       FROM apontamentos a
       ${whereClause}
       GROUP BY a.linha, a.chave_parada
       ORDER BY tempo_total DESC`,
      params
    );

    const pontos = rows.map((r) => ({
      linha: r.linha,
      equipamento: r.equipamento,
      q: Number(r.q),
      tempo_total: Math.round(Number(r.tempo_total) * 100) / 100,
      mttr: Math.round((Number(r.tempo_total) / Number(r.q)) * 100) / 100,
    }));

    const limiteQFinal = limite_q ? Number(limite_q) : calcularMediana(pontos.map((p) => p.q));
    const limiteMttrFinal = limite_mttr
      ? Number(limite_mttr)
      : calcularMediana(pontos.map((p) => p.mttr));

    const pontosClassificados = pontos.map((p) => ({
      ...p,
      categoria: categorizar(p.q, p.mttr, limiteQFinal, limiteMttrFinal),
    }));

    res.json({
      pontos: pontosClassificados,
      limites: {
        limite_q: Math.round(limiteQFinal * 100) / 100,
        limite_mttr: Math.round(limiteMttrFinal * 100) / 100,
      },
    });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao gerar Jack-Knife: ${err.message}` });
  }
}

// Lista de equipamentos disponíveis para o seletor, com contagem básica
async function getEquipamentosDisponiveis(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT linha, chave_parada AS equipamento, COUNT(*) AS qtd_falhas, SUM(tempo_parada) AS tempo_total
       FROM apontamentos
       WHERE centro = ? AND tempo_parada > 0 AND chave_parada IS NOT NULL AND chave_parada <> ''
       GROUP BY linha, chave_parada
       ORDER BY tempo_total DESC`,
      [req.user.centro]
    );

    res.json(rows.map((r) => ({
      linha: r.linha,
      equipamento: r.equipamento,
      qtd_falhas: Number(r.qtd_falhas),
      tempo_total: Math.round(Number(r.tempo_total) * 100) / 100,
    })));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

// Evolução mensal de 1 ou mais equipamentos (para comparação) + previsão
async function getEvolucaoEquipamentos(req, res) {
  const { equipamentos, linha, meses = "12" } = req.query;

  if (!equipamentos) {
    return res.status(400).json({ detail: "Informe ao menos um equipamento (?equipamentos=A,B)." });
  }

  const listaEquipamentos = equipamentos.split(",").map((e) => e.trim()).filter(Boolean);
  const mesesNum = Math.min(Math.max(parseInt(meses, 10) || 12, 3), 36);

  try {
    const resultado = [];

    for (const equipamento of listaEquipamentos) {
      const where = ["centro = ?", "chave_parada = ?", "tempo_parada > 0", "data_inicio IS NOT NULL"];
      const params = [req.user.centro, equipamento];

      if (linha) {
        where.push("linha = ?");
        params.push(linha);
      }

      const [rows] = await pool.query(
        `SELECT
           DATE_FORMAT(data_inicio, '%Y-%m') AS periodo,
           COUNT(*) AS qtd_falhas,
           SUM(tempo_parada) AS tempo_total
         FROM apontamentos
         WHERE ${where.join(" AND ")}
           AND data_inicio >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         GROUP BY periodo
         ORDER BY periodo ASC`,
        [...params, mesesNum]
      );

      const pontos = rows.map((r) => ({
        periodo: r.periodo,
        qtd_falhas: Number(r.qtd_falhas),
        tempo_total: Math.round(Number(r.tempo_total) * 100) / 100,
        mttr: Math.round((Number(r.tempo_total) / Number(r.qtd_falhas)) * 100) / 100,
      }));

      // Previsão baseada na série de tempo_total (o que mais importa: minutos parados)
      const serieTempo = pontos.map((p) => p.tempo_total);
      const previsaoTempo = predictEquipmentTrend(serieTempo);

      const serieFalhas = pontos.map((p) => p.qtd_falhas);
      const previsaoFalhas = predictEquipmentTrend(serieFalhas);

      resultado.push({
        equipamento,
        linha: rows[0]?.linha || linha || null,
        pontos,
        previsao: {
          tempoParado: previsaoTempo,
          qtdFalhas: previsaoFalhas,
        },
      });
    }

    res.json({ series: resultado, periodoMeses: mesesNum });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao calcular evolução: ${err.message}` });
  }
}

module.exports = {
  getParetoModoFalha,
  getJackKnife,
  getEquipamentosDisponiveis,
  getEvolucaoEquipamentos,
};
