const express = require("express");
const { listAlertas, getPlano, savePlano } = require("../controllers/alerts.controller");

const router = express.Router();
const { requireWriteAccess } = require("../middleware/auth");

router.get("/", listAlertas);
router.get("/:linha/:equipamento", getPlano);
router.put("/:linha/:equipamento", requireWriteAccess, savePlano);

module.exports = router;
