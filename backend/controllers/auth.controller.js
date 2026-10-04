const crypto = require("crypto");
const pool = require("../config/db");
const { COOKIE_NAME, createSession, cookieOptions } = require("../middleware/auth");

function sameSecret(value, expected) {
  if (typeof value !== "string" || typeof expected !== "string") return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function listCentros(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT a.centro AS codigo,
              COALESCE(NULLIF(c.unidade, ''), a.centro) AS nome
       FROM apontamentos a
       LEFT JOIN centros c ON c.cod_centro = a.centro
       WHERE a.centro IS NOT NULL AND a.centro <> ''
       ORDER BY nome`
    );
    res.json({ centros: rows.map((r) => ({ codigo: r.codigo.trim(), nome: r.nome.trim() })) });
  } catch (err) {
    console.error("Falha ao consultar centros:", err);
    res.status(500).json({ detail: `Falha ao consultar os centros no banco de dados (${err.code || "erro de consulta"}).` });
  }
}

async function login(req, res) {
  const { usuario, senha, centro } = req.body || {};
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return res.status(503).json({ detail: "Configure ADMIN_USERNAME, ADMIN_PASSWORD e AUTH_SECRET (com pelo menos 32 caracteres) no backend." });
  }
  if (!sameSecret(usuario, process.env.ADMIN_USERNAME) || !sameSecret(senha, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ detail: "Usuário ou senha incorretos." });
  }
  if (!centro) return res.status(400).json({ detail: "Selecione um centro." });
  try {
    const [rows] = await pool.query("SELECT 1 FROM apontamentos WHERE centro = ? LIMIT 1", [centro]);
    if (!rows.length) return res.status(400).json({ detail: "Centro inválido ou sem dados." });
    res.cookie(COOKIE_NAME, createSession(centro), cookieOptions());
    res.json({ usuario: process.env.ADMIN_USERNAME, centro, role: "admin" });
  } catch (err) {
    res.status(500).json({ detail: `Falha ao consultar os centros no banco de dados (${err.code || "erro de consulta"}).` });
  }
}

function me(req, res) {
  res.json({ usuario: process.env.ADMIN_USERNAME, centro: req.user.centro, role: "admin" });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ status: "ok" });
}

module.exports = { listCentros, login, me, logout };
