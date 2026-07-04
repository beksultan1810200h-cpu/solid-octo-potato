# businessbot.kg — десктоп-приложение

Всё-в-одном WhatsApp AI ассистент: встроенный WhatsApp-клиент, локальный ИИ через Ollama, SQLite-база и UI в стиле Liquid Glass.

## Архитектура

```
electron/
  main.cjs               # Electron main-процесс + IPC-роутер
  preload.cjs            # contextBridge: window.api.{wa, ai, db}
  services/
    whatsapp.cjs         # whatsapp-web.js (LocalAuth), QR → renderer
    ollama.cjs           # HTTP-клиент к http://localhost:11434
    db.cjs               # better-sqlite3 (chats, messages, settings)
    brain.cjs            # системный промпт 40 функций + маршрутизация ниш
src/
  routes/_app.*.tsx      # три экрана: /connect, /chats, /settings
  components/glass/*     # GlassCard, GlassButton, дизайн-система Liquid Glass
  components/app/Sidebar.tsx
  lib/electron-api.ts    # типы IPC-моста
  lib/niches.ts          # 4 ниши × системный промпт (40 функций)
```

## Запуск

1. Установи Ollama: <https://ollama.com> и подтяни модель:
   ```bash
   ollama pull qwen2.5:7b
   ```
2. Разработка (два терминала):
   ```bash
   bun run dev              # Vite на http://localhost:8080
   bun run electron:dev     # Electron грузит preview
   ```
3. Сборка десктоп-артефакта:
   ```bash
   bun run electron:build
   ```
   Готовое приложение — в `electron-release/`.

## Как это работает

- **Экран /connect** — Electron стартует `whatsapp-web.js`, генерирует QR и отправляет data-URL в renderer через IPC. После сканирования статус меняется на «Подключено (Онлайн)».
- **Экран /chats** — все входящие сообщения перехватываются в `main.cjs` (`onMessage`), пишутся в SQLite, отправляются в UI и, если для чата включён автопилот, уходят в `brain.handle()` → Ollama → ответ обратно клиенту через `client.sendMessage`.
- **Экран /settings** — переключатель ниш зашивает системный промпт (Стройка / Суши / Одежда / Техника), кнопка «Перехватить управление» на экране чатов выключает автопилот для конкретного диалога.

## Web-preview

Renderer знает про отсутствие `window.api` и показывает демо-данные — так удобно править UI без запуска Electron.

## Ограничения

- `whatsapp-web.js` — неофициальный клиент; Meta может блокировать номер.
- `better-sqlite3` и Puppeteer — нативные модули; для целевой ОС может потребоваться `electron-rebuild`.
- Полностью встроенная LLM (web-llm) не включена, чтобы не раздувать бандл; вариант «нулевой настройки» — Ollama.