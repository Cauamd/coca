const express = require("express");
const {
  getParetoModoFalha,
  getJackKnife,
  getEquipamentosDisponiveis,
  getEvolucaoEquipamentos,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/pareto-modo-falha", getParetoModoFalha);
router.get("/jack-knife", getJackKnife);
router.get("/equipamentos", getEquipamentosDisponiveis);
router.get("/evolucao", getEvolucaoEquipamentos);

module.exports = router;