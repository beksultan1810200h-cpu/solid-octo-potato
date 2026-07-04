const path = require("path");
const Database = require("better-sqlite3");

const DEFAULT_SETTINGS = {
  niche: "stroyka",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "qwen2.5:7b",
  systemPrompt: "",
};

function createDB(userDataDir) {
  const db = new Database(path.join(userDataDir, "businessbot.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      name TEXT,
      lastMessage TEXT,
      unread INTEGER DEFAULT 0,
      autopilot INTEGER DEFAULT 1,
      updatedAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      "from" TEXT,
      body TEXT,
      fromMe INTEGER,
      author TEXT,
      ts INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chatId, ts);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const getSettings = () => {
    const rows = db.prepare("SELECT key, value FROM settings").all();
    const s = { ...DEFAULT_SETTINGS };
    for (const r of rows) s[r.key] = tryParse(r.value);
    return s;
  };
  const saveSettings = (patch) => {
    const stmt = db.prepare(
      "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    );
    for (const [k, v] of Object.entries(patch || {})) {
      stmt.run(k, JSON.stringify(v));
    }
    return getSettings();
  };

  const insertMessage = (m) => {
    db.prepare(
      `INSERT OR REPLACE INTO messages (id, chatId, "from", body, fromMe, author, ts)
       VALUES (@id, @chatId, @from, @body, @fromMe, @author, @ts)`,
    ).run({ ...m, fromMe: m.fromMe ? 1 : 0 });
  };

  const touchChat = (chatId, lastMessage) => {
    const now = Date.now();
    const existing = db.prepare("SELECT id FROM chats WHERE id = ?").get(chatId);
    if (existing) {
      db.prepare(
        "UPDATE chats SET lastMessage=?, updatedAt=?, unread=unread+1 WHERE id=?",
      ).run(lastMessage, now, chatId);
    } else {
      db.prepare(
        "INSERT INTO chats(id,name,lastMessage,unread,autopilot,updatedAt) VALUES(?,?,?,?,?,?)",
      ).run(chatId, chatId, lastMessage, 1, 1, now);
    }
  };

  const listChats = () =>
    db
      .prepare("SELECT * FROM chats ORDER BY updatedAt DESC")
      .all()
      .map((c) => ({ ...c, autopilot: !!c.autopilot }));

  const getChat = (id) => {
    const c = db.prepare("SELECT * FROM chats WHERE id=?").get(id);
    return c ? { ...c, autopilot: !!c.autopilot } : null;
  };

  const getMessages = (chatId) =>
    db
      .prepare(`SELECT * FROM messages WHERE chatId=? ORDER BY ts ASC`)
      .all(chatId)
      .map((m) => ({ ...m, fromMe: !!m.fromMe }));

  const setAutopilot = (chatId, enabled) => {
    db.prepare("UPDATE chats SET autopilot=? WHERE id=?").run(enabled ? 1 : 0, chatId);
  };

  return {
    getSettings,
    saveSettings,
    insertMessage,
    touchChat,
    listChats,
    getChat,
    getMessages,
    setAutopilot,
  };
}

function tryParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

module.exports = { createDB };