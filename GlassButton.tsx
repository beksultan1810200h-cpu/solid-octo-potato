const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { pool } = require("./db");
const { sendVerificationCode } = require("./mailer");

const JWT_SECRET = () => process.env.JWT_SECRET || "change-me-in-render-env";
const COOKIE = "bb_token";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
  niche: z.enum(["stroyka", "sushi", "clothes", "tech"]).default("stroyka"),
});

function genCode() {
  // 6-character random alphanumeric (upper + digits)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function signToken(user) {
  return jwt.sign({ uid: user.id, username: user.username }, JWT_SECRET(), {
    expiresIn: "30d",
  });
}

function setCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Проверьте поля формы" });
  const { username, email, password, niche } = parsed.data;

  const exists = await pool.query(
    "SELECT id FROM users WHERE email=$1 OR username=$2",
    [email.toLowerCase(), username],
  );
  if (exists.rowCount) return res.status(409).json({ error: "Логин или email уже заняты" });

  const hash = await bcrypt.hash(password, 12);
  const ins = await pool.query(
    `INSERT INTO users(email, username, password_hash, niche)
     VALUES($1,$2,$3,$4) RETURNING id`,
    [email.toLowerCase(), username, hash, niche],
  );
  const userId = ins.rows[0].id;

  const code = genCode();
  await pool.query(
    `INSERT INTO verify_codes(user_id, code, expires_at)
     VALUES($1,$2, NOW() + interval '15 minutes')`,
    [userId, code],
  );
  try {
    await sendVerificationCode(code, email, username);
  } catch (e) {
    console.error("[mail] failed", e.message);
    return res.status(500).json({ error: "Не удалось отправить код. Проверьте настройки почты." });
  }
  res.json({ ok: true, userId });
}

const verifySchema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().trim().length(6),
  plan: z.enum(["1m", "1y"]),
});

async function verify(req, res) {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Введите корректный код и срок" });
  const { userId, code, plan } = parsed.data;

  const rec = await pool.query(
    `SELECT * FROM verify_codes WHERE user_id=$1 ORDER BY id DESC LIMIT 1`,
    [userId],
  );
  if (!rec.rowCount) return res.status(400).json({ error: "Код не найден, повторите регистрацию" });
  const row = rec.rows[0];
  if (row.attempts >= 5) return res.status(429).json({ error: "Слишком много попыток" });
  if (new Date(row.expires_at) < new Date())
    return res.status(400).json({ error: "Код истёк" });
  if (row.code !== code.toUpperCase()) {
    await pool.query("UPDATE verify_codes SET attempts=attempts+1 WHERE id=$1", [row.id]);
    return res.status(400).json({ error: "Неверный код" });
  }

  const interval = plan === "1y" ? "1 year" : "1 month";
  const upd = await pool.query(
    `UPDATE users SET verified=TRUE, plan=$2, expires_at=NOW() + interval '${interval}'
     WHERE id=$1 RETURNING *`,
    [userId, plan],
  );
  await pool.query("DELETE FROM verify_codes WHERE user_id=$1", [userId]);

  const user = upd.rows[0];
  setCookie(res, signToken(user));
  res.json({ ok: true, expiresAt: user.expires_at });
}

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Введите логин и пароль" });
  const { username, password } = parsed.data;

  const q = await pool.query(
    "SELECT * FROM users WHERE username=$1 OR email=$1",
    [username.toLowerCase()],
  );
  if (!q.rowCount) return res.status(401).json({ error: "Неверный логин или пароль" });
  const user = q.rows[0];

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Неверный логин или пароль" });
  if (!user.verified) return res.status(403).json({ error: "Аккаунт не подтверждён" });
  if (user.expires_at && new Date(user.expires_at) < new Date())
    return res.status(403).json({ error: "Срок действия аккаунта истёк" });

  setCookie(res, signToken(user));
  res.json({ ok: true, username: user.username, expiresAt: user.expires_at });
}

function logout(req, res) {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
}

function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Требуется вход" });
  try {
    req.user = jwt.verify(token, JWT_SECRET());
    next();
  } catch {
    res.status(401).json({ error: "Сессия истекла" });
  }
}

async function me(req, res) {
  const q = await pool.query(
    "SELECT id, username, email, niche, plan, expires_at FROM users WHERE id=$1",
    [req.user.uid],
  );
  if (!q.rowCount) return res.status(401).json({ error: "Не найдено" });
  const u = q.rows[0];
  if (u.expires_at && new Date(u.expires_at) < new Date())
    return res.status(403).json({ error: "Срок действия аккаунта истёк" });
  res.json(u);
}

module.exports = { register, verify, login, logout, me, authRequired };
