/**
 * Webhook 邏輯：供 Express 與 Vercel serverless 共用
 * 外勞傳任何語言 → 翻成繁中；你傳繁中 → 印尼文 + 回譯繁中
 */
export async function getReplyText(translate, input) {
  const lang = await translate.detectLanguage(input);
  const isChinese = lang === 'zh-TW' || lang === 'zh-CN' || lang === 'zh';

  if (isChinese) {
    const idText = await translate.translate(input, 'zh-TW', 'id');
    const backToChinese = await translate.translate(idText, 'id', 'zh-TW');
    return `🇮🇩 印尼文：\n${idText}\n\n✅ 回譯確認（繁中）：\n${backToChinese}`;
  }

  const zhText = await translate.translate(input, lang, 'zh-TW');
  return `🇹🇼 繁體中文：\n${zhText}`;
}

export async function handleEvent(client, translate, event) {
  if (event.type !== 'message' || event.message?.type !== 'text') {
    return null;
  }
  const text = event.message.text?.trim();
  if (!text) return null;

  try {
    const reply = await getReplyText(translate, text);
    if (!reply) return null;

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: reply }],
    });
  } catch (err) {
    console.error('翻譯或回覆失敗:', err);
    const fallback = '翻譯暫時無法使用，請稍後再試。';
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: fallback }],
    });
  }
  return { ok: true };
}
