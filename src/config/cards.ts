export type CardDefinition = {
  id: string
  src: string
  label: string
}

/**
 * 四張正式卡片的圖片路徑。
 * 預設讀取 public/cards/ 裡的檔案；之後只要替換圖片，或改這裡的 src。
 */
export const CARD_DEFINITIONS: readonly CardDefinition[] = [
  { id: 'card-1', src: '/cards/card-1.png', label: '卡片1' },
  { id: 'card-2', src: '/cards/card-2.png', label: '卡片2' },
  { id: 'card-3', src: '/cards/card-3.png', label: '卡片3' },
  { id: 'card-4', src: '/cards/card-4.png', label: '卡片4' },
]
