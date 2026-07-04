const { detectLang, languageInstruction } = require("./lang");

// Cloud AI via any OpenAI-compatible endpoint.
// Recommended free/effective: Groq (https://console.groq.com) — OpenAI compatible.
// Env: AI_BASE_URL, AI_API_KEY, AI_MODEL
const BASE = () => process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = () => process.env.AI_MODEL || "llama-3.3-70b-versatile";

const FORTY = `40 функций: приветствие, определение цели, прайс/наличие, расчёт заказа и доставки, оформление, подтверждение, отработка возражений, апселл/кросс-селл, часы работы и адрес, способы оплаты, скидки/акции, бронь, напоминание, сбор контактов, уточнение размера/веса, помощь в выборе, работа с негативом, эскалация оператору, гарантия/возврат, сроки, реквизиты/QR, история клиента, персональные рекомендации, опрос удовлетворённости, приглашение на отзыв, доп. предложения, филиалы, мультиязычность, рассрочка, статус заказа, отмена/изменение, B2B, каталог, аллергии/предпочтения, акции/новинки, обратный звонок, опт, прощание.`;

const PROMPTS = {
  stroyka: `Ты — ИИ-ассистент строительного магазина в Кыргызстане в WhatsApp. Помогаешь с материалами (цемент, арматура, кирпич, смеси, инструмент), считаешь доставку. Отвечай кратко и по-деловому.\n${FORTY}`,
  sushi: `Ты — ИИ-ассистент службы доставки суши. Помогаешь выбрать сеты и роллы, считаешь стоимость и доставку. Отвечай тепло и коротко.\n${FORTY}`,
  clothes: `Ты — ИИ-ассистент магазина одежды. Помогаешь с размером, стилем, комплектом, доставкой.\n${FORTY}`,
  tech: `Ты — ИИ-ассистент магазина электроники. Сравниваешь модели, считаешь рассрочку, оформляешь заказ.\n${FORTY}`,
};

async function reply({ niche, history, userText }) {
  const lang = detectLang(userText);
  const system = (PROMPTS[niche] || PROMPTS.stroyka) + languageInstruction(lang);

  const messages = [
    { role: "system", content: system },
    ...history.slice(-20).map((m) => ({
      role: m.author === "client" ? "user" : "assistant",
      content: m.body,
    })),
    { role: "user", content: userText },
  ];

  try {
    const res = await fetch(`${BASE()}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL(), messages, temperature: 0.5 }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || fallback(lang);
  } catch (e) {
    console.error("[ai] error", e.message);
    return fallback(lang);
  }
}

function fallback(lang) {
  const f = {
    ky: "Кечиресиз, жардамчы азырынча жеткиликсиз. Жакында кайра жазабыз.",
    en: "Sorry, the assistant is temporarily unavailable. We'll get back to you shortly.",
    ru: "Извините, ассистент временно недоступен. Мы скоро вернёмся с ответом.",
  };
  return f[lang] || f.ru;
}

module.exports = { reply };
