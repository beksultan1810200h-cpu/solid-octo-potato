// Ниши и их системные промпты дублируются из src/lib/niches.ts,
// чтобы main-процесс не зависел от TypeScript-исходников.
const { detectLang, languageInstruction } = require("./lang.cjs");
const FORTY = `40 функций: приветствие, определение цели, прайс/наличие, расчёт заказа и доставки, оформление, подтверждение, отработка возражений, апселл/кросс-селл, часы работы и адрес, способы оплаты, скидки/акции, бронь, напоминание, сбор контактов, уточнение размера/веса, помощь в выборе, работа с негативом, эскалация оператору, гарантия/возврат, сроки, реквизиты/QR, история клиента, персональные рекомендации, опрос удовлетворённости, приглашение на отзыв, доп. предложения, филиалы, мультиязычность, рассрочка, статус заказа, отмена/изменение, B2B, каталог, аллергии/предпочтения, акции/новинки, обратный звонок, опт, прощание.`;

const PROMPTS = {
  stroyka: `Ты — ИИ-ассистент строительного магазина в Кыргызстане в WhatsApp. Помогаешь с материалами (цемент, арматура, кирпич, смеси, инструмент), считаешь доставку. Отвечай кратко и по-деловому.\n${FORTY}`,
  sushi: `Ты — ИИ-ассистент службы доставки суши. Помогаешь выбрать сеты и роллы, считаешь стоимость и доставку. Отвечай тепло и коротко.\n${FORTY}`,
  clothes: `Ты — ИИ-ассистент магазина одежды. Помогаешь с размером, стилем, комплектом, доставкой.\n${FORTY}`,
  tech: `Ты — ИИ-ассистент магазина электроники. Сравниваешь модели, считаешь рассрочку, оформляешь заказ.\n${FORTY}`,
};

function createBrain({ db, ollama }) {
  const handle = async (chatId, userText) => {
    const settings = db.getSettings();
    const system = settings.systemPrompt?.length
      ? settings.systemPrompt
      : PROMPTS[settings.niche] || PROMPTS.stroyka;

    const history = db
      .getMessages(chatId)
      .slice(-20)
      .map((m) => ({
        role: m.author === "client" ? "user" : "assistant",
        content: m.body,
      }));

    const lang = detectLang(userText);
    try {
      const reply = await ollama.chat([
        { role: "system", content: system + languageInstruction(lang) },
        ...history,
        { role: "user", content: userText },
      ]);
      return reply;
    } catch (e) {
      console.error("brain error", e);
      const fallback = {
        ky: "Кечиресиз, жардамчы азырынча жеткиликсиз. Жакында кайра жазабыз.",
        en: "Sorry, the assistant is temporarily unavailable. We'll get back to you shortly.",
        ru: "Извините, ассистент временно недоступен. Мы скоро вернёмся с ответом.",
      };
      return fallback[lang] || fallback.ru;
    }
  };
  return { handle };
}

module.exports = { createBrain };