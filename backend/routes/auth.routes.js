const express = require("express");
const { listCentros, login, me, logout } = require("../controllers/auth.controller");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.get("/centros", listCentros);
router.post("/login", login);
router.get("/me", requireAdmin, me);
router.post("/logout", requireAdmin, logout);
module.exports = router;
