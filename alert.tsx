require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const { init, pool } = require("./db");
const auth = require("./auth");
const wa = require("./whatsapp");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: false } });

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// --- Rate limiting (protection against brute force / abuse) ---
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

// --- Auth routes ---
app.post("/api/register", authLimiter, auth.register);
app.post("/api/verify", authLimiter, auth.verify);
app.post("/api/login", authLimiter, auth.login);
app.post("/api/logout", auth.logout);
app.get("/api/me", auth.authRequired, auth.me);

// --- App data routes (all require auth) ---
app.use("/api", apiLimiter);

app.get("/api/chats", auth.authRequired, async (req, res) => {
  const q = await pool.query(
    "SELECT * FROM chats WHERE user_id=$1 ORDER BY updated_at DESC",
    [req.user.uid],
  );
  res.json(q.rows);
});

app.get("/api/messages/:chatId", auth.authRequired, async (req, res) => {
  const q = await pool.query(
    "SELECT * FROM messages WHERE user_id=$1 AND chat_id=$2 ORDER BY ts ASC",
    [req.user.uid, req.params.chatId],
  );
  res.json(q.rows);
});

app.post("/api/wa/start", auth.authRequired, async (req, res) => {
  const r = await wa.start(req.user.uid, (ch, payload) =>
    io.to(`u${req.user.uid}`).emit(ch, payload),
  );
  res.json(r);
});

app.get("/api/wa/status", auth.authRequired, (req, res) => {
  res.json(wa.getState(req.user.uid));
});

app.post("/api/wa/logout", auth.authRequired, async (req, res) => {
  await wa.logout(req.user.uid);
  res.json({ ok: true });
});

app.post("/api/wa/send", auth.authRequired, async (req, res) => {
  try {
    const { chatId, text } = req.body || {};
    if (!chatId || !text) return res.status(400).json({ error: "chatId и text обязательны" });
    const msg = await wa.send(req.user.uid, chatId, text);
    io.to(`u${req.user.uid}`).emit("wa:message", msg);
    res.json(msg);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/chats/:chatId/autopilot", auth.authRequired, async (req, res) => {
  const enabled = !!req.body?.enabled;
  await pool.query(
    "UPDATE chats SET autopilot=$3 WHERE user_id=$1 AND id=$2",
    [req.user.uid, req.params.chatId, enabled],
  );
  res.json({ ok: true, enabled });
});

// --- Static frontend ---
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "index.html")),
);

// --- Socket.io auth via JWT cookie ---
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || "";
    const token = raw
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("bb_token="))
      ?.slice("bb_token=".length);
    if (!token) return next(new Error("unauthorized"));
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me-in-render-env");
    socket.join(`u${payload.uid}`);
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});

const PORT = process.env.PORT || 3000;
init()
  .then(() => server.listen(PORT, () => console.log(`[server] listening on ${PORT}`)))
  .catch((e) => {
    console.error("[server] db init failed", e);
    process.exit(1);
  });
