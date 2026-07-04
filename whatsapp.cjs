// Shared trilingual helpers (English / Kyrgyz / Russian).
// Used by the bot brain to detect the client's language and force replies
// in that same language.

// Kyrgyz-specific Cyrillic letters + common Kyrgyz words that don't occur in Russian.
const KY_CHARS = /[өүң]/i;
const KY_WORDS =
  /(салам|саламатсызбы|рахмат|канча|кандай|болобу|барбы|керек|азырбы|жакшы|макул|силер|сизге|эмне|кайсы|кайда|бааси|баасы)/i;
const KY_LATIN =
  /\b(salam|salamatsyzby|rahmat|rakhmat|kancha|kanday|kandai|barby|barbi|kerek|jakshy|makul|silerge|sizge|emne|kaida|kayda|baasy|baasi)\b/i;
const CYRILLIC = /[а-яё]/i;
const LATIN = /[a-z]/i;

/** Detect the language of a message: "ky" | "ru" | "en". Defaults to "ru". */
function detectLang(text) {
  const t = (text || "").toLowerCase();
  if (KY_CHARS.test(t) || KY_WORDS.test(t) || KY_LATIN.test(t)) return "ky";
  if (CYRILLIC.test(t)) return "ru";
  if (LATIN.test(t)) return "en";
  return "ru";
}

const LANG_NAME = {
  ky: "Kyrgyz (кыргызча)",
  ru: "Russian (русский)",
  en: "English",
};

/** Instruction appended to every system prompt so the model always mirrors the client's language. */
function languageInstruction(lang) {
  return `\n\n=== LANGUAGE / ТИЛ / ЯЗЫК ===
You are a trilingual assistant. You understand English, Kyrgyz (кыргызча) and Russian (русский).
The client's current message is written in: ${LANG_NAME[lang]}.
You MUST reply ONLY in ${LANG_NAME[lang]}. Do not mix languages.
If the client switches language mid-conversation, switch with them and answer in the new language.
Keep the same warm, business-like, concise tone in every language.`;
}

module.exports = { detectLang, languageInstruction, LANG_NAME };
