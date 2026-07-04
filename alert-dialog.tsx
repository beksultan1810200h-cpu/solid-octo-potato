const nodemailer = require("nodemailer");

// Gmail SMTP. Requires a Gmail "App Password" (not your normal password).
// Set env: GMAIL_USER, GMAIL_APP_PASSWORD, CODE_INBOX (where codes are sent).
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

// Codes always go to the operator inbox (business decision).
async function sendVerificationCode(code, forEmail, forUsername) {
  const inbox = process.env.CODE_INBOX || "kgbusinessbot@gmail.com";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#0b141a;color:#e9edef;border-radius:16px">
      <h2 style="color:#25d366;margin:0 0 8px">businessbot.kg</h2>
      <p style="margin:0 0 16px;color:#8696a0">Новый запрос на регистрацию аккаунта</p>
      <p style="margin:0 0 4px"><b>Логин:</b> ${forUsername}</p>
      <p style="margin:0 0 16px"><b>Email пользователя:</b> ${forEmail}</p>
      <div style="background:#202c33;border-radius:12px;padding:20px;text-align:center">
        <div style="color:#8696a0;font-size:13px">Код подтверждения (действует 15 минут)</div>
        <div style="font-size:34px;letter-spacing:8px;font-weight:700;color:#25d366;margin-top:8px">${code}</div>
      </div>
    </div>`;
  await getTransporter().sendMail({
    from: `"businessbot.kg" <${process.env.GMAIL_USER}>`,
    to: inbox,
    subject: `Код подтверждения: ${code}`,
    html,
  });
}

module.exports = { sendVerificationCode };
