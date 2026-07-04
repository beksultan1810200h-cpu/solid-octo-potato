const { Pool } = require("pg");

// Render provides DATABASE_URL. SSL is required on Render Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            BIGSERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      niche         TEXT DEFAULT 'stroyka',
      verified      BOOLEAN DEFAULT FALSE,
      plan          TEXT,                 -- '1m' | '1y'
      expires_at    TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS verify_codes (
      id         BIGSERIAL PRIMARY KEY,
      user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
      code       TEXT NOT NULL,
      attempts   INT DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chats (
      id           TEXT NOT NULL,
      user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT,
      last_message TEXT,
      unread       INT DEFAULT 0,
      autopilot    BOOLEAN DEFAULT TRUE,
      updated_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id       TEXT PRIMARY KEY,
      user_id  BIGINT REFERENCES users(id) ON DELETE CASCADE,
      chat_id  TEXT NOT NULL,
      body     TEXT,
      from_me  BOOLEAN DEFAULT FALSE,
      author   TEXT,          -- 'client' | 'bot' | 'operator'
      ts       BIGINT
    );
    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(user_id, chat_id, ts);
  `);
  console.log("[db] schema ready");
}

module.exports = { pool, init };
