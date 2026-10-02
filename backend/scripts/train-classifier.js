const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const { KNNTextClassifier } = require("../ai/KNNTextClassifier");

const TRAINING_DIR = path.join(__dirname, "../ai/training-data");
const MODELS_DIR = path.join(__dirname, "../ai/models");

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadFeedbackDoBanco(centro) {
  const [rows] = await pool.query(
    `SELECT f.texto_original AS text, mf.nome_padrao AS label
     FROM feedback_classificacoes_manuais f
     JOIN modos_falha_padrao mf ON mf.id = f.modo_falha_id
     WHERE f.centro = ?`,
    [centro]
  );
  return rows;
}

function trainAndEvaluate(examples) {
  const shuffled = shuffle(examples);
  const splitIndex = Math.floor(shuffled.length * 0.85);
  const trainSet = shuffled.slice(0, splitIndex);
  const testSet = shuffled.slice(splitIndex);

  const clf = new KNNTextClassifier({ k: 5, minSimilarity: 0.3, minAgreement: 0.6 });
  clf.train(trainSet);
  const evalResult = clf.evaluate(testSet);

  const finalClf = new KNNTextClassifier({ k: 5, minSimilarity: 0.3, minAgreement: 0.6 });
  finalClf.train(examples);

  return { model: finalClf, evalResult };
}

// Função principal, reutilizável tanto pelo CLI quanto pelo agendador noturno.
async function runTraining({ log = console.log } = {}) {
  if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });

  const files = fs.readdirSync(TRAINING_DIR).filter((f) => f.endsWith(".json"));
  const report = [];

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(TRAINING_DIR, file), "utf-8"));
    const { centro, examples: staticExamples } = raw;

    const feedbackExamples = await loadFeedbackDoBanco(centro);
    const allExamples = [...staticExamples, ...feedbackExamples];

    log(`[treino] Centro ${centro}: histórico=${staticExamples.length} feedback=${feedbackExamples.length}`);

    const { model, evalResult } = trainAndEvaluate(allExamples);

    const modelPath = path.join(MODELS_DIR, `${centro}.json`);
    fs.writeFileSync(modelPath, JSON.stringify(model.toJSON()));

    log(
      `[treino] Centro ${centro}: cobertura=${(evalResult.cobertura * 100).toFixed(1)}% ` +
      `precisão=${(evalResult.precisaoQuandoResponde * 100).toFixed(1)}% (${evalResult.acertos}/${evalResult.respondeu})`
    );

    report.push({
      centro,
      totalExemplosHistoricos: staticExamples.length,
      totalExemplosFeedback: feedbackExamples.length,
      totalExemplos: allExamples.length,
      coberturaPercent: Math.round(evalResult.cobertura * 10000) / 100,
      precisaoQuandoRespondePercent: Math.round(evalResult.precisaoQuandoResponde * 10000) / 100,
      testados: evalResult.total,
      respondeu: evalResult.respondeu,
      acertos: evalResult.acertos,
      treinadoEm: new Date().toISOString(),
    });
  }

  fs.writeFileSync(path.join(MODELS_DIR, "_report.json"), JSON.stringify(report, null, 2));
  log(`[treino] Concluído. ${report.length} centro(s) retreinado(s).`);

  return report;
}

module.exports = { runTraining };

// Permite continuar rodando via terminal: node scripts/train-classifier.js
if (require.main === module) {
  runTraining()
    .then((report) => {
      console.table(report);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erro no treino:", err);
      process.exit(1);
    });
}