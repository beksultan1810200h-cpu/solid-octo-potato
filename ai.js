{
  "name": "businessbot-web",
  "version": "1.0.0",
  "description": "WhatsApp AI assistant SaaS — trilingual (EN/KY/RU), account system, cloud AI",
  "type": "commonjs",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node src/server.js"
  },
  "engines": {
    "node": ">=18.18.0"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.14",
    "pg": "^8.12.0",
    "qrcode": "^1.5.4",
    "socket.io": "^4.7.5",
    "whatsapp-web.js": "^1.25.0",
    "zod": "^3.23.8"
  }
}
