const { contextBridge, ipcRenderer } = require("electron");

const listen = (channel) => (cb) => {
  const handler = (_e, payload) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld("api", {
  wa: {
    start: () => ipcRenderer.invoke("wa:start"),
    stop: () => ipcRenderer.invoke("wa:stop"),
    logout: () => ipcRenderer.invoke("wa:logout"),
    getStatus: () => ipcRenderer.invoke("wa:getStatus"),
    send: (chatId, text) => ipcRenderer.invoke("wa:send", chatId, text),
    setAutopilot: (chatId, enabled) =>
      ipcRenderer.invoke("wa:setAutopilot", chatId, enabled),
    onQR: listen("wa:qr"),
    onStatus: listen("wa:status"),
    onMessage: listen("wa:message"),
  },
  ai: {
    setConfig: (cfg) => ipcRenderer.invoke("ai:setConfig", cfg),
    ping: () => ipcRenderer.invoke("ai:ping"),
  },
  db: {
    listChats: () => ipcRenderer.invoke("db:listChats"),
    getMessages: (chatId) => ipcRenderer.invoke("db:getMessages", chatId),
    getSettings: () => ipcRenderer.invoke("db:getSettings"),
    saveSettings: (s) => ipcRenderer.invoke("db:saveSettings", s),
  },
});