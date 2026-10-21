import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('previews')
await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const url = 'http://127.0.0.1:5173/'

async function shoot(name, viewport, isMobile = false) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.removeItem('rights-draw-tab-lock')
    localStorage.removeItem('rights-draw-progress-v2')
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => {
    const btn = document.querySelector('.action-button')
    return btn && !btn.disabled && btn.textContent?.includes('開始抽卡')
  })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(outDir, name), fullPage: false })
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.shell')
    const card = document.querySelector('.card-slot')
    const brand = document.querySelector('.brand-panel')
    const r = (el) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }
    }
    return {
      titles: [...document.querySelectorAll('h1')].map((el) => el.textContent),
      hasCross: Boolean(document.querySelector('.card-back-cross')),
      hasSigil: Boolean(document.querySelector('.card-back-sigil')),
      hasAtmosphere: Boolean(document.querySelector('.atmosphere')),
      hasCanvas3d: Boolean(document.querySelector('canvas')),
      heroImgs: [...document.images].filter((img) => /hero|portal|visuals/i.test(img.currentSrc)).map((i) => i.currentSrc),
      invite: Boolean(document.body.textContent?.includes('觸碰權流')),
      shell: r(shell),
      brand: r(brand),
      card: r(card),
      cardHRatio: card ? +(card.getBoundingClientRect().height / innerHeight).toFixed(3) : null,
      btnInView: (() => {
        const btn = document.querySelector('.action-button')
        if (!btn) return false
        const b = btn.getBoundingClientRect()
        return b.bottom <= innerHeight + 1 && b.top >= -1
      })(),
      scrollOk: document.documentElement.scrollWidth <= innerWidth + 1,
    }
  })
  console.log(name, metrics)
  await context.close()
}

await shoot('desktop-home.png', { width: 1440, height: 900 }, false)
await shoot('mobile-home.png', { width: 390, height: 844 }, true)

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.removeItem('rights-draw-tab-lock')
    localStorage.removeItem('rights-draw-progress-v2')
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelector('.action-button') && !document.querySelector('.action-button').disabled)
  await page.click('.action-button')
  await page.waitForFunction(() => document.querySelector('.arena-result'))
  await page.waitForTimeout(1900)
  await page.screenshot({ path: path.join(outDir, 'desktop-result.png'), fullPage: false })
  console.log('desktop-result.png ok')
  await context.close()
}

await browser.close()
console.log('done')
