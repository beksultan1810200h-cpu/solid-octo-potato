const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { createWhatsApp } = require("./services/whatsapp.cjs");
const { createOllama } = require("./services/ollama.cjs");
const { createDB } = require("./services/db.cjs");
const { createBrain } = require("./services/brain.cjs");

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0b0f1a",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL || "http://localhost:8080");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  const db = createDB(app.getPath("userData"));
  const ollama = createOllama(db);
  const brain = createBrain({ db, ollama });
  const wa = createWhatsApp({
    userDataDir: app.getPath("userData"),
    onEvent: (channel, payload) => mainWindow?.webContents.send(channel, payload),
    onMessage: async (msg) => {
      db.insertMessage(msg);
      db.touchChat(msg.chatId, msg.body);
      mainWindow?.webContents.send("wa:message", msg);
      const chat = db.getChat(msg.chatId);
      if (!msg.fromMe && chat?.autopilot) {
        const reply = await brain.handle(msg.chatId, msg.body);
        if (reply) {
          await wa.send(msg.chatId, reply);
        }
      }
    },
  });

  // ---- IPC ----
  ipcMain.handle("wa:start", () => wa.start());
  ipcMain.handle("wa:stop", () => wa.stop());
  ipcMain.handle("wa:logout", () => wa.logout());
  ipcMain.handle("wa:getStatus", () => wa.getStatus());
  ipcMain.handle("wa:send", async (_e, chatId, text) => {
    await wa.send(chatId, text);
    const msg = {
      id: `op_${Date.now()}`,
      chatId,
      from: "operator",
      body: text,
      fromMe: true,
      author: "operator",
      ts: Date.now(),
    };
    db.insertMessage(msg);
    db.touchChat(chatId, text);
    mainWindow?.webContents.send("wa:message", msg);
  });
  ipcMain.handle("wa:setAutopilot", (_e, chatId, enabled) =>
    db.setAutopilot(chatId, enabled),
  );

  ipcMain.handle("ai:setConfig", (_e, cfg) => db.saveSettings(cfg));
  ipcMain.handle("ai:ping", () => ollama.ping());

  ipcMain.handle("db:listChats", () => db.listChats());
  ipcMain.handle("db:getMessages", (_e, chatId) => db.getMessages(chatId));
  ipcMain.handle("db:getSettings", () => db.getSettings());
  ipcMain.handle("db:saveSettings", (_e, s) => db.saveSettings(s));

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});