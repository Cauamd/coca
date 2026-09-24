const pool = require("../config/db");

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

async function classifyAllPending({ forceAll = false } = {}) {
  const dictionary = await loadDictionary();

  const whereClause = forceAll ? "" : "WHERE modo_falha_id IS NULL";

  const [rows] = await pool.query(
    `SELECT id, observacoes FROM apontamentos ${whereClause}`
  );

  let classified = 0;
  const BATCH_SIZE = 500;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const updates = batch
      .map((row) => {
        const modoFalhaId = classify(row.observacoes, dictionary);
        return modoFalhaId ? { id: row.id, modoFalhaId } : null;
      })
      .filter(Boolean);

    if (updates.length === 0) continue;

    const ids = updates.map((u) => u.id);
    const caseSql = updates
      .map((u) => `WHEN ${u.id} THEN ${u.modoFalhaId}`)
      .join(" ");

    await pool.query(
      `UPDATE apontamentos
       SET modo_falha_id = CASE id ${caseSql} END
       WHERE id IN (${ids.join(",")})`
    );

    classified += updates.length;
  }

  return { totalAnalisado: rows.length, totalClassificado: classified };
}

module.exports = { classify, loadDictionary, classifyAllPending, normalizeText };
