/**
 * 翻譯服務：有 GEMINI_API_KEY 時用 Gemini（較準），否則用 MyMemory（免費免金鑰）
 * 印尼文 id ↔ 繁體中文 zh-TW；語系用簡易規則偵測
 */

// 含 CJK 字元視為中文
function detectLanguage(text) {
  if (!text || !text.trim()) return 'id';
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text) ? 'zh-TW' : 'id';
}

// ---------- MyMemory（免費，免金鑰；匿名約 5000 字/天）----------
const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

async function translateMyMemory(text, source, target) {
  const pair = `${source}|${target}`;
  const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`翻譯失敗: ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (translated == null) throw new Error('翻譯回應格式錯誤');
  return translated;
}

// ---------- Gemini（需 GEMINI_API_KEY，翻譯較準；免費額度約 15 次/分、1500 次/日）----------
let geminiClient = null;

async function getGeminiClient() {
  if (geminiClient) return geminiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey: key });
    return geminiClient;
  } catch {
    return null;
  }
}

const SOURCE_NAMES = { 'id': '印尼文', 'zh-TW': '繁體中文' };

async function translateGemini(text, source, target) {
  const ai = await getGeminiClient();
  if (!ai) throw new Error('未設定 GEMINI_API_KEY');
  const from = SOURCE_NAMES[source] || source;
  const to = SOURCE_NAMES[target] || target;
  const prompt = `你只負責翻譯。把下面這段「${from}」翻譯成「${to}」。只輸出翻譯結果，不要解釋、不要加標題。\n\n${text}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  const out = response?.text?.trim();
  if (!out) throw new Error('Gemini 未回傳譯文');
  return out;
}

// ---------- 統一介面 ----------
async function translateText(text, source, target) {
  if (process.env.GEMINI_API_KEY) {
    return translateGemini(text, source, target);
  }
  return translateMyMemory(text, source, target);
}

export function createTranslationService() {
  return {
    async detectLanguage(text) {
      return Promise.resolve(detectLanguage(text));
    },
    async translate(text, sourceLang, targetLang) {
      return translateText(text, sourceLang, targetLang);
    },
  };
}
