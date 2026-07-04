:root {
  --bg: #0b141a;
  --panel: #111b21;
  --panel2: #202c33;
  --green: #25d366;
  --green-d: #1da851;
  --text: #e9edef;
  --muted: #8696a0;
  --bubble-in: #202c33;
  --bubble-out: #005c4b;
  --border: #2a3942;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
}
.hidden { display: none !important; }
.brand { font-weight: 700; display: flex; align-items: center; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--green); box-shadow: 0 0 10px var(--green); }

/* AUTH */
.auth-wrap { height: 100vh; display: grid; place-items: center; background: radial-gradient(1200px 600px at 50% -10%, #10241f, var(--bg)); }
.auth-card { width: 360px; background: var(--panel); border: 1px solid var(--border); border-radius: 18px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.pane h2 { margin: 18px 0 16px; }
.pane input, .pane select { width: 100%; padding: 12px 14px; margin-bottom: 12px; background: var(--panel2); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 15px; }
.pane button { width: 100%; padding: 12px; background: var(--green); color: #072a1e; border: none; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; }
.pane button:hover { background: var(--green-d); }
.switch { color: var(--muted); font-size: 14px; text-align: center; margin-top: 14px; }
.switch a { color: var(--green); cursor: pointer; }
.err { color: #f15c6d; font-size: 13px; margin-top: 10px; min-height: 16px; text-align: center; }
.hint { color: var(--muted); font-size: 13px; margin: 0 0 14px; }
.lbl { font-size: 13px; color: var(--muted); }
.plans { display: flex; gap: 16px; margin: 8px 0 16px; }
.plans label { color: var(--text); font-size: 14px; }

/* APP */
.app { display: grid; grid-template-columns: 340px 1fr; height: 100vh; }
.side { background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.side-top { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--border); }
.ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
.account { padding: 12px 16px; font-size: 13px; color: var(--muted); border-bottom: 1px solid var(--border); }
.connect { padding: 16px; border-bottom: 1px solid var(--border); }
.wa-status { font-size: 13px; color: var(--muted); margin-bottom: 10px; }
.qr { display: grid; place-items: center; margin-bottom: 10px; }
.qr img { width: 200px; border-radius: 12px; background: #fff; padding: 8px; }
.connect button { width: 100%; padding: 10px; background: var(--green); border: none; border-radius: 10px; font-weight: 700; cursor: pointer; color: #072a1e; }
.chat-list { flex: 1; overflow-y: auto; }
.chat-item { padding: 14px 16px; border-bottom: 1px solid var(--border); cursor: pointer; }
.chat-item:hover, .chat-item.active { background: var(--panel2); }
.chat-item .n { font-weight: 600; font-size: 14px; }
.chat-item .l { color: var(--muted); font-size: 13px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.main { display: flex; flex-direction: column; background: #0b141a; }
.chat-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: var(--panel); border-bottom: 1px solid var(--border); }
.ap { color: var(--muted); font-size: 13px; }
.messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.empty { color: var(--muted); margin: auto; }
.bubble { max-width: 68%; padding: 8px 12px; border-radius: 10px; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; }
.bubble.in { background: var(--bubble-in); align-self: flex-start; }
.bubble.out { background: var(--bubble-out); align-self: flex-end; }
.bubble .tag { font-size: 10px; opacity: .6; display: block; margin-top: 3px; }
.send { display: flex; gap: 10px; padding: 14px; background: var(--panel); border-top: 1px solid var(--border); }
.send input { flex: 1; padding: 12px 14px; background: var(--panel2); border: 1px solid var(--border); border-radius: 10px; color: var(--text); }
.send button { padding: 0 18px; background: var(--green); border: none; border-radius: 10px; font-weight: 700; cursor: pointer; color: #072a1e; }
