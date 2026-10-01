const pool = require("../config/db");
const { normalizeText, loadDictionary } = require("./classification.service");

// Palavras comuns demais para virarem sugestão de classificação (stopwords técnicas)
const STOPWORDS = new Set([
  "DE", "DA", "DO", "EM", "NO", "NA", "COM", "PARA", "E", "A", "O", "OS", "AS",
  "POR", "SEM", "AO", "AOS", "UM", "UMA", "FOI", "SER", "APOS", "DEVIDO",
]);

async function suggestKeywords({ minOccurrences = 5, limit = 50, centro = null } = {}) {
  const dictionary = await loadDictionary();
  const knownWords = new Set(dictionary.map((d) => d.palavra_normalizada));

  const [rows] = await pool.query(
    `SELECT observacoes FROM apontamentos
     WHERE modo_falha_id IS NULL AND observacoes IS NOT NULL AND observacoes <> ''${centro ? " AND centro = ?" : ""}`,
    centro ? [centro] : []
  );

  // Conta frequência de cada palavra (e de bigramas — pares de palavras
  // consecutivas, que capturam termos compostos como "FALHA SENSOR")
  const wordFreq = new Map();
  const bigramFreq = new Map();

  for (const row of rows) {
    const words = normalizeText(row.observacoes)
      .split(" ")
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w) && isNaN(Number(w)));

    for (const w of words) {
      if (knownWords.has(w)) continue; // já está no dicionário, não sugere de novo
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
    }
  }

  const wordSuggestions = [...wordFreq.entries()]
    .filter(([, count]) => count >= minOccurrences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([termo, ocorrencias]) => ({ termo, ocorrencias, tipo: "palavra" }));

  const bigramSuggestions = [...bigramFreq.entries()]
    .filter(([, count]) => count >= minOccurrences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([termo, ocorrencias]) => ({ termo, ocorrencias, tipo: "expressão" }));

  return {
    total_nao_classificados: rows.length,
    sugestoes_palavras: wordSuggestions,
    sugestoes_expressoes: bigramSuggestions,
  };
}

module.exports = { suggestKeywords };
