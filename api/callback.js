/**
 * Vercel Serverless：LINE Webhook 端點
 * Webhook URL 設為：https://你的專案.vercel.app/api/callback
 */
import { messagingApi, middleware } from '@line/bot-sdk';
import { createTranslationService } from '../src/translate.js';
import { handleEvent } from '../src/webhookLogic.js';

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// 關閉 Vercel 預設 body parser，讓 LINE SDK 讀取 raw body 驗證簽章
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  if (!channelSecret || !channelAccessToken) {
    console.error('缺少 LINE_CHANNEL_SECRET 或 LINE_CHANNEL_ACCESS_TOKEN');
    res.status(500).end();
    return;
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error('讀取 body 失敗:', e);
    res.status(400).end();
    return;
  }
  req.body = rawBody;

  const lineConfig = { channelSecret, channelAccessToken };
  const client = new messagingApi.MessagingApiClient({ channelAccessToken });
  const translate = createTranslationService();

  return new Promise((resolve) => {
    middleware(lineConfig)(req, res, async (err) => {
      if (err) {
        console.error('LINE 簽章驗證失敗:', err);
        res.status(500).end();
        resolve();
        return;
      }
      try {
        const events = req.body?.events || [];
        const results = await Promise.all(
          events.map((ev) => handleEvent(client, translate, ev))
        );
        res.status(200).json(results);
      } catch (e) {
        console.error('Webhook 處理錯誤:', e);
        res.status(500).end();
      }
      resolve();
    });
  });
}
