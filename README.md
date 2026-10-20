# 權流・溯源｜學生權益週抽卡

現場用的純前端抽卡網站：開始抽卡 → 召喚動畫 → 顯示角色卡 → 確定回到首頁。

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

## 替換素材

| 用途 | 路徑 |
| --- | --- |
| 主視覺背景 | `public/visuals/hero.jpg` |
| 首頁側圖／傳送門 | `public/visuals/portal.jpg` |
| 橫幅（備用） | `public/visuals/banner.jpg` |
| 守護騎士 (A) | `public/cards/card-a.png` |
| 巡境遊俠 (B) | `public/cards/card-b.png` |
| 解謎盜賊 (C) | `public/cards/card-c.png` |
| 知識法師 (D) | `public/cards/card-d.png` |

路徑與角色名稱集中在 `src/config/cards.ts`。

## 抽卡規則

每四抽為一輪，以 Fisher–Yates 洗牌，A／B／C／D 各出現一次。進度存在瀏覽器 `localStorage`，重新整理會接續，不會每天自動重置。
