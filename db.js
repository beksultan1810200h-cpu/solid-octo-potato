const $ = (s) => document.querySelector(s);
const api = async (url, opts = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Ошибка");
  return data;
};

let socket = null;
let currentChat = null;
let regUserId = null;

// ---------- AUTH UI ----------
function showPane(id) {
  document.querySelectorAll("#auth .pane").forEach((p) => p.classList.add("hidden"));
  $("#" + id + "Form").classList.remove("hidden");
}
document.querySelectorAll("[data-go]").forEach((a) =>
  a.addEventListener("click", () => showPane(a.dataset.go)),
);
const setErr = (form, msg) => (form.querySelector("[data-err]").textContent = msg || "");

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  setErr(f, "");
  try {
    await api("/api/login", {
      method: "POST",
      body: { username: f.username.value, password: f.password.value },
    });
    enterApp();
  } catch (err) {
    setErr(f, err.message);
  }
});

$("#registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  setErr(f, "");
  try {
    const r = await api("/api/register", {
      method: "POST",
      body: {
        username: f.username.value,
        email: f.email.value,
        password: f.password.value,
        niche: f.niche.value,
      },
    });
    regUserId = r.userId;
    showPane("verify");
  } catch (err) {
    setErr(f, err.message);
  }
});

$("#verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  setErr(f, "");
  try {
    await api("/api/verify", {
      method: "POST",
      body: {
        userId: regUserId,
        code: f.code.value.trim().toUpperCase(),
        plan: f.querySelector("input[name=plan]:checked").value,
      },
    });
    enterApp();
  } catch (err) {
    setErr(f, err.message);
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  location.reload();
});

// ---------- APP ----------
async function enterApp() {
  let me;
  try {
    me = await api("/api/me");
  } catch {
    return;
  }
  $("#auth").classList.add("hidden");
  $("#app").classList.remove("hidden");
  const exp = me.expires_at ? new Date(me.expires_at).toLocaleDateString("ru-RU") : "—";
  $("#account").textContent = `${me.username} · ниша: ${me.niche} · до ${exp}`;

  socket = io({ withCredentials: true });
  socket.on("wa:qr", (dataUrl) => {
    $("#qrBox").innerHTML = `<img src="${dataUrl}" alt="QR" />`;
    $("#waStatus").textContent = "Статус: отсканируйте QR в WhatsApp";
  });
  socket.on("wa:status", (s) => {
    const map = {
      ready: "Подключено (онлайн)",
      qr: "Ожидание сканирования QR",
      authenticated: "Авторизация…",
      starting: "Запуск…",
      disconnected: "Отключено",
    };
    $("#waStatus").textContent = "Статус: " + (map[s] || s);
    if (s === "ready") $("#qrBox").innerHTML = "";
  });
  socket.on("wa:message", (m) => {
    loadChats();
    if (currentChat === m.chatId) appendMessage(m);
  });

  await refreshStatus();
  loadChats();
}

$("#connectBtn").addEventListener("click", async () => {
  $("#waStatus").textContent = "Статус: запуск…";
  await api("/api/wa/start", { method: "POST" });
});

async function refreshStatus() {
  try {
    const s = await api("/api/wa/status");
    if (s.qr) $("#qrBox").innerHTML = `<img src="${s.qr}" alt="QR" />`;
    if (s.status && s.status !== "idle")
      $("#waStatus").textContent = "Статус: " + s.status;
  } catch {}
}

async function loadChats() {
  try {
    const chats = await api("/api/chats");
    $("#chatList").innerHTML = chats
      .map(
        (c) =>
          `<div class="chat-item ${c.id === currentChat ? "active" : ""}" data-id="${c.id}">
            <div class="n">${escapeHtml(c.name || c.id)}</div>
            <div class="l">${escapeHtml(c.last_message || "")}</div>
          </div>`,
      )
      .join("");
    document.querySelectorAll(".chat-item").forEach((el) =>
      el.addEventListener("click", () => openChat(el.dataset.id, el)),
    );
  } catch {}
}

async function openChat(chatId, el) {
  currentChat = chatId;
  document.querySelectorAll(".chat-item").forEach((x) => x.classList.remove("active"));
  el?.classList.add("active");
  $("#chatHeader").classList.remove("hidden");
  $("#sendForm").classList.remove("hidden");
  $("#chatTitle").textContent = chatId;

  const chats = await api("/api/chats");
  const c = chats.find((x) => x.id === chatId);
  $("#autopilot").checked = c ? c.autopilot : true;

  const msgs = await api("/api/messages/" + encodeURIComponent(chatId));
  $("#messages").innerHTML = "";
  msgs.forEach(appendMessage);
}

function appendMessage(m) {
  const box = $("#messages");
  const div = document.createElement("div");
  div.className = "bubble " + (m.from_me ?? m.fromMe ? "out" : "in");
  const author = m.author === "bot" ? "🤖 ИИ" : m.author === "operator" ? "оператор" : "клиент";
  div.innerHTML = `${escapeHtml(m.body)}<span class="tag">${author}</span>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

$("#autopilot").addEventListener("change", async (e) => {
  if (!currentChat) return;
  await api(`/api/chats/${encodeURIComponent(currentChat)}/autopilot`, {
    method: "POST",
    body: { enabled: e.target.checked },
  });
});

$("#sendForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("#sendInput").value.trim();
  if (!text || !currentChat) return;
  $("#sendInput").value = "";
  try {
    const m = await api("/api/wa/send", {
      method: "POST",
      body: { chatId: currentChat, text },
    });
    appendMessage(m);
  } catch (err) {
    alert(err.message);
  }
});

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}

// auto-enter if already logged in
enterApp();
