# 🇹🇼↔🇮🇩 印尼・繁中 LINE 翻譯機器人

> 家裡有印尼外勞、大家同在一个 LINE 群組時，用這隻機器人自動翻譯，減少溝通誤會。

---

## ✨ 功能說明

| 誰發言 | 傳的內容 | 機器人回覆 |
|--------|----------|------------|
| 👤 **外勞** | 印尼文、英文或其它語言 | → 一律翻譯成 **繁體中文**（給你看） |
| 👤 **你** | 繁體中文 | → **印尼文** ＋ **回譯繁中**（讓你確認意思） |

💡 **建議**：先與機器人 **一對一聊天** 測試，確認 OK 再邀請進群組。

---

## 📋 環境需求

- **Node.js** 18+
- **LINE** 官方帳號（Messaging API）
- **翻譯** 二選一：
  - **MyMemory**：免金鑰，約 5000 字/天（匿名）
  - **Gemini API**：設 `GEMINI_API_KEY`，較準（預設 `gemini-2.0-flash`，可改 `GEMINI_MODEL`）

---

## 🚀 快速開始

### 1️⃣ 安裝依賴

```bash
npm install
```

### 2️⃣ LINE 機器人設定

1. 到 [LINE Developers](https://developers.line.biz/) 建立 **Provider** 與 **Channel**（Messaging API）
2. 取得 **Channel secret**、**Channel access token**（長期）
3. 先一對一測試，再邀請進群組

### 3️⃣ 翻譯服務（二選一）

| 方案 | 設定 | 免費額度 | 準確度 |
|------|------|----------|--------|
| **MyMemory** | 不需設定 | 約 5000 字/天（匿名） | 一般 |
| **Gemini** | [Google AI Studio](https://aistudio.google.com/apikey) 取金鑰，寫入 `GEMINI_API_KEY` | 約 15 次/分、1500 次/日 | 較佳 |

### 4️⃣ 環境變數

```bash
copy .env.example .env
```

編輯 `.env`，至少填：

```env
LINE_CHANNEL_SECRET=你的 Channel Secret
LINE_CHANNEL_ACCESS_TOKEN=你的 Channel Access Token
PORT=3000
```

要用 Gemini 時再加上：

```env
GEMINI_API_KEY=你的 Gemini API 金鑰
# 選填：GEMINI_MODEL=gemini-2.5-flash（不填則用 gemini-2.0-flash）
```

### 5️⃣ 本機測試（需 HTTPS）

LINE 只接受公網 HTTPS，本機可用 [ngrok](https://ngrok.com/)：

```bash
ngrok http 3000
```

把產生的 `https://xxxx.ngrok.io` 設成 LINE Channel 的 **Webhook URL**：  
`https://xxxx.ngrok.io/callback`，並啟用 **Use webhook**。

### 6️⃣ 啟動

```bash
npm start
```

開發時可改用：`npm run dev`（自動重啟）

---

## ☁️ 部署

### Vercel（推薦，免費用、不休眠）

1. 專案推上 **GitHub**
2. 到 [vercel.com](https://vercel.com) 用 GitHub 登入 → **Add New** → **Project** → 選此 repo → **Deploy**
3. **Settings** → **Environment Variables** 新增：
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - （選填）`GEMINI_API_KEY`、`GEMINI_MODEL`
4. **Deployments** → 最新一次 **Redeploy** 讓變數生效
5. LINE Developers → 你的 Channel → **Messaging API** → **Webhook URL** 填：  
   `https://你的專案.vercel.app/callback`  
   或 `https://你的專案.vercel.app/api/callback`
6. 儲存並啟用 **Use webhook**，再到 LINE 一對一測試

> Serverless 依請求計費，個人／家庭用量多在免費額度內，且不會休眠。

---

### Render（免費用，會休眠）

1. 專案推上 **GitHub**
2. 到 [render.com](https://render.com) 用 GitHub 登入
3. **New** → **Web Service** → 選 repo → **Runtime**：Node → **Instance type**：Free
4. **Build Command**：`npm install`，**Start Command**：`npm start`
5. **Environment** 新增：`LINE_CHANNEL_SECRET`、`LINE_CHANNEL_ACCESS_TOKEN`、（選填）`GEMINI_API_KEY`
6. 建立完成後，**Webhook URL** 填：`https://你的服務.onrender.com/callback`

> 免費方案約 15 分鐘無流量會休眠，下次請求約 1 分鐘內醒來。

---

## 📄 授權

MIT
