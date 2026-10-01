const pool = require("../config/db");
const { parseExcelBuffer } = require("../services/excelImport.service");
const { classifyAllPending } = require("../services/classification.service");
const { buildApontamentosWorkbook } = require("../services/export.service");

const BATCH_SIZE = 1000;

const ALLOWED_SORT_FIELDS = new Set([
  "data_inicio", "centro", "linha", "tipo_parada", "tempo_parada", "ordem",
]);

async function uploadApontamentos(req, res) {
  if (!req.file) {
    return res.status(400).json({ detail: "Nenhum arquivo enviado." });
  }

  if (!req.file.originalname.match(/\.xlsx$|\.xlsm$/)) {
    return res.status(400).json({ detail: "Envie um arquivo .xlsx ou .xlsm" });
  }

  let rows;
  try {
    rows = parseExcelBuffer(req.file.buffer, "Apontamentos de Falha KOFBR");
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }

  if (rows.some((row) => row[0] !== req.user?.centro)) {
    return res.status(403).json({ detail: "A planilha contém registros de um centro diferente do centro selecionado no login." });
  }

  const insertSql = `
    INSERT INTO apontamentos
      (centro, linha, ordem, material, descricao_material, data_inicio,
       turno, intervalo, tipo_parada, chave_parada, subchave_parada,
       chave1_parada, observacoes, perc_eficiencia_perdida, pontos_acumulados,
       caixas_produzidas, total_minutos, tempo_parada)
    VALUES ?
  `;

  const connection = await pool.getConnection();
  let inserted = 0;

  try {
    await connection.beginTransaction();

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const [result] = await connection.query(insertSql, [batch]);
      inserted += result.affectedRows;
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({ detail: `Erro ao inserir no banco: ${err.message}` });
  } finally {
    connection.release();
  }

  const classificacao = await classifyAllPending({ forceAll: false, centro: req.user?.centro });

  return res.json({
    status: "sucesso",
    linhas_processadas: rows.length,
    linhas_inseridas: inserted,
    classificacao,
  });
}

function buildWhereClause(query, centroSessao) {
  const {
    centro, linha, tipo_parada, equipamento, turno,
    data_inicio, data_fim, busca,
    apenas_validos = "true",
  } = query;

  const where = [];
  const params = [];

  const validClause = `
    a.centro IS NOT NULL AND a.centro <> ''
    AND a.ordem IS NOT NULL AND a.ordem <> ''
    AND a.linha IS NOT NULL AND a.linha <> ''
    AND a.data_inicio IS NOT NULL
    AND a.tempo_parada IS NOT NULL AND a.tempo_parada > 0
  `;

  if (apenas_validos === "true") {
    where.push(validClause);
  } else {
    where.push(`NOT (${validClause})`);
  }

  if (centroSessao) { where.push("a.centro = ?"); params.push(centroSessao); }
  if (linha) { where.push("a.linha = ?"); params.push(linha); }
  if (tipo_parada) { where.push("a.tipo_parada = ?"); params.push(tipo_parada); }
  if (equipamento) { where.push("a.chave_parada = ?"); params.push(equipamento); }
  if (turno) { where.push("a.turno = ?"); params.push(parseInt(turno, 10)); }
  if (data_inicio) { where.push("a.data_inicio >= ?"); params.push(`${data_inicio} 00:00:00`); }
  if (data_fim) { where.push("a.data_inicio <= ?"); params.push(`${data_fim} 23:59:59`); }
  if (busca) {
    where.push("(a.observacoes LIKE ? OR a.descricao_material LIKE ?)");
    params.push(`%${busca}%`, `%${busca}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereClause, params };
}

async function listApontamentos(req, res) {
  const {
    page = "1",
    pageSize = "50",
    orderBy = "data_inicio",
    orderDir = "desc",
  } = req.query;

  const { whereClause, params } = buildWhereClause(req.query, req.user?.centro);

  const sortField = ALLOWED_SORT_FIELDS.has(orderBy) ? orderBy : "data_inicio";
  const sortDir = orderDir.toLowerCase() === "asc" ? "ASC" : "DESC";

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 50, 1), 200);
  const offset = (pageNum - 1) * pageSizeNum;

  try {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM apontamentos a ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT a.id, a.centro, a.linha, a.ordem, a.material, a.descricao_material,
              a.data_inicio, a.turno, a.intervalo, a.tipo_parada, a.chave_parada,
              a.subchave_parada, a.observacoes, a.tempo_parada, a.total_minutos,
              mf.nome_padrao AS modo_falha_padrao
       FROM apontamentos a
       LEFT JOIN modos_falha_padrao mf ON mf.id = a.modo_falha_id
       ${whereClause}
       ORDER BY a.${sortField} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, pageSizeNum, offset]
    );

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao consultar dados: ${err.message}` });
  }
}

async function getFiltros(req, res) {
  try {
    const centro = req.user?.centro;
    const [centros] = await pool.query(
      "SELECT DISTINCT centro FROM apontamentos WHERE centro = ? ORDER BY centro", [centro]
    );
    const [linhas] = await pool.query(
      "SELECT DISTINCT linha FROM apontamentos WHERE centro = ? AND linha IS NOT NULL AND linha <> '' ORDER BY linha", [centro]
    );
    const [tipos] = await pool.query(
      "SELECT DISTINCT tipo_parada FROM apontamentos WHERE centro = ? AND tipo_parada IS NOT NULL AND tipo_parada <> '' ORDER BY tipo_parada", [centro]
    );

    res.json({
      centros: centros.map((r) => r.centro),
      linhas: linhas.map((r) => r.linha),
      tipos_parada: tipos.map((r) => r.tipo_parada),
    });
  } catch (err) {
    res.status(500).json({ detail: `Erro ao buscar filtros: ${err.message}` });
  }
}

async function exportApontamentos(req, res) {
  const { whereClause, params } = buildWhereClause(req.query, req.user?.centro);

  // Limite de segurança: exportações muito grandes travam o navegador do usuário.
  const MAX_EXPORT_ROWS = 50000;

  try {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM apontamentos a ${whereClause}`,
      params
    );
    if (countRows[0].total > MAX_EXPORT_ROWS) {
      return res.status(400).json({
        detail: `A exportação tem ${countRows[0].total.toLocaleString("pt-BR")} registros, acima do limite de ${MAX_EXPORT_ROWS.toLocaleString("pt-BR")}. Refine os filtros (período, centro ou linha) antes de exportar.`,
      });
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.centro, a.linha, a.ordem, a.material, a.descricao_material,
              a.data_inicio, a.turno, a.intervalo, a.tipo_parada, a.chave_parada,
              a.subchave_parada, a.observacoes, a.tempo_parada, a.total_minutos,
              mf.nome_padrao AS modo_falha_padrao
       FROM apontamentos a
       LEFT JOIN modos_falha_padrao mf ON mf.id = a.modo_falha_id
       ${whereClause}
       ORDER BY a.data_inicio DESC`,
      params
    );

    const workbook = await buildApontamentosWorkbook(rows);

    const filename = `apontamentos_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ detail: `Erro ao exportar: ${err.message}` });
  }
}

module.exports = {
  uploadApontamentos,
  listApontamentos,
  getFiltros,
  exportApontamentos,
};
