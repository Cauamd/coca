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

// Escapa caracteres especiais de regex na palavra-chave
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Constrói um regex com \b (word boundary), para "ROLAMENTO" não bater
// dentro de "ENROLAMENTO", e cacheia o regex no próprio item do dicionário
function buildDictionaryWithRegex(dictionary) {
  return dictionary.map((entry) => ({
    ...entry,
    regex: new RegExp(`\\b${escapeRegex(entry.palavra_normalizada)}\\b`, "i"),
  }));
}

function classify(observacaoTexto, dictionary) {
  const normalized = normalizeText(observacaoTexto);
  if (!normalized) return null;

  // dictionary já vem ordenado por prioridade DESC, depois por
  // comprimento da palavra-chave DESC (termos mais específicos primeiro)
  for (const entry of dictionary) {
    if (entry.regex.test(normalized)) {
      return entry.modo_falha_id;
    }
  }
  return null;
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