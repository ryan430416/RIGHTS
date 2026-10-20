export type CharacterId = 'A' | 'B' | 'C' | 'D'

export type CardDefinition = {
  id: CharacterId
  src: string
  name: string
}

/**
 * 四張角色卡。之後替換圖片時改 src，或直接覆寫 public/cards/ 內同名檔案。
 */
export const CARD_DEFINITIONS: readonly CardDefinition[] = [
  { id: 'A', src: '/cards/card-a.png', name: '守護騎士' },
  { id: 'B', src: '/cards/card-b.png', name: '巡境遊俠' },
  { id: 'C', src: '/cards/card-c.png', name: '解謎盜賊' },
  { id: 'D', src: '/cards/card-d.png', name: '知識法師' },
]

/**
 * 活動主視覺路徑。之後可替換 public/visuals/ 內檔案，或改這裡的路徑。
 */
export const VISUALS = {
  hero: '/visuals/hero.jpg',
  banner: '/visuals/banner.jpg',
  portal: '/visuals/portal.jpg',
} as const

export const TITLE = {
  main: '權流・溯源',
  chinese: '溯其源・知其權',
  english: 'TRACE THE SOURCE. KNOW YOUR RIGHTS.',
} as const

export function cardById(id: CharacterId): CardDefinition {
  return CARD_DEFINITIONS.find((card) => card.id === id) ?? CARD_DEFINITIONS[0]!
}
