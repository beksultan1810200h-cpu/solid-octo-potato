const path = require("path");
const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { pool } = require("./db");
const ai = require("./ai");

// One WhatsApp client per user, keyed by userId. Sessions persist on disk
// (LocalAuth) so a restart keeps the login until the volume is wiped.
const clients = new Map(); // userId -> { client, status, qr }

const SESSION_ROOT = process.env.WA_SESSION_DIR || path.join(process.cwd(), ".wa-sessions");

function getState(userId) {
  return clients.get(userId) || { status: "idle", qr: null };
}

async function saveMessage(userId, m) {
  await pool.query(
    `INSERT INTO messages(id, user_id, chat_id, body, from_me, author, ts)
     VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
    [m.id, userId, m.chatId, m.body, m.fromMe, m.author, m.ts],
  );
  await pool.query(
    `INSERT INTO chats(id, user_id, name, last_message, unread, autopilot, updated_at)
     VALUES($1,$2,$3,$4,1,TRUE,NOW())
     ON CONFLICT (user_id, id) DO UPDATE
       SET last_message=$4, updated_at=NOW(),
           unread = chats.unread + CASE WHEN $5 THEN 0 ELSE 1 END`,
    [m.chatId, userId, m.chatId, m.body, m.fromMe],
  );
}

async function start(userId, emit) {
  let state = clients.get(userId);
  if (state && state.client) return { status: state.status };

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `u${userId}`,
      dataPath: SESSION_ROOT,
    }),
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
    },
  });

  state = { client, status: "starting", qr: null };
  clients.set(userId, state);
  emit("wa:status", state.status);

  client.on("qr", async (qr) => {
    state.qr = await qrcode.toDataURL(qr, { margin: 1, width: 320 });
    state.status = "qr";
    emit("wa:qr", state.qr);
    emit("wa:status", "qr");
  });
  client.on("authenticated", () => {
    state.status = "authenticated";
    emit("wa:status", "authenticated");
  });
  client.on("ready", () => {
    state.qr = null;
    state.status = "ready";
    emit("wa:status", "ready");
  });
  client.on("disconnected", () => {
    state.status = "disconnected";
    state.client = null;
    clients.delete(userId);
    emit("wa:status", "disconnected");
  });

  client.on("message", async (m) => {
    const msg = {
      id: m.id?._serialized || `${Date.now()}`,
      chatId: m.from,
      body: m.body,
      fromMe: !!m.fromMe,
      author: "client",
      ts: (m.timestamp || Date.now() / 1000) * 1000,
    };
    await saveMessage(userId, msg);
    emit("wa:message", msg);

    const chat = await pool.query(
      "SELECT autopilot FROM chats WHERE user_id=$1 AND id=$2",
      [userId, msg.chatId],
    );
    const autopilot = chat.rowCount ? chat.rows[0].autopilot : true;
    if (!msg.fromMe && autopilot) {
      const u = await pool.query("SELECT niche FROM users WHERE id=$1", [userId]);
      const niche = u.rowCount ? u.rows[0].niche : "stroyka";
      const history = (
        await pool.query(
          "SELECT body, author FROM messages WHERE user_id=$1 AND chat_id=$2 ORDER BY ts ASC",
          [userId, msg.chatId],
        )
      ).rows;
      const answer = await ai.reply({ niche, history, userText: msg.body });
      if (answer) {
        await client.sendMessage(msg.chatId, answer);
        const bot = {
          id: `bot_${Date.now()}`,
          chatId: msg.chatId,
          body: answer,
          fromMe: true,
          author: "bot",
          ts: Date.now(),
        };
        await saveMessage(userId, bot);
        emit("wa:message", bot);
      }
    }
  });

  client.initialize().catch((err) => {
    console.error("[wa] init error", err.message);
    state.status = "disconnected";
    clients.delete(userId);
    emit("wa:status", "disconnected");
  });

  return { status: state.status };
}

async function send(userId, chatId, text) {
  const state = clients.get(userId);
  if (!state || !state.client || state.status !== "ready")
    throw new Error("WhatsApp не подключён");
  await state.client.sendMessage(chatId, text);
  const msg = {
    id: `op_${Date.now()}`,
    chatId,
    body: text,
    fromMe: true,
    author: "operator",
    ts: Date.now(),
  };
  await saveMessage(userId, msg);
  return msg;
}

async function logout(userId) {
  const state = clients.get(userId);
  if (state?.client) {
    try {
      await state.client.logout();
    } catch {}
  }
  clients.delete(userId);
}

module.exports = { start, send, logout, getState };
