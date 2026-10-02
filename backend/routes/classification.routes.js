const express = require("express");
const {
  reclassifyAll,
  getModosFalha,
  addPalavraChave,
  updateClassificacaoManual,
  getSuggestions,
  getModelReport,
  getFeedbackContagem,
  forcarRetreino,
} = require("../controllers/classification.controller");

const router = express.Router();

router.post("/reclassificar", reclassifyAll);
router.get("/modos-falha", getModosFalha);
router.post("/palavras-chave", addPalavraChave);
router.patch("/apontamentos/:id", updateClassificacaoManual);
router.get("/sugestoes", getSuggestions);
router.get("/ia/precisao", getModelReport);
router.get("/feedback/contagem", getFeedbackContagem);
router.post("/ia/retreinar-agora", forcarRetreino);

module.exports = router;
