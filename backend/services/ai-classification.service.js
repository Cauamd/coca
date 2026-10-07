const fs = require("fs");
const path = require("path");
const { KNNTextClassifier } = require("../ai/KNNTextClassifier");

const MODELS_DIR = path.join(__dirname, "../ai/models");
const modelCache = new Map();

function loadModel(centro) {
  if (modelCache.has(centro)) return modelCache.get(centro);

  const modelPath = path.join(MODELS_DIR, `${centro}.json`);
  if (!fs.existsSync(modelPath)) {
    modelCache.set(centro, null);
    return null;
  }

  const json = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
  const clf = KNNTextClassifier.fromJSON(json);
  modelCache.set(centro, clf);
  return clf;
}

// Agora retorna também os exemplos comparados (matches), para total transparência
function classifyWithAI(observacaoTexto, centro) {
  const model = loadModel(centro);
  if (!model) return null;

  const result = model.predict(observacaoTexto);
  if (!result.label) return null;

  return {
    label: result.label,
    confidence: result.confidence,
    agreement: result.agreement,
    motivo: result.motivo,
    matches: result.matches, // todos os exemplos que participaram da votação
  };
}

function invalidateModel(centro) {
  modelCache.delete(centro);
}

function getReport() {
  const reportPath = path.join(MODELS_DIR, "_report.json");
  if (!fs.existsSync(reportPath)) return [];
  return JSON.parse(fs.readFileSync(reportPath, "utf-8"));
}

module.exports = { classifyWithAI, getReport, invalidateModel };
