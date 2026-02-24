/**
 * 印尼↔繁體中文 LINE 群組翻譯機器人
 * - 外勞傳印尼文 → 回覆繁體中文翻譯
 * - 使用者傳繁體中文 → 回覆印尼文翻譯 + 回譯成繁中供確認
 */
import 'dotenv/config';
import express from 'express';
import { messagingApi, middleware } from '@line/bot-sdk';
import { createTranslationService } from './translate.js';
import { handleEvent } from './webhookLogic.js';

const PORT = Number(process.env.PORT) || 3000;
const channelSecret = process.env.LINE_CHANNEL_SECRET;
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!channelSecret || !channelAccessToken) {
  console.error('請在 .env 設定 LINE_CHANNEL_SECRET 與 LINE_CHANNEL_ACCESS_TOKEN');
  process.exit(1);
}

const translate = createTranslationService();
const config = { channelSecret, channelAccessToken };
const client = new messagingApi.MessagingApiClient({ channelAccessToken });
const app = express();

app.post('/callback', middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(
      (req.body?.events || []).map((ev) => handleEvent(client, translate, ev))
    );
    res.json(results);
  } catch (err) {
    console.error('Webhook 處理錯誤:', err);
    res.status(500).end();
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`翻譯機器人已啟動，port: ${PORT}`);
  console.log('請將 Webhook URL 設為: https://你的網址/callback');
});
