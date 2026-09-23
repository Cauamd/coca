const express = require("express");
const { getParetoModoFalha, getJackKnife } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/pareto-modo-falha", getParetoModoFalha);
router.get("/jack-knife", getJackKnife);

module.exports = router;