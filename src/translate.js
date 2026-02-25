/**
 * 翻譯服務：有 GEMINI_API_KEY 時用 Gemini（較準），否則用 MyMemory（免費免金鑰）
 * 印尼文 id ↔ 繁體中文 zh-TW；語系用簡易規則偵測
 */

// 語系偵測：繁中 / 印尼文 / 英文 / 其他（全部非中文都會翻成繁中）
function detectLanguage(text) {
  if (!text || !text.trim()) return 'id';
  if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text)) return 'zh-TW';
  const noLatin = text.replace(/[\s\d.,!?'"-]/g, '').replace(/[a-zA-Z]/g, '');
  if (noLatin.length === 0 && text.replace(/\s/g, '').length > 0) return 'en';
  return 'id';
}

// ---------- MyMemory（免費，免金鑰；匿名約 5000 字/天）----------
const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

async function translateMyMemory(text, source, target) {
  const pair = `${source}|${target}`;
  const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`MyMemory ${res.status}: ${body.slice(0, 200)}`);
  }
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`MyMemory 回應非 JSON: ${body.slice(0, 100)}`);
  }
  const translated = data?.responseData?.translatedText;
  if (translated == null) throw new Error('MyMemory 回應格式錯誤');
  return translated;
}

// ---------- Gemini（需 GEMINI_API_KEY；預設 gemini-2.0-flash，可用 GEMINI_MODEL 覆寫）----------
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
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

const SOURCE_NAMES = { 'id': '印尼文', 'zh-TW': '繁體中文', 'en': '英文' };

async function translateGemini(text, source, target) {
  const ai = await getGeminiClient();
  if (!ai) throw new Error('未設定 GEMINI_API_KEY');
  const from = SOURCE_NAMES[source] || source;
  const to = SOURCE_NAMES[target] || target;
  const prompt = `你只負責翻譯。把下面這段「${from}」翻譯成「${to}」。只輸出翻譯結果，不要解釋、不要加標題。\n\n${text}`;
  let response;
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
  } catch (e) {
    const msg = e?.message || String(e);
    throw new Error(`Gemini 請求失敗: ${msg}`);
  }
  const out = response?.text?.trim();
  if (!out) {
    const raw = JSON.stringify(response?.candidates || response).slice(0, 150);
    throw new Error(`Gemini 未回傳譯文: ${raw}`);
  }
  return out;
}

// ---------- 統一介面：有 Gemini 時優先，失敗則 fallback MyMemory ----------
async function translateText(text, source, target) {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await translateGemini(text, source, target);
    } catch (geminiErr) {
      console.warn('[Gemini 失敗，改用 MyMemory]', geminiErr?.message);
      return translateMyMemory(text, source, target);
    }
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
