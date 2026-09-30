const express = require("express");
const { listAlertas, getPlano, savePlano } = require("../controllers/alerts.controller");

const router = express.Router();

router.get("/", listAlertas);
router.get("/:linha/:equipamento", getPlano);
router.put("/:linha/:equipamento", savePlano);

module.exports = router;