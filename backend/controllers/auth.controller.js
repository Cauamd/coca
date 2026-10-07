const crypto = require("crypto");
const pool = require("../config/db");
const { COOKIE_NAME, createSession, cookieOptions } = require("../middleware/auth");

async function ensureUsersTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo ENUM('admin', 'gerente') NOT NULL DEFAULT 'gerente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

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
  if (typeof usuario !== "string" || typeof senha !== "string") return res.status(400).json({ detail: "Informe usu\u00e1rio e senha." });
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return res.status(503).json({ detail: "Configure AUTH_SECRET com pelo menos 32 caracteres no backend." });
  }
  if (!centro) return res.status(400).json({ detail: "Selecione um centro." });
  try {
    let account = null;
    if (sameSecret(usuario, process.env.ADMIN_USERNAME) && sameSecret(senha, process.env.ADMIN_PASSWORD)) {
      account = { email: process.env.ADMIN_USERNAME, cargo: "admin" };
    } else {
      await ensureUsersTable();
      const [users] = await pool.query("SELECT email, senha_hash, cargo FROM usuarios WHERE email = ? LIMIT 1", [String(usuario || "").trim().toLowerCase()]);
      if (users.length && verifyPassword(senha, users[0].senha_hash)) account = users[0];
    }
    if (!account) return res.status(401).json({ detail: "Usu\u00e1rio ou senha incorretos." });
    const [rows] = await pool.query("SELECT 1 FROM apontamentos WHERE centro = ? LIMIT 1", [centro]);
    if (!rows.length) return res.status(400).json({ detail: "Centro inválido ou sem dados." });
    res.cookie(COOKIE_NAME, createSession(centro, account.cargo, account.email), cookieOptions());
    res.json({ usuario: account.email, centro, role: account.cargo });
  } catch (err) {
    res.status(500).json({ detail: `Falha ao consultar os centros no banco de dados (${err.code || "erro de consulta"}).` });
  }
}

function me(req, res) {
  res.json({ usuario: req.user.usuario, centro: req.user.centro, role: req.user.role });
}

async function createUser(req, res) {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Somente administradores podem cadastrar usu\u00e1rios." });
  const email = String(req.body?.email || "").trim().toLowerCase();
  const senha = req.body?.senha;
  const cargo = req.body?.cargo;
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ detail: "Informe um e-mail v\u00e1lido." });
  if (typeof senha !== "string" || senha.length < 8) return res.status(400).json({ detail: "A senha deve ter pelo menos 8 caracteres." });
  if (!["admin", "gerente"].includes(cargo)) return res.status(400).json({ detail: "Selecione um cargo v\u00e1lido." });
  try {
    await ensureUsersTable();
    await pool.query("INSERT INTO usuarios (email, senha_hash, cargo) VALUES (?, ?, ?)", [email, hashPassword(senha), cargo]);
    res.status(201).json({ usuario: { email, cargo } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ detail: "J\u00e1 existe um usu\u00e1rio com esse e-mail." });
    console.error("Falha ao cadastrar usu\u00e1rio:", err);
    res.status(500).json({ detail: "N\u00e3o foi poss\u00edvel cadastrar o usu\u00e1rio." });
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ status: "ok" });
}

module.exports = { listCentros, login, me, logout, createUser };
