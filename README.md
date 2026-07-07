# 銀行分行績效目標與經營管理平台 Prototype

高擬真、純前端的銀行績效管理 Prototype。使用 React、TypeScript、Vite、React Router、Recharts、Lucide Icons 與本地模擬資料；不含正式後端。

## 啟動

```bash
npm install
npm run dev
```

正式建置檢查：`npm run build`。

## 操作方式

- 右上角「切換角色」可切換 9 種角色；左側選單會依權限改變。
- 右上角可切換 150 家模擬分行。
- 分行主管可操作總覽、月度業績、指標明細、追分模擬與分行比較。
- 業管、經營企劃及系統管理角色可操作指標管理、六步驟設定精靈、公式組合器、匯入、審核發布及稽核。
- 高階主管可進入全行戰情儀表板；稽核人員僅能查看稽核紀錄。
- 新增的草稿指標與角色選擇會保存在 localStorage。

## 專案結構

`src/main.tsx` 包含頁面、路由、資料模型與模擬服務行為；`src/styles.css` 是共用設計系統；正式開發時建議再拆成 `components/`、`features/`、`models/`、`services/` 與 `mocks/`。

## 主要資料模型

- `Role`：9 種模擬角色。
- `Metric`：指標代碼、業務群、業管單位、實績、目標、配分、排名與狀態。
- 模擬資料包含 150 家分行、40 個指標、7 個業務群、20 個業管單位及 12 個月趨勢。

## 尚未串接

登入與 SSO、正式權限、資料庫、Web API、真實 Excel 後端驗證、排程介接、電子簽核、正式發布及稽核不可否認性均為模擬。

## 建議 API

`/auth/me`、`/branches`、`/metrics`、`/metrics/{id}/versions`、`/targets`、`/performance`、`/scores`、`/rankings`、`/simulations`、`/imports`、`/imports/{id}/errors`、`/approvals`、`/publications`、`/audit-logs`。
