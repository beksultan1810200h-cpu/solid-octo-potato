// Bridge to Electron main process exposed via preload's contextBridge.
// In the web preview `window.api` is absent — components should treat
// missing bridge as "demo mode".

export type WAStatus =
  | "idle"
  | "starting"
  | "qr"
  | "authenticated"
  | "ready"
  | "disconnected";

export interface WAMessage {
  id: string;
  chatId: string;
  from: string;
  body: string;
  fromMe: boolean;
  author: "client" | "bot" | "operator";
  ts: number;
}

export interface WAChat {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  autopilot: boolean;
  updatedAt: number;
}

export type Niche = "stroyka" | "sushi" | "clothes" | "tech";

export interface Settings {
  niche: Niche;
  ollamaUrl: string;
  ollamaModel: string;
  systemPrompt: string;
}

export interface ElectronAPI {
  wa: {
    start(): Promise<{ status: WAStatus }>;
    stop(): Promise<void>;
    logout(): Promise<void>;
    getStatus(): Promise<{ status: WAStatus; qr?: string }>;
    send(chatId: string, text: string): Promise<void>;
    setAutopilot(chatId: string, enabled: boolean): Promise<void>;
    onQR(cb: (dataUrl: string) => void): () => void;
    onStatus(cb: (s: WAStatus) => void): () => void;
    onMessage(cb: (m: WAMessage) => void): () => void;
  };
  ai: {
    setConfig(cfg: Partial<Settings>): Promise<void>;
    ping(): Promise<{ ok: boolean; models?: string[]; error?: string }>;
  };
  db: {
    listChats(): Promise<WAChat[]>;
    getMessages(chatId: string): Promise<WAMessage[]>;
    getSettings(): Promise<Settings>;
    saveSettings(s: Partial<Settings>): Promise<Settings>;
  };
}

declare global {
  interface Window {
    api?: ElectronAPI;
  }
}

export const electronApi = (): ElectronAPI | null =>
  typeof window !== "undefined" && window.api ? window.api : null;

export const isElectron = () => electronApi() !== null;