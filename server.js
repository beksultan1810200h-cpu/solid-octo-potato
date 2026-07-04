services:
  - type: web
    name: businessbot-web
    runtime: docker
    plan: starter          # "free" засыпает и теряет сессию WhatsApp; starter (~$7) стабилен
    healthCheckPath: /
    disk:
      name: wa-sessions
      mountPath: /app/.wa-sessions   # хранит сессии WhatsApp между рестартами
      sizeGB: 1
    envVars:
      - key: NODE_ENV
        value: production
      - key: WA_SESSION_DIR
        value: /app/.wa-sessions
      - key: PUPPETEER_EXECUTABLE_PATH
        value: /usr/bin/chromium
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: businessbot-db
          property: connectionString
      # --- заполнишь вручную в Render dashboard ---
      - key: GMAIL_USER
        sync: false
      - key: GMAIL_APP_PASSWORD
        sync: false
      - key: CODE_INBOX
        value: kgbusinessbot@gmail.com
      - key: AI_BASE_URL
        value: https://api.groq.com/openai/v1
      - key: AI_API_KEY
        sync: false
      - key: AI_MODEL
        value: llama-3.3-70b-versatile

databases:
  - name: businessbot-db
    plan: free
