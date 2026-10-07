const crypto = require("crypto");

const COOKIE_NAME = "coca_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function sign(value) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET precisa ter pelo menos 32 caracteres.");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createSession(centro, role = "admin", usuario = "admin") {
  const payload = Buffer.from(JSON.stringify({ centro, role, usuario, exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSession(token) {
  if (!token || !process.env.AUTH_SECRET) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.exp > Date.now() && session.centro ? session : null;
  } catch {
    return null;
  }
}

function cookieOptions() {
  return { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS * 1000 };
}

function requireAdmin(req, res, next) {
  const token = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const session = readSession(token);
  if (!session) return res.status(401).json({ detail: "Acesso restrito a administradores. Faça login." });
  req.user = { role: session.role || "admin", usuario: session.usuario || process.env.ADMIN_USERNAME, centro: session.centro };
  next();
}

function requireWriteAccess(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ detail: "Seu perfil tem acesso somente para visualiza\u00e7\u00e3o." });
  next();
}

module.exports = { COOKIE_NAME, SESSION_SECONDS, createSession, cookieOptions, requireAdmin, requireWriteAccess };
