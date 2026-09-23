const express = require("express");
const {
  reclassifyAll,
  getModosFalha,
  addPalavraChave,
  updateClassificacaoManual,
  getSuggestions,
} = require("../controllers/classification.controller");

const router = express.Router();

router.post("/reclassificar", reclassifyAll);
router.get("/modos-falha", getModosFalha);
router.post("/palavras-chave", addPalavraChave);
router.patch("/apontamentos/:id", updateClassificacaoManual);
router.get("/sugestoes", getSuggestions);

module.exports = router;