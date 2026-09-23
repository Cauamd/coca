const { suggestKeywords } = require("../services/suggestion.service");

async function getSuggestions(req, res) {
  const minOccurrences = req.query.min ? parseInt(req.query.min, 10) : 5;
  try {
    const result = await suggestKeywords({ minOccurrences });
    res.json(result);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = {
  reclassifyAll,
  getModosFalha,
  addPalavraChave,
  updateClassificacaoManual,
  getSuggestions, // 👈 novo
};