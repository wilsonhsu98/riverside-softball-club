# 相依套件安全性修補 — 後續計畫

> 給人類與 AI 共用的追蹤文件。每次要繼續處理 Dependabot 警告時，先讀這份文件，
> 依照下面的階段順序進行，做完一個階段就更新「進度紀錄」段落再收工。
> 不要一次跨多個階段一起做——一個階段一個 commit，方便單獨 revert。

## 現況（2026-09-07）

- GitHub Dependabot 警告：起始 309 個 → 目前 **102 個**（詳見下方「進度紀錄」）。
- 已經做完的都是「不跳大版號、零程式碼行為改變」的修正：套件版本在既有 semver 範圍內更新、砍掉沒用到的死重依賴。
- **剩下的全部需要跳大版號、或需要改動實際程式邏輯**，因此這次刻意沒動，整理成下面的階段計畫。

## 剩餘警告分類（102 個, 2026-09-07 掃描結果）

| 分類 | 主要套件 | 約略數量 | 對應階段 |
|---|---|---|---|
| `functions/` 的 firebase-admin 舊版依賴鏈 | node-forge, protobufjs, @grpc/grpc-js, joi, tough-cookie, @google-cloud/firestore | ~53 | Phase 1 |
| LINE OAuth 用的過時 HTTP/OAuth 套件 | request, request-promise, hoek, simple-oauth2, uuid | ~10 | Phase 2 |
| jsonwebtoken 8→9 | jsonwebtoken | 3 | Phase 2 |
| vue-cli 4 內建開發用工具 | webpack-dev-server, webpack-dev-middleware, http-proxy-middleware, svgo | 9 | Phase 3 |
| postcss 多版本共存 | postcss | 5 | Phase 3（連帶解決） |
| Vue 2 本身 EOL 及牽連的 UI 元件庫 | vue, vue-template-compiler + 一串 vue2 專屬套件 | 少量但牽連廣 | Phase 5 |
| firebase 前端 SDK v8 | firebase | 1 | Phase 4 |
| 其他零星（`toml`, `ejs`, `flatted`, `serialize-javascript`, `elliptic`, `braces` 等，上游尚未發修補版或需個別小幅跳版） | — | ~15 | 視情況併入相近階段，或等上游發布 |

---

## Phase 1（最優先）— `functions/` 執行環境現代化

**為什麼優先**：`functions/package.json` 的 `engines.node` 目前釘死在 `"10"`。Node 10 早已 EOL，Firebase 事實上已經不再支援用 Node 10 部署 Cloud Functions——這已經不只是安全性掃描分數的問題，而是**可能直接擋掉未來部署**的營運風險。

**步驟**：
1. 確認 Firebase 目前支援的 Node LTS（建議 Node 20），更新 `functions/package.json` 的 `engines.node`。
2. 把 `firebase-admin`（8.4.0 → 13+）、`firebase-functions` 升到對應相容版本。
3. 檢查 [functions/index.js](functions/index.js) 裡用到的 Admin SDK API（主要是 Firestore 存取、Auth 操作、自訂 token）在新版是否有變動或棄用警告。
4. 本機驗證：至少跑 `node -e "require('./functions/index.js')"` 類的健全性檢查；有 Firebase emulator 的話用 emulator 跑過 LINE OAuth redirect/callback、`/delete_anonymous_users`、`/fb_deletion_callback`、`/upload_to_imgur` 這幾條路由。
5. 先部署到測試/預覽專案驗證，確認沒問題再上 production（`cd functions && yarn deploy`，記得先把根目錄 `.env` 複製進 `functions/`，這是既有的部署流程，見 [CLAUDE.md](CLAUDE.md)）。

**預期效益**：解決 node-forge、protobufjs、@grpc/grpc-js、joi、tough-cookie、@google-cloud/firestore 這整條鏈，約 50+ 個警告。

**風險**：Admin SDK 8→13 API 大致向後相容，但隔了很多個大版本，務必實際測試過 Firestore 讀寫和 Auth 相關程式碼，不要只看 build 過不過。

---

## Phase 2 — 替換 `functions/index.js` 裡過時的 OAuth / HTTP 套件

**背景**：`request`、`request-promise` 已經被官方棄用、不會再有安全更新；`simple-oauth2` 卡在 1.x/2.x；`jsonwebtoken` 8.x 也該跳 9.x。這幾個全部只在 [functions/index.js](functions/index.js) 裡用到，可以一起處理、一起測試。

**步驟**：
1. 把用 `request-promise` 發的 HTTP 呼叫改寫成 `axios`（client 端已經在用，行為模式可以參考 [src/store/root.js](src/store/root.js)）。
2. `simple-oauth2` 升級到 5.x——API 有變動，對照官方 migration guide 重寫 token exchange 邏輯（LINE OAuth 的核心）。
3. `jsonwebtoken` 8→9（API 差異很小，主要是移除了幾個不安全的預設演算法行為）。
4. **驗收標準**：手動走一次完整的 LINE 登入流程（前端導去 LINE 登入頁 → redirect 回來 → functions 換 token → 簽發 custom token → 前端登入成功並拿到使用者資料）。這條路徑沒有自動化測試，只能手動驗證，務必實際點過一輪再算完成。

**預期效益**：解決 request、hoek、jsonwebtoken、uuid、tough-cookie（functions 側）等約 10-13 個警告。

**建議**：跟 Phase 1 前後腳做，因為都會動到 `functions/index.js`，可以合併測試 OAuth 流程一次。

---

## Phase 3 — 建置工具鏈升級：`@vue/cli-service` 4 → 5（webpack 5）

**背景**：`webpack-dev-server`、`webpack-dev-middleware`、`http-proxy-middleware`、`svgo` 都是 `@vue/cli-service` 4.x 內建、只在本機開發伺服器（`npm run start:client`）用到，正式站的 `dist/client` 靜態檔案不受影響。風險相對低（除非開發機的 dev server 對外網暴露）。

**步驟**：
1. 讀 Vue CLI 5 官方 migration guide，注意 webpack 4→5 的 breaking change（node polyfill 行為改變、`eslint-loader` 停止維護要換成 `eslint-webpack-plugin`）。
2. 升級 `@vue/cli-service`、`@vue/cli-plugin-babel`、`@vue/cli-plugin-eslint` 到 `^5`。
3. 處理 `eslint-loader` → `eslint-webpack-plugin` 的替換。
4. `sass-loader`、postcss 相關 loader 版本可能要一併調整——這也會順便解決目前專案裡刻意讓 postcss 6/7/8 多版本共存的殘留警告。
5. 驗證：`npm run build:client`、`npm run lint`，再手動過一輪主要頁面（登入、球隊列表、比賽記錄、打席輸入這幾個核心流程）確認 UI 沒跑版、功能正常。

**預期效益**：解決 webpack-dev-server、webpack-dev-middleware、http-proxy-middleware、svgo、postcss 共約 15 個警告。

**風險**：機械式操作為主，但 webpack 5 的 module resolution 行為跟 4 有些差異（例如 Node core module 不再自動 polyfill），建置設定（[vue.config.js](vue.config.js)）可能要跟著調整。

---

## Phase 4（獨立專案，建議資源充裕時再排）— firebase JS SDK v8 → v10/v11

**背景**：root 的 `firebase` 套件卡在 8.10.1。官方最新是 v10+，API 從 namespaced（`firebase.auth()`）改成 modular（`import { getAuth } from 'firebase/auth'`），需要重寫 [src/firebase.js](src/firebase.js) 以及所有直接 `import firebase` 的地方（[src/store/root.js](src/store/root.js) 等）。

**建議做法**：先切到官方提供的 v9 compat 模式過渡（程式碼幾乎不用大改），穩定後再逐步遷移到 modular API，不要一次到位硬幹。

**影響範圍**：Auth、Firestore 即時監聽（`onSnapshot`）、Messaging 全部要重新測試，這是目前 app 最核心的資料層，務必抓一整段專門時間處理、排充分測試時間，**不要跟其他階段混在一起做**。

---

## Phase 5（長期規劃，先不排時程）— Vue 2 → Vue 3 遷移

**背景**：這是剩餘警告裡唯一「目前技術上真的無法修」的一項——Vue 2 已 EOL，有個 XSS 弱點官方只在 Vue 3 修了，這連帶讓幾乎所有 UI 元件庫都被標成「依賴有弱點的 vue」。

**牽涉範圍**：
- vuex 3→4（或改用 Pinia）
- vue-router 3→4
- 逐一確認目前用的每個 Vue2 專屬套件在 Vue3 是否有相容版本，沒有的話要找替代方案：`v-calendar`、`vue-select`、`vue-js-modal`、`vue-fragment`、`vue-qrcode-reader`、`simplebar-vue`、`v-tooltip`、`vuedraggable`、`vue-carousel-3d`、`vue-svg-gauge`、`vue-range-component`、`@johmun/vue-tags-input`、`@pencilpix/vue2-clock-picker`

**工作量**：等同於重寫一次前端框架層，建議另外開一個專案獨立規劃里程碑，不要當作日常安全性巡檢的「下一步」。

---

## 建議順序總結

1. **Phase 1**（最優先——Node 10 是營運風險，不只是安全分數）
2. **Phase 2**（緊接著做，同一支檔案、同一輪 OAuth 測試）
3. **Phase 3**（風險最低、機械式，可插空檔做）
4. **Phase 4**、**Phase 5** 各自獨立排專案，不要跟安全性巡檢混在一起

## 給下次接手的 AI 的提醒

- 開工前先重新查一次 https://github.com/wilsonhsu98/riverside-softball-club/security/dependabot 的即時數字（`gh api repos/wilsonhsu98/riverside-softball-club/dependabot/alerts --paginate`），因為每次 push 之後 GitHub 要重新掃描才會反映，本機看到的不是即時的。
- 每個階段做完都要：本機 `npm run build:client` + `npm run build:server` 成功、跑過對應的手動測試流程，才能 commit + push。
- Phase 1、2 會影響 production 的 Cloud Function，動之前先跟使用者確認要不要先在 Firebase 測試/預覽專案驗證過。
- 這份文件用完就更新，不要留舊數字誤導下一次接手的人（不論是 AI 還是人類）。

## 進度紀錄

- **2026-09-04 ~ 2026-09-07**：309 → 102 個警告。做了：axios 升到 0.33.0（官方 0.x 分支回溯安全修補，非大版號）、砍掉 root `package.json` 裡完全沒用到、疑似從 `functions/package.json` 複製過來的死重依賴（`firebase-admin`, `firebase-functions`, `cookie-parser`, `cors`, `http2`, `lottie-web`, `multer`, `request-promise`, `serverless-http`, `simple-oauth2`, `slugid`, `url`）、`npm update` 撿現有版本範圍內的修補、加了 `qs`/`tmp`/`decode-uri-component` 的 overrides。對應 commit：`160ec5c`、`d08ba03`。
