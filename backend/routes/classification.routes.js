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
const { requireWriteAccess } = require("../middleware/auth");

router.post("/reclassificar", requireWriteAccess, reclassifyAll);
router.get("/modos-falha", getModosFalha);
router.post("/palavras-chave", requireWriteAccess, addPalavraChave);
router.patch("/apontamentos/:id", requireWriteAccess, updateClassificacaoManual);
router.get("/sugestoes", getSuggestions);
router.get("/ia/precisao", getModelReport);
router.get("/feedback/contagem", getFeedbackContagem);
router.post("/ia/retreinar-agora", requireWriteAccess, forcarRetreino);

module.exports = router;
