import { CARD_DEFINITIONS, VISUALS } from '../config/cards.ts'

export function preloadImages(urls: readonly string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image()
          let done = false
          const finish = () => {
            if (done) return
            done = true
            resolve()
          }
          image.onload = finish
          image.onerror = finish
          image.src = src
          if (image.complete) {
            finish()
          } else {
            window.setTimeout(finish, 0)
          }
        }),
    ),
  ).then(() => undefined)
}

export function preloadSiteAssets(): Promise<void> {
  return preloadImages([
    VISUALS.hero,
    VISUALS.banner,
    VISUALS.portal,
    ...CARD_DEFINITIONS.map((card) => card.src),
  ])
}
