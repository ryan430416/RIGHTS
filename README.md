# 權流・溯源｜學生權益週抽卡

現場用的純前端抽卡網站：開始抽卡 → 卡背翻牌召喚 → 顯示角色卡 → 確定回到首頁。

背景以 SVG／CSS 建立可響應重構的氛圍場景（尖拱、細光絲、門內深度），參考海報／橫幅／大背板僅作風格依據，**不會**當成整頁背景圖。

> 石材為程序漸層／裂紋／雜訊表現。若需要更接近印刷海報的真實石材質感，請提供無縫藍灰石材 albedo（與可選 normal）貼圖。

## 啟動預覽

```bash
npm install
npm run dev
```

## 正式建置

```bash
npm run build
npm run preview
```

## 替換角色卡

| 用途 | 路徑 |
| --- | --- |
| 守護騎士 (A) | `public/cards/card-a.png` |
| 巡境遊俠 (B) | `public/cards/card-b.png` |
| 解謎盜賊 (C) | `public/cards/card-c.png` |
| 知識法師 (D) | `public/cards/card-d.png` |

路徑與角色名稱集中在 `src/config/cards.ts`。

## 抽卡規則

每四抽為一輪，以 Fisher–Yates 洗牌，A／B／C／D 各出現一次。進度存在瀏覽器 `localStorage`，重新整理會接續，不會每天自動重置。
