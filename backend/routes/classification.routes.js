const express = require("express");
const {
  reclassifyAll,
  retestAI,
  getRetestStatus,
  getModosFalha,
  createModoFalha,
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
router.post("/ia/retestar", requireWriteAccess, retestAI);
router.get("/ia/retestar/:jobId", requireWriteAccess, getRetestStatus);
router.get("/modos-falha", getModosFalha);
router.post("/modos-falha", requireWriteAccess, createModoFalha);
router.post("/palavras-chave", requireWriteAccess, addPalavraChave);
router.patch("/apontamentos/:id", requireWriteAccess, updateClassificacaoManual);
router.get("/sugestoes", getSuggestions);
router.get("/ia/precisao", getModelReport);
router.get("/feedback/contagem", getFeedbackContagem);
router.post("/ia/retreinar-agora", requireWriteAccess, forcarRetreino);

module.exports = router;
