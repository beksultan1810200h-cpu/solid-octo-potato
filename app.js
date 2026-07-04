# Локальный запуск (скопируй в .env)
DATABASE_URL=postgres://user:pass@localhost:5432/businessbot
JWT_SECRET=поставь_длинную_случайную_строку
PORT=3000

# Gmail SMTP (нужен App Password, не обычный пароль!)
GMAIL_USER=твой_gmail@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
CODE_INBOX=kgbusinessbot@gmail.com

# Облачный ИИ (OpenAI-совместимый). Рекомендую Groq — бесплатно и быстро.
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile

# Chromium для WhatsApp (в Docker уже стоит)
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WA_SESSION_DIR=./.wa-sessions
