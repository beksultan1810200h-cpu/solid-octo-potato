// Browser-side trilingual demo brain (used only in web preview / demo mode).
// Mirrors electron/services/lang.cjs so the demo behaves like the real bot:
// it detects the client's language (English / Kyrgyz / Russian) and replies
// in that same language.
import type { Niche } from "./electron-api";

export type Lang = "ky" | "ru" | "en";

const KY_CHARS = /[өүң]/i;
const KY_WORDS =
  /(салам|саламатсызбы|рахмат|канча|кандай|болобу|барбы|керек|азырбы|жакшы|макул|силер|сизге|эмне|кайсы|кайда|бааси|баасы)/i;
const KY_LATIN =
  /\b(salam|salamatsyzby|rahmat|rakhmat|kancha|kanday|kandai|barby|barbi|kerek|jakshy|makul|silerge|sizge|emne|kaida|kayda|baasy|baasi)\b/i;
const CYRILLIC = /[а-яё]/i;
const LATIN = /[a-z]/i;

export function detectLang(text: string): Lang {
  const t = (text || "").toLowerCase();
  if (KY_CHARS.test(t) || KY_WORDS.test(t) || KY_LATIN.test(t)) return "ky";
  if (CYRILLIC.test(t)) return "ru";
  if (LATIN.test(t)) return "en";
  return "ru";
}

export const LANG_LABEL: Record<Lang, string> = {
  ky: "Кыргызча",
  ru: "Русский",
  en: "English",
};

const GREETING = /(salam|hello|\bhi\b|привет|здравствуй|салам|саламат)/i;
const PRICE = /(price|cost|how much|цена|сколько|стоит|скольк|канча|турат|баас)/i;
const DELIVERY = /(deliver|доставк|жеткир)/i;
const ORDER = /(order|buy|заказ|оформ|буйрутма|алгым|алам)/i;

const replies: Record<Niche, Record<Lang, { hi: string; price: string; delivery: string; order: string; def: string }>> = {
  stroyka: {
    ru: {
      hi: "Здравствуйте! Я ассистент строительного магазина. Чем помочь — материалы, расчёт или доставка?",
      price: "Цемент М500 — 550 сом/мешок, арматура 12мм — 480 сом/шт. Что именно интересует и сколько?",
      delivery: "Доставка по Бишкеку — 1500 сом, по регионам считаем по адресу. Куда доставить?",
      order: "Отлично! Уточните позиции и количество — соберу заказ и посчитаю итог с доставкой.",
      def: "Подскажите, какие материалы нужны? Помогу подобрать, посчитать и оформить доставку.",
    },
    ky: {
      hi: "Саламатсызбы! Мен курулуш дүкөнүнүн жардамчысымын. Эмнеге жардам берейин — материал, эсеп же жеткирүү?",
      price: "М500 цемент — 550 сом/капка, 12мм арматура — 480 сом/даана. Эмне керек жана канча?",
      delivery: "Бишкек боюнча жеткирүү — 1500 сом, аймактарга дарек боюнча эсептейбиз. Кайда жеткиребиз?",
      order: "Сонун! Товарларды жана санды жазыңыз — заказ чогултуп, жеткирүү менен эсептейм.",
      def: "Кандай материал керек экенин айтыңыз — тандап, эсептеп, жеткирүүнү тариздейм.",
    },
    en: {
      hi: "Hello! I'm the construction store assistant. How can I help — materials, a quote, or delivery?",
      price: "Cement M500 — 550 KGS/bag, rebar 12mm — 480 KGS/pc. What do you need and how much?",
      delivery: "Delivery within Bishkek is 1500 KGS; regional delivery is quoted by address. Where to?",
      order: "Great! Tell me the items and quantities and I'll build the order and total with delivery.",
      def: "Tell me which materials you need — I'll help pick, price and arrange delivery.",
    },
  },
  sushi: {
    ru: {
      hi: "Здравствуйте! Служба доставки суши. Помочь с выбором сета или ролла?",
      price: "Сет «Филадельфия» — 890 сом, «Калифорния» — 750 сом. Какой предпочитаете?",
      delivery: "Доставка по городу 30–40 мин, бесплатно от 1000 сом. Ваш адрес?",
      order: "Супер! Что добавляем в заказ? Соберу и назову итог с доставкой.",
      def: "Подскажу по меню, составу и аллергенам. Что хотите заказать?",
    },
    ky: {
      hi: "Саламатсызбы! Суши жеткирүү кызматы. Сет же ролл тандоого жардам берейинби?",
      price: "«Филадельфия» сети — 890 сом, «Калифорния» — 750 сом. Кайсынысын каалайсыз?",
      delivery: "Шаар боюнча жеткирүү 30–40 мүнөт, 1000 сомдон текин. Дарегиңиз кандай?",
      order: "Сонун! Заказга эмне кошобуз? Чогултуп, жеткирүү менен эсептейм.",
      def: "Меню, курамы жана аллергендер боюнча айтам. Эмне заказ кыласыз?",
    },
    en: {
      hi: "Hi! Sushi delivery service. Want help choosing a set or roll?",
      price: "Philadelphia set — 890 KGS, California — 750 KGS. Which do you prefer?",
      delivery: "City delivery 30–40 min, free over 1000 KGS. What's your address?",
      order: "Awesome! What shall we add? I'll build the order and give the total with delivery.",
      def: "I can help with the menu, ingredients and allergens. What would you like to order?",
    },
  },
  clothes: {
    ru: {
      hi: "Здравствуйте! Магазин одежды. Помочь с размером, стилем или комплектом?",
      price: "Куртка — 2900 сом, джинсы — 1900 сом. Что подбираем и какой размер?",
      delivery: "Доставка по Бишкеку 1–2 дня, примерка при получении. Куда доставить?",
      order: "Отлично! Уточните модель, размер и цвет — оформлю заказ.",
      def: "Подскажу по размеру и наличию, помогу собрать образ. Что ищете?",
    },
    ky: {
      hi: "Саламатсызбы! Кийим дүкөнү. Өлчөм, стиль же комплект тандоого жардам берейинби?",
      price: "Куртка — 2900 сом, шым — 1900 сом. Эмне тандайбыз жана өлчөмүңүз?",
      delivery: "Бишкек боюнча жеткирүү 1–2 күн, алганда кийип көрсөңүз болот. Кайда жеткиребиз?",
      order: "Сонун! Модель, өлчөм жана түстү айтыңыз — заказды тариздейм.",
      def: "Өлчөм жана бар-жогу боюнча жардам берем, образ тандашам. Эмне издеп жатасыз?",
    },
    en: {
      hi: "Hello! Clothing store. Need help with size, style or an outfit?",
      price: "Jacket — 2900 KGS, jeans — 1900 KGS. What are we picking and which size?",
      delivery: "Delivery in Bishkek 1–2 days, try-on on arrival. Where to deliver?",
      order: "Great! Tell me the model, size and color and I'll place the order.",
      def: "I can help with sizing, stock and styling. What are you looking for?",
    },
  },
  tech: {
    ru: {
      hi: "Здравствуйте! Магазин электроники. Помочь выбрать модель или посчитать рассрочку?",
      price: "iPhone 15 — от 89 900 сом, Samsung S24 — от 79 900 сом. Что интересует?",
      delivery: "Доставка по Бишкеку бесплатно от 5000 сом, 1 день. Куда доставить?",
      order: "Отлично! Уточните модель и способ оплаты — оформлю заказ или рассрочку.",
      def: "Сравню модели и характеристики, посчитаю рассрочку. Что подбираем?",
    },
    ky: {
      hi: "Саламатсызбы! Электроника дүкөнү. Модель тандоого же бөлүп төлөө эсептөөгө жардам берейинби?",
      price: "iPhone 15 — 89 900 сомдон, Samsung S24 — 79 900 сомдон. Эмне кызыктырат?",
      delivery: "Бишкек боюнча 5000 сомдон текин жеткирүү, 1 күн. Кайда жеткиребиз?",
      order: "Сонун! Модель жана төлөө ыкмасын айтыңыз — заказ же бөлүп төлөө тариздейм.",
      def: "Моделдерди салыштырам, бөлүп төлөөнү эсептейм. Эмне тандайбыз?",
    },
    en: {
      hi: "Hello! Electronics store. Want help choosing a model or calculating installments?",
      price: "iPhone 15 — from 89,900 KGS, Samsung S24 — from 79,900 KGS. What interests you?",
      delivery: "Free delivery in Bishkek over 5000 KGS, next day. Where to deliver?",
      order: "Great! Tell me the model and payment method — I'll set up the order or installment plan.",
      def: "I can compare models and specs and calculate installments. What are we picking?",
    },
  },
};

export function demoReply(niche: Niche, text: string): { body: string; lang: Lang } {
  const lang = detectLang(text);
  const r = replies[niche]?.[lang] ?? replies.stroyka[lang];
  let body = r.def;
  if (GREETING.test(text)) body = r.hi;
  else if (DELIVERY.test(text)) body = r.delivery;
  else if (ORDER.test(text)) body = r.order;
  else if (PRICE.test(text)) body = r.price;
  return { body, lang };
}
