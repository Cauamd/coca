const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const SEED_PATH = path.join(__dirname, "../seeds/classificacao-marilia-seed.json");

async function main() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
  console.log(`Classes: ${seed.classes.length} | Histórico: ${seed.historico.length} | Keywords: ${seed.keywords.length}`);

  // 1. Insere os 440 modos de falha (ignora os que já existirem pelo nome)
  console.log("Inserindo modos de falha...");
  for (const nome of seed.classes) {
    await pool.query(
      "INSERT INTO modos_falha_padrao (nome_padrao, categoria) VALUES (?, 'IMPORTADO') ON DUPLICATE KEY UPDATE nome_padrao = nome_padrao",
      [nome]
    );
  }

  // 2. Carrega o mapa nome -> id
  const [rows] = await pool.query("SELECT id, nome_padrao FROM modos_falha_padrao");
  const idByName = new Map(rows.map((r) => [r.nome_padrao, r.id]));

  // 3. Insere o histórico de correspondência exata, em lotes
  console.log("Inserindo histórico de correspondência exata...");
  const BATCH = 500;
  let historicoInserted = 0;

  for (let i = 0; i < seed.historico.length; i += BATCH) {
    const batch = seed.historico.slice(i, i + BATCH);
    const values = batch
      .map((h) => {
        const modoId = idByName.get(h.classe);
        return modoId ? [h.observacao_normalizada, modoId] : null;
      })
      .filter(Boolean);

    if (values.length === 0) continue;

    await pool.query(
      `INSERT INTO historico_classificacoes (observacao_normalizada, modo_falha_id)
       VALUES ?
       ON DUPLICATE KEY UPDATE modo_falha_id = VALUES(modo_falha_id)`,
      [values]
    );
    historicoInserted += values.length;
  }
  console.log(`Histórico inserido: ${historicoInserted}`);

  // 4. Insere as palavras-chave mineradas, evitando duplicar (mesma classe + mesmo termo)
  console.log("Inserindo palavras-chave...");
  const [existingKeywords] = await pool.query(
    "SELECT modo_falha_id, palavra_chave FROM palavras_chave_classificacao"
  );
  const existingSet = new Set(existingKeywords.map((k) => `${k.modo_falha_id}::${k.palavra_chave}`));

  let keywordsInserted = 0;
  for (const kw of seed.keywords) {
    const modoId = idByName.get(kw.classe);
    if (!modoId) continue;

    const key = `${modoId}::${kw.termo}`;
    if (existingSet.has(key)) continue;

    await pool.query(
      "INSERT INTO palavras_chave_classificacao (modo_falha_id, palavra_chave, prioridade) VALUES (?, ?, ?)",
      [modoId, kw.termo, kw.prioridade]
    );
    existingSet.add(key);
    keywordsInserted++;
  }
  console.log(`Palavras-chave inseridas: ${keywordsInserted}`);

  console.log("Seed concluído com sucesso.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});