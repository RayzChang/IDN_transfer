# 印尼↔繁體中文 LINE 翻譯機器人

家裡有印尼外勞、大家同在一个 LINE 群組時，用這隻機器人自動翻譯，減少溝通誤會。

## 功能

| 誰發言 | 內容 | 機器人回覆 |
|--------|------|------------|
| 外勞 | 印尼文 | 翻譯成 **繁體中文** |
| 你 | 繁體中文 | 翻譯成 **印尼文**，並再 **回譯成繁中** 讓你確認意思是否正確 |

**可先在「與機器人一對一聊天」測試，確認 OK 再邀請進群組。**

## 環境需求

- Node.js 18+
- LINE 官方帳號（Messaging API）
- **翻譯**：二選一  
  - **MyMemory**：免金鑰，直接用（約 5000 字/天 匿名額度）  
  - **Gemini API**：在 `.env` 設 `GEMINI_API_KEY`，翻譯較準（免費額度約 15 次/分、1500 次/日）

## 安裝與設定

### 1. 安裝依賴

```bash
cd "C:\Users\Admin\Desktop\Code\印尼翻譯機器人"
npm install
```

### 2. LINE 機器人設定

1. 前往 [LINE Developers](https://developers.line.biz/) 建立 Provider 與 Channel（Messaging API）。
2. 在 Channel 取得 **Channel secret**、**Channel access token**（長期）。
3. 先與機器人 **一對一聊天** 測試；沒問題再將機器人 **加入群組**。

### 3. 翻譯服務（二選一）

| 方案 | 設定 | 免費額度 | 準確度 |
|------|------|----------|--------|
| **MyMemory** | 不需設定 | 約 5000 字/天（匿名）；註冊取 key 約 5 萬字/天 | 一般 |
| **Gemini** | `.env` 設 `GEMINI_API_KEY`（[Google AI Studio](https://aistudio.google.com/apikey) 取得） | 約 15 次/分、1500 次/日（2.0 Flash） | 較佳 |

### 4. 環境變數

```bash
copy .env.example .env
```

編輯 `.env`，至少填：

```env
LINE_CHANNEL_SECRET=你的 Channel Secret
LINE_CHANNEL_ACCESS_TOKEN=你的 Channel Access Token
PORT=3000
```

要用 Gemini 翻譯時再加上：

```env
GEMINI_API_KEY=你的 Gemini API 金鑰
```

### 5. 本機測試（Webhook 必須是 HTTPS）

LINE 只接受 **公網 HTTPS**。本機可用 ngrok：

```bash
ngrok http 3000
```

把產生的 `https://xxxx.ngrok.io` 設成 LINE Channel 的 **Webhook URL**：  
`https://xxxx.ngrok.io/callback`，並啟用 「Use webhook」。

### 6. 啟動

```bash
npm start
```

或開發時自動重啟：`npm run dev`

---

## 部署到 Vercel（免費用）

本專案已支援 **Vercel Serverless**，可直接部署到 Vercel，不需 ngrok、也不會休眠。

### 步驟

1. **把專案推上 GitHub**（若尚未推送）。

2. **登入 Vercel**  
   - 前往 [vercel.com](https://vercel.com)，用 GitHub 登入。

3. **匯入專案**  
   - **Add New** → **Project** → 選你的 **GitHub repo**（印尼翻譯機器人）  
   - **Framework Preset** 可選 Other 或 Node.js  
   - 不需改 Build / Output，直接 **Deploy**。

4. **環境變數**  
   - 專案頁 → **Settings** → **Environment Variables** 新增：
     - `LINE_CHANNEL_SECRET` = 你的 Channel Secret  
     - `LINE_CHANNEL_ACCESS_TOKEN` = 你的 Channel Access Token  
     - （選填）`GEMINI_API_KEY` = 你的 Gemini API 金鑰  
   - 加完後到 **Deployments** → 最新一次 **Redeploy** 讓變數生效。

5. **設 LINE Webhook**  
   - Vercel 會給網址，例如 `https://印尼翻譯機器人-xxx.vercel.app`  
   - 到 LINE Developers → 你的 Channel → **Messaging API**  
   - **Webhook URL** 填以下其一即可：  
     - `https://你的專案.vercel.app/callback`（有設 rewrite）  
     - 或 `https://你的專案.vercel.app/api/callback`  
   - 儲存並啟用 **Use webhook**。

6. **一對一測試**  
   - 在 LINE 加機器人為好友，傳印尼文或繁中給機器人測試，OK 再邀請進群組。

### Vercel 免費額度

- Serverless 依請求次數計；個人／家庭用量通常在免費額度內。  
- 不會像 Render 一樣休眠，有人傳訊息就會馬上觸發。

---

## 部署到 Render（免費用）

部署後會有固定 HTTPS 網址，可直接設成 LINE Webhook，不需 ngrok。

### 步驟

1. **把專案推上 GitHub**  
   - 在專案目錄執行 `git init`、加檔、commit、再 push 到你的 GitHub repo（若尚未有 repo，先在 GitHub 建一個）。

2. **登入 Render**  
   - 前往 [render.com](https://render.com)，用 GitHub 登入。

3. **建立 Web Service**  
   - **Dashboard** → **New** → **Web Service**  
   - 選你的 **GitHub repo**（印尼翻譯機器人）  
   - **Name**：自訂（例如 `indonesian-translation-bot`）  
   - **Runtime**：Node  
   - **Build Command**：`npm install`  
   - **Start Command**：`npm start`  
   - **Instance type**：選 **Free**

4. **環境變數**  
   - 在 **Environment** 新增：
     - `LINE_CHANNEL_SECRET` = 你的 Channel Secret  
     - `LINE_CHANNEL_ACCESS_TOKEN` = 你的 Channel Access Token  
     - （選填）`GEMINI_API_KEY` = 你的 Gemini API 金鑰  

5. **部署**  
   - 按 **Create Web Service**，等建置與部署完成。

6. **設 LINE Webhook**  
   - Render 會給一個網址，例如 `https://indonesian-translation-bot.onrender.com`  
   - 到 LINE Developers → 你的 Channel → **Messaging API**  
   - **Webhook URL** 填：`https://你的服務名稱.onrender.com/callback`  
   - 儲存並啟用 **Use webhook**。

7. **一對一測試**  
   - 在 LINE 加機器人為好友，直接傳印尼文或繁中給機器人，確認回覆正常後，再邀請進群組。

### Render 免費額度

- 每月約 750 小時；約 15 分鐘沒人用會休眠，下次有人觸發時約 1 分鐘內會醒來。  
- 適合個人／家庭使用；若需 24 小時即時不休眠，可改用付費方案或其它主機。

---

## 授權

MIT
