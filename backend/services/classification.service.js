const pool = require("../config/db");
const { classifyWithAI } = require("./ai-classification.service");

function normalizeText(text) {
  if (!text) return "";
  return text
    .toString()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDictionaryWithRegex(dictionary) {
  return dictionary.map((entry) => ({
    ...entry,
    regex: new RegExp(`\\b${escapeRegex(entry.palavra_normalizada)}\\b`, "i"),
  }));
}

async function loadDictionary() {
  const [rows] = await pool.query(`
    SELECT pc.id, pc.palavra_chave, pc.prioridade, mf.id AS modo_falha_id, mf.nome_padrao
    FROM palavras_chave_classificacao pc
    JOIN modos_falha_padrao mf ON mf.id = pc.modo_falha_id
    WHERE mf.ativo = TRUE
    ORDER BY pc.prioridade DESC, LENGTH(pc.palavra_chave) DESC
  `);
  const withNormalized = rows.map((r) => ({
    ...r,
    palavra_normalizada: normalizeText(r.palavra_chave),
  }));
  return buildDictionaryWithRegex(withNormalized);
}

async function loadModesByNormalizedName() {
  const [rows] = await pool.query(`
    SELECT id, nome_padrao
    FROM modos_falha_padrao
    WHERE ativo = TRUE
  `);
  return new Map(rows.map((row) => [normalizeText(row.nome_padrao), row.id]));
}

function classify(observacaoTexto, dictionary) {
  const normalized = normalizeText(observacaoTexto);
  if (!normalized) return null;

  for (const entry of dictionary) {
    if (entry.regex.test(normalized)) {
      return entry.modo_falha_id;
    }
  }
  return null;
}

async function classifyAllPending({ forceAll = false, centro = null } = {}) {
  const [dictionary, modesByName] = await Promise.all([
    loadDictionary(),
    loadModesByNormalizedName(),
  ]);

  const conditions = [];
  if (!forceAll) conditions.push("modo_falha_id IS NULL");
  else conditions.push("(origem_classificacao IS NULL OR origem_classificacao <> 'manual')");
  if (centro) conditions.push("centro = ?");
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT id, centro, observacoes FROM apontamentos ${whereClause}`,
    centro ? [centro] : []
  );

  let classified = 0;
  let classifiedByAI = 0;
  const BATCH_SIZE = 500;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const updates = batch
      .map((row) => {
        const modoFalhaId = classify(row.observacoes, dictionary);
        if (modoFalhaId) {
          return { id: row.id, modoFalhaId, origem: "palavra_chave" };
        }

        try {
          const prediction = classifyWithAI(row.observacoes, row.centro);
          const predictedModeId = prediction?.label
            ? modesByName.get(normalizeText(prediction.label))
            : null;
          return predictedModeId
            ? { id: row.id, modoFalhaId: predictedModeId, origem: "ia" }
            : null;
        } catch (error) {
          console.error(`Erro ao classificar apontamento ${row.id} com IA:`, error.message);
          return null;
        }
      })
      .filter(Boolean);

    if (updates.length === 0) continue;

    const ids = updates.map((u) => u.id);
    const caseSql = updates
      .map((u) => `WHEN ${u.id} THEN ${u.modoFalhaId}`)
      .join(" ");
    const originCaseSql = updates
      .map((u) => `WHEN ${u.id} THEN '${u.origem}'`)
      .join(" ");

    await pool.query(
      `UPDATE apontamentos
       SET modo_falha_id = CASE id ${caseSql} END,
           origem_classificacao = CASE id ${originCaseSql} END
       WHERE id IN (${ids.join(",")})${centro ? " AND centro = ?" : ""}`,
      centro ? [centro] : []
    );

    classified += updates.length;
    classifiedByAI += updates.filter((u) => u.origem === "ia").length;
  }

  return {
    totalAnalisado: rows.length,
    totalClassificado: classified,
    totalClassificadoIA: classifiedByAI,
  };
}

module.exports = { classify, loadDictionary, classifyAllPending, normalizeText };
