const express = require("express");
const { listCentros, login, me, logout, createUser } = require("../controllers/auth.controller");
const { requireAdmin, requireWriteAccess } = require("../middleware/auth");

const router = express.Router();
router.get("/centros-disponiveis", listCentros);
router.post("/login", login);
router.get("/me", requireAdmin, me);
router.post("/logout", requireAdmin, logout);
router.post("/usuarios", requireAdmin, requireWriteAccess, createUser);
module.exports = router;
