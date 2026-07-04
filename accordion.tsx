// Trilingual language detection: English / Kyrgyz / Russian.
// Kyrgyz is detected in both Cyrillic and Latin (romanized) scripts.

const KY_CYRILLIC = /(салам|кандай|канча|рахмат|жакшы|керек|болобу|азырбы|үчүн|учун|менен|силер|кайда|качан|эмне|сага|сизге|бөлүк|ыраазы)|ө|ң|ү/i;
const RU_CYRILLIC = /(привет|здравствуйте|сколько|спасибо|хорошо|есть|нужно|можно|когда|где|что|как|цена|заказ|доставка|адрес|оплата)/i;
const KY_LATIN = /\b(salam|kanday|kancha|rahmat|jakshy|bar|jok|kerek|bolobu|uchun|menen|siler|kayda|kachan|emne)\b/i;
const HAS_CYRILLIC = /[а-яё]/i;

function detectLang(text) {
  const t = (text || "").toLowerCase();
  if (KY_CYRILLIC.test(t)) return "ky";
  if (HAS_CYRILLIC.test(t)) {
    if (RU_CYRILLIC.test(t)) return "ru";
    return "ru"; // default Cyrillic -> Russian
  }
  if (KY_LATIN.test(t)) return "ky";
  return "en";
}

function languageInstruction(lang) {
  const map = {
    ky: "\n\nМААНИЛҮҮ: Кардар кыргызча жазды. Жообуңду ТЕК ГАНА кыргыз тилинде бер.",
    ru: "\n\nВАЖНО: Клиент пишет по-русски. Отвечай ТОЛЬКО на русском языке.",
    en: "\n\nIMPORTANT: The client writes in English. Reply ONLY in English.",
  };
  return map[lang] || map.ru;
}

module.exports = { detectLang, languageInstruction };
