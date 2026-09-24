const express = require("express");
const multer = require("multer");
const {
  uploadApontamentos,
  listApontamentos,
  getFiltros,
  exportApontamentos,
} = require("../controllers/apontamentos.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), uploadApontamentos);
router.get("/export", exportApontamentos);
router.get("/filtros", getFiltros);
router.get("/", listApontamentos);

module.exports = router;
