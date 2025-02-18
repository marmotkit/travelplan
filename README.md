# 旅遊行程管理系統

## 目前進度 (v2.1)

### ✅ 已完成功能
1. 使用者系統
   - 登入/登出
   - 權限管理（管理員/一般使用者）
   - JWT 認證

2. 活動管理
   - 新增/編輯/刪除活動
   - 活動狀態追蹤
   - PDF 報表匯出

3. 行程管理 (新功能)
   - 行程總覽
   - Excel 批量上傳
   - 行程項目管理
   - 費用預估

4. 住宿管理
   - 住宿資訊記錄
   - 多天住宿規劃
   - 價格計算

5. 預算管理
   - 預算項目管理
   - 多幣別支援（TWD/THB）
   - 匯率轉換
   - 總費用計算

6. 儀表板
   - 年度活動統計
   - 支出統計圖表
   - 活動狀態分析

7. 系統功能
   - 版本控制（V2.1）
   - 版權訊息
   - 響應式設計
   - 錯誤處理

### 📝 待開發功能
1. 系統部署
   - 選擇雲端平台
   - 設定域名
   - SSL 憑證
   - 資料庫遷移

### 🔧 技術堆疊
- 前端：React + MUI + Recharts
- 後端：Express + MongoDB
- 認證：JWT
- 部署：待定

### 👥 開發團隊
- 開發者：KT. Liang
- 版本：V2.1
- 更新日期：2025.01

## 部署資訊
- API 服務：https://travel-planner-api.onrender.com
- 前端網站：https://travel-planner-web.onrender.com
- 資料庫：MongoDB Atlas

### 環境變數設定
後端服務需要以下環境變數：
- PORT: 5001
- MONGO_URI: MongoDB 連接字串
- JWT_SECRET: JWT 密鑰
- NODE_ENV: production

前端服務需要以下環境變數：
- VITE_API_URL: 後端 API 的完整 URL

### 測試帳號
- 管理員：admin / admin123

## 部署說明

### 後端服務
1. 環境要求：
   - Node.js 16.x
   - npm 8.x

2. 環境變數：
   - PORT: 5001
   - MONGO_URI: MongoDB 連接字串
   - JWT_SECRET: JWT 密鑰
   - NODE_ENV: production

3. 安裝依賴：
   ```bash
   cd server
   npm install
   ```

4. 啟動服務：
   ```bash
   npm start
   ```

### 前端服務
1. 環境變數：
   - VITE_API_URL: 後端 API 的完整 URL

2. 安裝依賴：
   ```bash
   cd client
   npm install
   ```

3. 構建：
   ```bash
   npm run build
   ```